var assert = require('chai').assert,
   Raadb = require('../build/raadb'),
   settings = require('../settings'),
   _ = require('molten-core'),
   db = new Raadb(settings.subreddit);

describe('insert', function () {
   this.timeout(0);

   it('should insert a document into a collection', function (done) {
      db.insert('collection', 'data', function (err, collection, docId) {
         if (err) throw err;
         assert.property(collection, 'url');
         assert.include(collection.url, settings.subreddit);
         assert.isString(docId);
         done();
      });
   });
});

describe('find', function () {
   var id;
   this.timeout(0);

   before(function (done) {
      db.insert('collection', 'data', function (err, collection, docId) {
         if (err) return done(err);
         id = docId;
         done();
      });
   });

   it('should find a document based on id', function (done) {
      db.find('collection', id, function (err, doc) {
         if (err) throw err;
         docId = db.docId(doc);
         assert.strictEqual(id, docId);
         done();
      });
   });

   it('should find a document based on a predicate', function (done) {
      var predicate;
      predicate = function predicate(doc) {
         return db.docData(doc) === 'data';
      };
      db.find('collection', predicate, function (err, docs) {
         assert.isAbove(docs.length, 0);
         done();
      });
   });

   it('should return an error with a nonexisting database', function (done) {
      db.find('bollection', _.id, function (err, doc) {
         assert.isNotNull(err);
         done();
      });
   });
});
