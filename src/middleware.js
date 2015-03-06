// Reddit As A DataBase
// Version: 0.1.0

var settings = require('../settings'),
   Jaraw = require('jaraw'),
   _ = require('molten-core');

var jaraw = new Jaraw({
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

var getListing = function (endpt, params, cb) {
   // Takes an endpoint, parameters and callback.
   // The endpoint must return a 'listing' response from reddit.
   // Returns an array of objects in the listing.
   if (_.isType('Function', params)) {
      cb = params;
      params = {};
   }
   var listify = function (x) {
      return _.map(function (y) { return y.data; }, JSON.parse(x).data.children);
   };
   var callback = function (err, res, bod) {
      return cb(err, res, listify(bod));
   };
   return jaraw.get(endpt, params, callback);
};

var getDbEndpt = function (db) {
   return '/r/' + db + '.json';
};

var createComment = function (thing, msg, cb) {
   // Takes a `thing` object, `msg` string and `cb` function.
   // Replies to `thing` with `msg`, then calls `cb`.
   if (cb === undefined) cb = _.id;
   var endpt = '/api/comment';
   var opts = {
      api_type: 'json',
      thing_id: thing.name,
      text: msg
   };
   return jaraw.post(endpt, opts, cb);
};

var createSelfText = function (sr, title, body, cb) {
   if (cb === undefined) cb = _.id;
   var endpt = '/api/submit';
   var opts = {
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

module.exports = {
   getListing: getListing,
   getDbEndpt: getDbEndpt,
   createComment: createComment,
   createSelfText: createSelfText
};
