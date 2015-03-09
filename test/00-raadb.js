var assert = require('chai').assert,
   Raadb = require('../build/raadb'),
   settings = require('../settings'),
   _ = require('molten-core'),
   db = new Raadb(settings.subreddit);

describe('createId', function () {
   it('should create unique IDs', function () {
      var id1, id2;

      id1 = db.createId();
      id2 = db.createId();

      assert.notEqual(id1, id2);
   });
});

describe('docId', function () {
   it('should return the ID of a document object', function () {
      var doc;

      doc = {
         body: 'abcdefg\nhijklmnop'
      };

      assert.equal(db.docId(doc), 'abcdefg');
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
      encodedData = _.encode64(JSON.stringify(data));
      doc = {
         body: _.unlines(['this_is_my_id', encodedData])
      };

      assert.propertyVal(db.docData(doc), 'nuclearLaunchCode', 1234);
   });
});
