# reddit as a database

## About

raadb is an npm module that uses a subreddit as a data store.
If you have any way of using a real database, you are strongly encouraged to do so.

Otherwise, read on!

Much of raadb's syntax is inspired by mongo.
It treats subreddits as databases, and selftext submissions as collections.
Documents are comment replies to collections, therefore, inserting a document into a collection is nothing more than submitting a comment to a selftext post in a subreddit.

Every document and collection has a base 36 id, which is always the first line in the body of the document/collection.
In the case of collections, the ID is the only line in the body.
For documents, the second line is a base 64 encoding of a `JSON.stringify`ed *something*.
That *something* can be anything that can successfully be `JSON.stringify`ed, i.e. an object, an array, a string, a boolean, a number, ...
Just note that prototypes are passed over when serializing to JSON.

## Usage

`npm install thimoteus/raadb`

```javascript
var Raadb = require('raadb');
var db = new Raadb('personal_database_subreddit');
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

```javascript
insert(String:coll, Object:doc, Function:cb);
```

Inserts `doc` into the collection represented by `coll`, then calls the callback `cb`.

`cb` takes two arguments, an error and a string representing the id of `doc`.

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
