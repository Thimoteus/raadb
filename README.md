# reddit as a database [![David](https://img.shields.io/david/thimoteus/raadb.svg?style=flat-square)](https://david-dm.org/thimoteus/raadb) [![David](https://img.shields.io/david/dev/thimoteus/raadb.svg?style=flat-square)](https://david-dm.org/thimoteus/raadb#info=devDependencies&view=table)

## About

raadb is an npm module that uses a subreddit as a data store.
If you have any way of using a real database, you are strongly encouraged to do so.

Otherwise, read on!

Much of raadb's syntax is inspired by mongo.
It treats subreddits as databases, and selftext submissions as collections.
Documents are comment replies to collections, therefore, inserting a document into a collection is nothing more than submitting a comment to a selftext post in a subreddit.

Every document and collection has a base 36 id, which is supplied by reddit.
Document data is a base 64 encoding of a `JSON.stringify`ed *something*.
That *something* can be anything that can successfully be `JSON.stringify`ed, i.e. an object, an array, a string, a boolean, a number, ...
Just note that prototypes are passed over when serializing to JSON.

## Usage

`npm install thimoteus/raadb`

```javascript
var settings = {
   "username": "your reddit username",
   "password": "your reddit password",
   "id": "your app's client id",
   "secret": "your app's client secret",
   "database": "your subreddit to be used as a database",
   "userAgent": "a string to identify your app"
};
var Raadb = require('raadb');
var db = new Raadb(settings);
```

### Requirements

1. A subreddit you have moderator access to.
It should probably be private.
2. A [script app](https://www.reddit.com/prefs/apps/).
3. npm and node/iojs

### Things to look out for

1. As of this release, raadb will only take the first 100 posts in a subreddit.
This means that if you have, for example, 101 collections in your database and try to insert a document to the 101st, raadb will instead create a new, empty collection and insert the document into that.
As a result, you will now have 102 collections.
2. Sometimes, reddit goes through periods where > 50% of requests end in a 503 status code.
3. The reddit API limits oauth access to an average of 60 calls/minute.
The api wrapper used by raadb enforces a *maximum* of 1 call/second.

## API

### docId
```javascript
docId(Object:doc);
```

Returns the ID of a document. `doc` is a reddit Thing.

### docData
```javascript
docData(Object:doc);
```

Returns the decoded document data. `doc` is a reddit Thing.

### insert
```javascript
insert(String:coll, Object:doc, Function:cb);
```

Inserts `doc` into the collection represented by `coll`, then calls the callback `cb`.

`cb` takes three arguments, an error, an Object collection representing a reddit Thing, and a String representing the id of `doc`.

### find
```javascript
find(String:coll, String/Function:query, Function:cb);
```

Searches collection for documents matching `query`.

If `query` is a string, searches for documents with that as an ID.
If `query` is a function, searches for documents that return truthy values
when query is applied to their data.

`cb` takes an error and either a document (if `query` represents an ID) or an array of documents (if `query` is a function).

Example:
```javascript
db.find('people', function query(person) { return person.name === 'Larry'; }, console.log);
```

### remove
```javascript
remove(String:coll, String/Function:query, Function:cb);
```

Deletes all documents in the collection matching query. Arguments are the same as for `find`.

### update
```javascript
update(String:coll, String/Function:query, String/Function:data, Function:cb);
```

Modifies any documents matching `query` by `data`.
If `data` isn't a function, will replace the document's data with `data`.
Otherwise will replace the document's data by applying `data` to it.

Example:
```javascript
db.update(
   'people',
   function query(person) { return person.name === 'Larry'; },
   function data(person) { person.name = 'Moe'; return person; },
   function cb(err) { if (err) throw err; console.log('All Larries are now Moes!') }
   );
```

## Contributing

1. `git clone https://github.com/thimoteus/raadb.git`
2. `cd raadb`
3. `npm install`

To run tests, run `grunt test`.

There are some coding conventions.
Many functions deal with collections in different ways; a variable named `coll` will always refer to a string referring to the collection's (equivalently, selftext post's) title. `colls` refers to an array of `coll`s. `collection` refers to a reddit [thing](https://www.reddit.com/dev/api#fullnames).

## License

Copyright © 2015 Thimoteus

This work is free. You can redistribute it and/or modify it under the
terms of the Do What The Fuck You Want To Public License, Version 2,
as published by Sam Hocevar. See the LICENSE file for more details.
