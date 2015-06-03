// Reddit As A DataBase
// Version: 0.4.0

var _ = require('molten-core'),
   getDbEndpt, getListing, createComment, createSelfText,
   getCommentsFromPost, deleteThing, editComment,
   verbose = true,
   Raadb, print, say, docId, docData, encodeDoc, collectionsExist,
   createCollection, collToCollection, insert, find, remove, update;

print = function print(it) {
   console.log(it);
   return it;
};
say = function say(it) {
   if (verbose) return print(it);
};

// database metafunctions
// asynchronous functions here are not exposed by the raadb api

docId = function docId(doc) {
   // returns the id of a doc
   return doc.name;
};

docData = function docData(doc) {
   // returns the data of a doc
   var data;
   data = doc.body;
   return JSON.parse(_.decode64(data));
};

encodeDoc = function encodeDoc(doc) {
   // encodes a string, boolean, object, array ...
   return _.encode64(JSON.stringify(doc));
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
   callback = function callback(err, listing) {
      var f, xs;

      if (err || !listing) {
         return cb(new Error('Could not contact reddit'));
      }

      f = function f(x) {
         return _.includes(colls, x.title);
      };
      xs = _.filter(f, listing);

      return cb(null, xs);
   };

   return getListing(endpt, opts, callback);
};

createCollection = function createCollection(db, coll, cb) {
   // Takes a string `db`, string `coll` and function `cb` and creates a new
   // collection in db, then calls cb.
   var callback, description;

   print('creating new collection ' + coll);

   description = 'This is a collection for ' +
      '[reddit as a database](https://www.github.com/thimoteus/raadb).';
   callback = function callback(err, bod) {
      if (err || !bod) {
         return cb(new Error('Could not contact reddit'));
      }

      return cb(null, bod);
   };

   return createSelfText(db, coll, description, callback);
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

      returnsStumpyCollection = function returnsStumpyCollection(err, bod) {
         var stumpyCollection = JSON.parse(bod).json.data;
         cb(err, stumpyCollection);
      };

      if (colls.length === 0 && !!create) {
         createCollection(db, coll, returnsStumpyCollection);
      } else if (colls.length > 0) {
         cb(null, colls[0]);
      } else {
         cb(new Error('Collection ' + coll + ' doesn\'t exist'));
      }
   };

   return collectionsExist(db, [coll], callback);
};

// database functions
// these are all exposed by the raadb api

insert = function insert(db, coll, doc, cb) {
   // Takes string `db`, string `coll`, any `doc` and function `cb`.
   // If there's a collection referred to by `coll`, will insert `doc` into
   // that collection. Otherwise, will create a collection and then do the
   // insertion, and calls the callback with the collection and doc id.
   var _insert;
   if (cb === undefined) cb = _.id;

   print("inserting new doc into " + coll + ":");
   print(doc);

   _insert = function _insert(err, collection) {
      var hash, callback;
      if (err) return cb(err);

      hash = encodeDoc(doc);
      callback = function callback(err, bod) {
         var docId;
         if (err || !bod) {
            return cb(new Error('Could not contact reddit'));
         }

         docId = JSON.parse(bod).json.data.things[0].data.name;
         return cb(null, collection, docId);
      };

      return createComment(collection, hash, callback);
   };

   return collToCollection(db, coll, true, _insert);
};

find = function find(db, coll, query, cb) {
   // Takes a string `db`, string `coll`, string/function `query`, and function
   // `cb`. If `query` is a string, will look for documents in the collection
   // such that their id equals `query`. If `query` is a function, will look
   // for all docs such that `query(doc)` is truthy.
   // `cb` accepts two arguments, an error and an array of docs/doc, depending on
   // query.
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
      return getCommentsFromPost(db, collection, function (err, docs) {
         var matches;

         matches = _.filter(_query, docs);

         if (_.isType('String', query)) return cb(null, matches[0]);
         return cb(null, matches);
      });
   };

   return collToCollection(db, coll, false, _find);
};

remove = function remove(db, coll, query, cb) {
   // Takes a string `db`, string `coll`, string/function `query`, and function
   // `cb`. Deletes any documents matching `query`. See the `find` method for more
   // details on `query`. `cb` is a function that only takes a possible error.
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
      return cb(null);
   };

   return find(db, coll, query, _remove);
};

update = function update(db, coll, query, data, cb) {
   // Takes a string `db`, string `coll`, string/function `query`, string/function
   // `data`, function `cb`. Modifies any documents matching `query` by `data`. If
   // `data` isn't a function, will replace the document's data with `data`.
   // Otherwise will replace the document's data by applying `data` to it.
   // Callback only takes a possible error.
   var _update, _data, updateEach;

   if (!_.isType('Function', data)) {
      _data = function _data(doc) {
         return encodeDoc(data);
      };
   } else {
      _data = function _data(doc) {
         return encodeDoc(data(docData(doc)));
      };
   }

   _update = function update(err, matches) {
      if (err) return cb(err);
      if (matches.length) {
         updateEach = function updateEach(doc) {
            editComment(doc, _data(doc));
         };
         _.map2(updateEach, matches);
      } else {
         editComment(matches, _data(matches));
      }
      return cb(null);
   };

   return find(db, coll, query, _update);
};

module.exports = function Raadb(opts) {
   // takes a subreddit, then exposes the raadb api
   var db = opts.database,
      mid = new (require('./middleware'))(opts);

   if (opts.jaraw) {
     mid.init(opts.jaraw);
   } else {
     mid.init();
   }

   getDbEndpt = mid.getDbEndpt;
   getListing = mid.getListing;
   createComment = mid.createComment;
   createSelfText = mid.createSelfText;
   getCommentsFromPost = mid.getCommentsFromPost;
   deleteThing = mid.deleteThing;
   editComment = mid.editComment;

   this.docId = docId;
   this.docData = docData;
   this.encodeDoc = encodeDoc;

   // db manipulations
   this.insert = _.curry(insert)(db);
   this.find = _.curry(find)(db);
   this.remove = _.curry(remove)(db);
   this.update = _.curry(update)(db);
};
