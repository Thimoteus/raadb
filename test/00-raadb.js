var assert = require('chai').assert,
   Raadb = require('../src/raadb'),
   settings = require('../settings'),
   _ = require('molten-core'),
   db = new Raadb(settings);

exports.db = db;

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
         name: 'abcdefg',
         body: 'hijklmnop'
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
         body: db.encodeDoc(data)
      };

      assert.propertyVal(db.docData(doc), 'nuclearLaunchCode', 1234);
   });
});
