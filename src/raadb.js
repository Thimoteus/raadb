// Reddit As A DataBase
// Version: 0.1.0

var _ = require('molten-core'),
   mid = require('./middleware'),
   getDbEndpt = mid.getDbEndpt,
   getListing = mid.getListing,
   createComment = mid.createComment,
   createSelfText = mid.createSelfText,
   verbose = true;

var print = function (it) {
   console.log(it);
   return it;
};
var say = function (it) {
   if (verbose) print(it);
};

// database metafunctions
// these are not exposed by the raadb api
var createId = function () {
   return Date.now().toString(36);
};

var collectionsExist = function (db, colls, cb) {
   // Takes an array of collections and a callback.
   // Callback is a function that takes a possible error,
   // response object and an array.
   var endpt = getDbEndpt(db);
   var opts = {
      limit: 100
   };
   var callback = function (err, res, listing) {
      if (err || !res || (res.statusCode != 200) || !listing) {
         return cb(new Error('Could not contact reddit'));
      }
      var f = function (x) {
         return _.includes(colls, x.title);
      };
      var xs = _.filter(f, listing);
      return cb(err, xs);
   };
   getListing(endpt, opts, callback);
};

var createCollection = function (db, coll, cb) {
   // Takes a string `db`, string `coll` and function `cb` and creates a new
   // collection in db, then calls cb.

   var id = createId();
   createSelfText(db, coll, id, cb);
};

var getCollFromStr = function (db, coll, cb) {
   // Takes a string `db`, string `coll` and function `cb`.
   // If `coll` doesn't refer to an existing collection, creates one,
   // then calls itself. Otherwise, calls `cb` with possible error, response
   // object and collection.

   var callback = function (err, colls) {
      if (err) return cb(err);

      var returnsStumpyCollection = function (err, res, bod) {
         var stumpyCollection = JSON.parse(bod).json.data;
         cb(err, stumpyCollection);
      };

      if (colls.length === 0) {
         createCollection(db, coll, returnsStumpyCollection);
      } else {
         cb(err, colls[0]);
      }
   };

   collectionsExist(db, [coll], callback);
};

// database functions
// these are all exposed by the raadb api

// Takes string `db`, string `coll`, any `doc` and function `cb`.
// If there's a collection referred to by `coll`, will insert `doc` into
// that collection. Otherwise, will create a collection and then do the
// insertion, and calls the callback with the doc id.
var insert = function (db, coll, doc, cb) {
   if (cb === undefined) cb = _.id;
   print("inserting new doc into " + coll + ":");
   print(doc);

   var _insert = function (err, collection) {
      if (err) return cb(err);

      var docId = createId();
      var docData = _.encode64(JSON.stringify(doc));
      var hash = _.unlines([docId, docData]);
      createComment(collection, hash);
      cb(err, docId);
   };

   getCollFromStr(db, coll, _insert);
};

var raadb = function (db) {
   // takes a subreddit, then exposes the raadb api

   this.insert = _.curry(insert)(db);
};

module.exports = raadb;
