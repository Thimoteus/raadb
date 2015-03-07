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

   beforeEach(function (done) {
      db.insert('collection', 'data', function (err, collection, docId) {
         if (err) return done(err);
         id = docId;
         done();
      });
   });

   it('should find a document based on id', function (done) {
      if (err) throw err;
      db.find('collection', id, function (err, doc) {
         docId = _.lines(doc.body)[0];
         assert.strictEqual(id, docId);
         done();
      });
   });

   it('should find a document based on a predicate', function (done) {
      var predicate;
      predicate = function predicate(doc) {
         return doc === 'data';
      };
      db.find('collection', predicate, function (err, docs) {
         assert.isAbove(docs.length, 0);
         done();
      });
   });
});
