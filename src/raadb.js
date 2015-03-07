// Reddit As A DataBase
// Version: 0.1.0

var _ = require('molten-core'),
   mid = require('./middleware'),
   getDbEndpt = mid.getDbEndpt,
   getListing = mid.getListing,
   createComment = mid.createComment,
   createSelfText = mid.createSelfText,
   verbose = true,
   Raadb, print, say, createId, collectionsExist, createCollection,
   getCollFromStr, insert, find;

print = function print(it) {
   console.log(it);
   return it;
};
say = function say(it) {
   if (verbose) print(it);
};

// database metafunctions
// these are not exposed by the raadb api
createId = function createId() {
   return Date.now().toString(36);
};

collectionsExist = function collectionsExist(db, colls, cb) {
   // Takes an array of collections and a callback.
   // Callback is a function that takes a possible error,
   // response object and an array.
   var endpt, opts, callback;

   endpt = getDbEndpt(db);
   opts = {
      limit: 100
   };
   callback = function callback(err, res, listing) {
      var f, xs;

      if (err || !res || (res.statusCode != 200) || !listing) {
         return cb(new Error('Could not contact reddit'));
      }

      f = function f(x) {
         return _.includes(colls, x.title);
      };
      xs = _.filter(f, listing);

      return cb(err, xs);
   };

   getListing(endpt, opts, callback);
};

createCollection = function createCollection(db, coll, cb) {
   // Takes a string `db`, string `coll` and function `cb` and creates a new
   // collection in db, then calls cb.
   var id;

   id = createId();
   createSelfText(db, coll, id, cb);
};

getCollFromStr = function getCollFromStr(db, coll, cb) {
   // Takes a string `db`, string `coll` and function `cb`.
   // If `coll` doesn't refer to an existing collection, creates one,
   // then calls itself. Otherwise, calls `cb` with possible error, response
   // object and collection.
   var callback;

   callback = function callback(err, colls) {
      var returnsStumpyCollection;
      if (err) return cb(err);

      returnsStumpyCollection = function returnsStumpyCollection(err, res, bod) {
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
// insertion, and calls the callback with the collection and doc id.
insert = function insert(db, coll, doc, cb) {
   var _insert;
   if (cb === undefined) cb = _.id;

   print("inserting new doc into " + coll + ":");
   print(doc);

   _insert = function _insert(err, collection) {
      var docId, docData, hash;
      if (err) return cb(err);

      docId = createId();
      docData = _.encode64(JSON.stringify(doc));
      hash = _.unlines([docId, docData]);

      createComment(collection, hash);
      cb(err, collection, docId);
   };

   getCollFromStr(db, coll, _insert);
};

// Takes a string `db`, string `coll`, string/function `query`, and function
// `cb`. If `query` is a string, will look for documents in the collection
// such that their id equals `query`. If `query` is a function, will look
// for all docs such that `query(doc)` is truthy.
// `cb` accepts two arguments, an error and an array.
find = function find(db, coll, query, cb) {
   if (_.isType('String', query)) {
      // stuff
   } else if (_.isType('Function', query)) {
      // stuff
   } else {
      throw new Error('query must be a string or a predicate');
   }
}

Raadb = function Raadb(db) {
   // takes a subreddit, then exposes the raadb api

   this.insert = _.curry(insert)(db);
};

module.exports = Raadb;
