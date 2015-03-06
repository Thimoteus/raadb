var assert = require('chai').assert,
   Raadb = require('../build/raadb'),
   settings = require('../settings'),
   db = new Raadb(settings.subreddit);

describe('insert', function () {
   this.timeout(0);
   it('should create a new comment in a thread', function (done) {
      db.insert('collection', 'data', function (err, collection, docId) {
         if (err) throw err;
         assert.property(collection, 'url');
         assert.include(collection.url, settings.subreddit);
         done();
      });
   });
});
