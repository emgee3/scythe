var   _ = require('lodash'),
     fs = require('fs'),
   path = require('path'),
   util = require('util'),
  async = require('async'),
 findit = require('findit'),
 moment = require('moment'),
 events = require('events');


module.exports = Scythe;


function Scythe (opts) {
  opts = opts || {};
  var self = this;

  this.threshold   = opts.threshold   || new Date - 604800000;
  this.searchPaths = opts.searchPaths || ".";
  this.truncate    = opts.truncate    || true;
  this.limit       = opts.limit       || 5;
  this.simulation  = ! opts.force;
  this.verbose     = opts.verbose     || this.simulation;
}


util.inherits(Scythe, events.EventEmitter);


Scythe.prototype.walkPath = function (dir, cb) {
  var self = this;
  var finder = require('findit')(dir);
  var dirs = [];

  finder.on('directory', function (d, stat, stop) {
    if (dir !== d)
      dirs.push(d);
  });

  finder.on('file', function (file, stat) {
    if (stat.mtime < self.threshold) {
      if (! self.simulation) {
        try {
          fs.unlinkSync(path.resolve(file));
        } catch (e) {
          self.emit('error', JSON.stringify(e));
        }
      }
      self.emit('unlinkFile', file);
    } else {
      self.emit('preserveFile', file);
    }
  });

  finder.on('end', function () {
    dirs = self.sortDirectories(dirs);
    if (self.truncate) {
      self.truncateDirs(dirs);
    } 
    return cb(null);
  });
};




Scythe.prototype.sortDirectories = function (dirs) {
  return _.sortBy(dirs, function (dir) {
    dir = dir.split(path.sep);
    return - dir.length;
  });
};




Scythe.prototype.execute = function (cb) {
  var self = this;

  async.each(this.searchPaths, this.walkPath.bind(this), function (e) {
    if (e) {
      self.emit('error', JSON.stringify(e));
      return cb(JSON.stringify(e));
    } else {
      self.emit('complete');
      return cb();
    }
  });
};




Scythe.prototype.truncateDirs = function (dirs) {
  var self = this;

  _.each(dirs, function (dir) {
    var files = fs.readdirSync(dir);

    if (files.length > 0) {
      self.emit('preserveDir', dir);
      return;
    }

    try {
      if (! self.simulation) fs.rmdirSync(path.resolve(dir));
      self.emit('unlinkDir', dir);
    } catch (e) {
      self.emit('error', JSON.stringify(e));
    }
  });
};



