var assert = require('chai').assert,
   Raadb = require('../src/raadb'),
   settings = require('../settings'),
   _ = require('molten-core'),
   db = new Raadb(settings.subreddit);

exports.db = db;

describe('createId', function () {
   it('should create unique IDs', function () {
      var id1, id2;

      id1 = db.createId();
      id2 = db.createId();

      assert.notEqual(id1, id2);
   });
});

describe('encodeDoc', function () {
   it('should correctly encode various types', function () {
      assert.strictEqual('dHJ1ZQ==', db.encodeDoc(true));
      assert.strictEqual('WyJhIiwiYiIsImMiLCJkIl0=', db.encodeDoc([ 'a', 'b', 'c', 'd' ]));
      assert.strictEqual('eyJ0eXBlIjoia2l0dGVuIiwibmFtZSI6InNudWZmbGVzIn0=',
         db.encodeDoc({type: 'kitten', name: 'snuffles'}));
   });
});

describe('docId', function () {
   it('should return the ID of a document object', function () {
      var doc;

      doc = {
         body: 'abcdefg\nhijklmnop'
      };

      assert.strictEqual(db.docId(doc), 'abcdefg');
   });
});

describe('docData', function () {
   it('should return the data in a doc, decoded', function () {
      var data, encodedData, doc;

      data = {
         title: 'President',
         clearance: 'Top Secret',
         nuclearLaunchCode: 1234
      };
      doc = {
         body: _.unlines(['this_is_my_id', db.encodeDoc(data)])
      };

      assert.propertyVal(db.docData(doc), 'nuclearLaunchCode', 1234);
   });
});

describe('createDoc', function () {
   it('should return a string with id and doc data', function () {
      var id, data;

      id = db.createId();
      data = { strikes: 2, balls: 3, battingAverage: 0.22 };
      assert.strictEqual(db.createDoc(id, data), id + '\n' + _.encode64(JSON.stringify(data)));
   });
});
