#!/usr/bin/nodejs

var operation = process.argv[2];
var operands  = process.argv.slice(3);

var hash  = require('../lib/hash');
var store = require('../lib/store');

var ops = {
  'hash': {
    'f': function(operands) {
      operands.forEach(function(file) {
        hash.with(file, function(hash){
          console.log(file,'~',hash);
        });
      });
    },
    'arguments': [ '[files ...]' ],
    'description': 'hash all operands and output the result to stdout'
  },
  'store': {
    'f': store.store,
    'arguments': [ 'datastore', '[files ...]' ],
    'desscription': 'store all files in the given datastore; create symlinks from source files'
  }
}

for (i in ops) {
  if (operation === i) {
    ops[i].f(operands);
  }
}
