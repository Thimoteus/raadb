
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
