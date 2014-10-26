#!/usr/bin/nodejs

var operation = process.argv[2];
var operands  = process.argv.slice(3);

var hashFunction = 'sha256';

var fs = require('fs');
var crypto = require('crypto');

function withHash (file, callback) {
  var hash = crypto.createHash(hashFunction);
  var fd = fs.createReadStream(file);
  hash.setEncoding('hex');

  fd.on('end', function() {
    hash.end();
    callback(hash.read());
  });

  fd.pipe(hash);
}

if (operation === 'hash')
{
  operands.forEach(function(file) {
    withHash(file, function(hash){
      console.log(file,'~',hash);
    });
  });
}
