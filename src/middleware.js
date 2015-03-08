// Reddit As A DataBase
// Version: 0.1.0

var settings = require('../settings'),
   Jaraw = require('jaraw'),
   _ = require('molten-core'),
   jaraw, getListing, getDbEndpt, createComment, createSelfText,
   getCommentsFromPost;

jaraw = new Jaraw({
   type: "script",
   login: {
      username: settings.username,
      password: settings.password
   },
   oauth: {
      id: settings.id,
      secret: settings.secret
   },
   user_agent: settings.userAgent,
   rate_limit: 1000
});

getListing = function getListing(endpt, params, cb) {
   // Takes an endpoint, parameters and callback.
   // The endpoint must return a 'listing' response from reddit.
   // Returns an array of objects in the listing.
   var listify, callback;
   if (_.isType('Function', params)) {
      cb = params;
      params = {};
   }
   listify = function listify(x) {
      return _.map(function (y) { return y.data; }, JSON.parse(x).data.children);
   };
   callback = function callback(err, res, bod) {
      return cb(err, res, listify(bod));
   };
   return jaraw.get(endpt, params, callback);
};

getDbEndpt = function getDbEndpt(db) {
   return '/r/' + db + '.json';
};

createComment = function createComment(thing, msg, cb) {
   // Takes a `thing` object, `msg` string and `cb` function.
   // Replies to `thing` with `msg`, then calls `cb`.
   var endpt, opts;
   if (cb === undefined) cb = _.id;
   endpt = '/api/comment';
   opts = {
      api_type: 'json',
      thing_id: thing.name,
      text: msg
   };
   return jaraw.post(endpt, opts, cb);
};

createSelfText = function createSelfText(sr, title, body, cb) {
   var endpt, opts;
   if (cb === undefined) cb = _.id;
   endpt = '/api/submit';
   opts = {
      api_type: 'json',
      kind: 'self',
      resubmit: true,
      sendreplies: false,
      sr: sr,
      text: body,
      then: 'comments',
      title: title
   };
   jaraw.post(endpt, opts, cb);
};

getCommentsFromPost = function getCommentsFromPost(sr, post, cb) {
   var endpt, opts, callback;

   endpt = '/r/' + sr + '/comments/' + post.id + '.json';
   opts = {
      limit: 500
   };
   callback = function callback(err, res, bod) {
      if (err || !res || (res.statusCode != 200) || !bod) {
         return cb(new Error('Could not contact reddit'));
      }
      comments = _.map(function (thing) { return thing.data; },
         JSON.parse(bod)[1].data.children);
      return cb(err, comments);
   };
   jaraw.get(endpt, opts, callback);
};

module.exports = {
   jaraw: jaraw,
   getListing: getListing,
   getDbEndpt: getDbEndpt,
   createComment: createComment,
   createSelfText: createSelfText,
   getCommentsFromPost: getCommentsFromPost
};
