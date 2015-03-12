var assert = require('chai').assert,
   settings = require('../settings'),
   _ = require('molten-core'),
   db = require('./00-raadb').db;

describe('remove', function () {
   this.timeout(10000);

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

   after(function (done) {
      db.removeCollection('collection', done);
   });
});
