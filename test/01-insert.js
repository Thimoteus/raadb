var assert = require('chai').assert,
   settings = require('../settings'),
   _ = require('molten-core'),
   db = require('./00-raadb').db;

describe('insert', function () {
   this.timeout(10000);

   it('should insert a document into a collection', function (done) {
      db.insert('collection', 'data', function (err, collection, docId) {
         if (err) throw err;
         assert.property(collection, 'url');
         assert.include(collection.url, settings.database);
         assert.isString(docId);
         done();
      });
   });
});
