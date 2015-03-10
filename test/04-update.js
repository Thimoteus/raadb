var assert = require('chai').assert,
   settings = require('../settings'),
   _ = require('molten-core'),
   db = require('./00-raadb').db;

describe('update', function () {
   var id;
   this.timeout(0);

   before(function (done) {
      db.insert('collection', 'data to be edited', function insert(err, collection, docId) {
         if (err) throw err;
         id = docId;
         db.update('collection', docId, 'edited data', function update(err) {
            if (err) throw err;
            done();
         });
      });
   });

   it('should update a document with new data', function (done) {
      db.find('collection', id, function update(err, doc) {
         if (err) done(err);

         assert.strictEqual(db.docData(doc), 'edited data');
         done();
      });
   });
});
