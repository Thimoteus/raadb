var assert = require('chai').assert,
   Raadb = require('../build/raadb'),
   settings = require('../settings'),
   _ = require('molten-core'),
   db = new Raadb(settings.subreddit);

describe('remove', function () {
   this.timeout(0);

   before(function (done) {
      db.remove('collection', _.id, done);
   });

   it('should remove documents from a collection', function (done) {
      db.find('collection', _.id, function (err, docs) {
         if (err) done(err);
         assert.strictEqual(0, docs.length);
         done();
      });
   });
});
