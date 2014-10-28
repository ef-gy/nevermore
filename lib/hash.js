var hashFunction = 'sha256';

var fs = require('graceful-fs');
var crypto = require('crypto');

function withHash (file, callback) {
  var hash = crypto.createHash(hashFunction);
  var fd = fs.createReadStream(file);
  hash.setEncoding('base64');

  fd.on('end', function() {
    hash.end();
    callback(hash.read().replace(/\//g,'-'));
  });

  fd.pipe(hash);
}

function withHashNoSymlink (file, callback) {
  fs.lstat(file, function(error, stats) {
    if (!error && !stats.isSymbolicLink()) {
      return withHash(file, callback);
    }
  });
}

module.exports = {
  'algorithm': hashFunction,
  'with': withHash,
  'withNoSymlink': withHashNoSymlink
};
