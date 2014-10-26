#!/usr/bin/nodejs

var operation = process.argv[2];
var operands  = process.argv.slice(3);

var hashFunction = 'sha256';

var fs = require('fs');
var crypto = require('crypto');

function withHash (file, callback) {
  var hash = crypto.createHash(hashFunction);
  var fd = fs.createReadStream(file);
  hash.setEncoding('base64');

  fd.on('end', function() {
    hash.end();
    callback(hash.read().replace('/','-'));
  });

  fd.pipe(hash);
}

function splitHash(hash) {
  return hashFunction + '/'
       + hash.slice(0,2) + '/'
       + hash.slice(2,4) + '/'
       + hash.slice(4);
}

var ops = {
  'hash': {
    'f': function(operands) {
      operands.forEach(function(file) {
        withHash(file, function(hash){
          console.log(file,'~',hash);
        });
      });
    },
    'arguments': [ '[files ...]' ],
    'description': 'hash all operands and output the result to stdout'
  },
  'store': {
    'f': function(operands) {
      var datastore = operands[0];
      operands.slice(1).forEach(function(file) {
        withHash(file, function(hash){
          var target = datastore
                     + '/.neverstore/'
                     + splitHash(hash);
          console.log(file,'->',target);
        });
      });
    },
    'arguments': [ 'datastore', '[files ...]' ],
    'desscription': 'store all files in the given datastore; create symlinks from source files'
  }
}

for (i in ops) {
  if (operation === i) {
    ops[i].f(operands);
  }
}
