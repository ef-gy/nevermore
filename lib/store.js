var hash = require('./hash'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    sqlite3 = require('sqlite3');

function splitHash(h) {
  return hash.algorithm + '/'
       + h.slice(0,2) + '/'
       + h.slice(2,4) + '/'
       + h.slice(4);
}

function getTagDB(datastore, cb) {
  mkdirp(datastore + '/.neverstore');
  var tags = new sqlite3.Database(datastore + '/.neverstore/tags');
//  var tags = new sqlite3.Database(':memory:');

  tags.exec('create table if not exists file (hash text, filename text, constraint fileHF unique (hash, filename))', function() {
    tags.serialize(function() {
      return cb (tags);
    });
  });
}

function store(operands) {
  var datastore = path.resolve(operands[0]);
  getTagDB(datastore, function(tags) {
    var insertFilename = tags.prepare('insert or ignore into file (hash, filename) values (?, ?)');

    var targets = operands.slice(1);
    targets.forEach(function(file) {
      hash.withNoSymlink(file, function(hash){
        insertFilename.run(hash, file);

        file = path.resolve(file);
        var target = datastore
                   + '/.neverstore/'
                   + splitHash(hash);

        mkdirp(path.dirname(target), {}, function() {
          console.log(file,'->',target);
          console.log(path.relative(file,target));
        });
      });
    });
  });
}

module.exports = {
  'store': store
};
