var assert = require('chai').assert,
   settings = require('../settings'),
   _ = require('molten-core'),
   db = require('./00-raadb').db;

describe('update with function', function () {
  var id;
  this.timeout(10000);

  before(function (done) {
    db.insert('collection', { 'data': "to be edited" }, function insert(err, collection, docId) {
      if (err) throw err;
      id = docId;
      db.update('collection', docId, function (o) { o.data = "is now edited"; return o; }, function update(err) {
        if (err) throw err;
        done();
      });
    });
  });

  it('should update a document using a function', function (done) {
    db.find('collection', id, function update(err, doc) {
      if (err) done(err);

      assert.propertyVal(db.docData(doc), 'data', "is now edited");
      done();
    });
  });
});
