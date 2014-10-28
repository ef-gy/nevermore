var hash = require('./hash');
var path = require('path');
var mkdirp = require('mkdirp');

function splitHash(h) {
  return hash.algorithm + '/'
       + h.slice(0,2) + '/'
       + h.slice(2,4) + '/'
       + h.slice(4);
}

function store(operands) {
  var datastore = operands[0];
  operands.slice(1).forEach(function(file) {
    hash.withNoSymlink(file, function(hash){
      var target = datastore
                 + '/.neverstore/'
                 + splitHash(hash);
      mkdirp(path.dirname(target), {}, function() {
        console.log(file,'->',target);
      });
    });
  });
}

module.exports = {
  'store': store
};
