// Reddit As A DataBase
// Version: 0.1.0

var _ = require('molten-core'),
   mid = require('./middleware'),
   getDbEndpt = mid.getDbEndpt,
   getListing = mid.getListing,
   createComment = mid.createComment,
   createSelfText = mid.createSelfText,
   getCommentsFromPost = mid.getCommentsFromPost,
   deleteThing = mid.deleteThing,
   verbose = true,
   Raadb, print, say, createId, docId, docData, collectionsExist,
   createCollection, collToCollection, insert, find, remove;

print = function print(it) {
   console.log(it);
   return it;
};
say = function say(it) {
   if (verbose) print(it);
};

// database metafunctions
// these are not exposed by the raadb api

// creates a base 36 id
createId = function createId() {
   var now, rnd;
   now = Date.now().toString(36);
   rnd = Math.random();
   rnd = rnd.toString(36);
   rnd = _.Str.drop(2, rnd);
   return now + rnd;
};

// returns the id of a doc
docId = function docId(doc) {
   return _.lines(doc.body)[0];
};

// returns the data of a doc
docData = function docData(doc) {
   data = _.lines(doc.body)[1];
   return JSON.parse(_.decode64(data));
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

collToCollection = function collToCollection(db, coll, create, cb) {
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

      if (colls.length === 0 && !!create) {
         createCollection(db, coll, returnsStumpyCollection);
      } else if (colls.length > 0) {
         cb(err, colls[0]);
      } else {
         cb(new Error('Collection ' + coll + ' doesn\'t exist'));
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

   collToCollection(db, coll, true, _insert);
};

// Takes a string `db`, string `coll`, string/function `query`, and function
// `cb`. If `query` is a string, will look for documents in the collection
// such that their id equals `query`. If `query` is a function, will look
// for all docs such that `query(doc)` is truthy.
// `cb` accepts two arguments, an error and an array.
find = function find(db, coll, query, cb) {
   var _find, _query;

   if (_.isType('String', query)) {
      _query = function (doc) {
         return docId(doc) === query;
      };
   } else if (_.isType('Function', query)) {
      _query = query;
   } else {
      throw new Error('query must be a string or a predicate');
   }

   _find = function _find(err, collection) {
      if (err) return cb(err);
      getCommentsFromPost(db, collection, function (err, docs) {
         var matches;

         matches = _.filter(_query, docs);

         if (_.isType('String', query)) return cb(err, matches[0]);
         return cb(err, matches);
      });
   };

   collToCollection(db, coll, false, _find);
};

// Takes a string `db`, string `coll`, string/function `query`, and function
// `cb`. Deletes any documents matching `query`. See the `find` method for more
// details on `query`. `cb` is a function that only takes a possible error.
remove = function remove(db, coll, query, cb) {
   var _remove;

   _remove = function _remove(err, docs) {
      if (err) return cb(err);
      if (docs.length) {
         _.map(function removeEach(doc) {
            return deleteThing(doc);
         }, docs);
      } else {
         deleteThing(docs);
      }
      return cb(err);
   };

   find(db, coll, query, _remove);
};

Raadb = function Raadb(db) {
   // takes a subreddit, then exposes the raadb api

   this.createId = createId;
   this.docId = docId;
   this.docData = docData;
   // db manipulations
   this.insert = _.curry(insert)(db);
   this.find = _.curry(find)(db);
   this.remove = _.curry(remove)(db);
};

module.exports = Raadb;
