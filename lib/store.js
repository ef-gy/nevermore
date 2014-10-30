var hash = require('./hash'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    sqlite3 = require('sqlite3'),
    fs = require('graceful-fs');

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
  tags.exec('create table if not exists file (hash text, path text, basename text, constraint fileHF unique (hash, path))', function() {
    return cb (tags);
  });
}

function store(operands) {
  var datastore = path.resolve(operands[0]);
  getTagDB(datastore, function(tags) {
    var insertFilename = tags.prepare('insert or ignore into file (hash, path, basename) values (?, ?, ?)');

    var targets = operands.slice(1);
    var queue = [];
    targets.forEach(function(file) {
      hash.withNoSymlink(file, function(hash){
        queue.push([hash, path.resolve('/',file), path.basename(file)]);
        try {
          while (queue.length > 0) {
            insertFilename.run(queue[0]);
            queue.shift();
          }
        } catch (e) {
          console.error(e);
        }

        file = path.resolve(file);
        var target = datastore
                   + '/.neverstore/'
                   + splitHash(hash);

        mkdirp(path.dirname(target), {}, function() {
          fs.rename(file, target, function() {
            fs.symlink(path.relative(path.dirname(file),target), file, function() {
              console.log(target);
            });
          });
        });
      });
    });
  });
}

module.exports = {
  'store': store
};
