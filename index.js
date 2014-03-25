var   _ = require('lodash'),
     fs = require('fs'),
     ms = require('ms'),
   path = require('path'),
  async = require('async'),
 colors = require('colors'),
 findit = require('findit'),
 moment = require('moment');


module.exports = Scythe;


function Scythe (opts) {
  opts = opts || {};
  var self = this;

  this.threshold   = opts.threshold   || new Date - 604800000;
  this.searchPaths = opts.searchPaths || ".";
  this.truncate    = opts.truncate    || true;
  this.limit       = opts.limit       || 5;
  this.simulation  = ! opts.force;
  this.verbose     = opts.verbose || this.simulation;
}



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
      try {
        if (! self.simulation) fs.unlinkSync(path.resolve(file));
        if (self.verbose || self.simulation) console.log("File Unlinked:  ".file + file.file.bold);
      } catch (e) {
        console.error("Could not unlink ".error + file.error.bold);
      }
    } else {
      if (self.verbose || self.simulation) console.log("File Preserved: ".data + file.data.bold);
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

  if (this.verbose) {
    var mode = this.simulation ? "simulation" : "active";
    console.log("\nScythe".bold + " running in ".data + mode.data.bold + " mode".data);
    var paths = this.searchPaths.join(", ");
    console.log('Searching '.data + paths.data.bold);
    var threshold = moment(this.threshold).toString();
    console.log('Removing files older than '.data + threshold.data.bold);
    console.log('-----------------------------------------------------------\n'.data);
  }

  async.each(this.searchPaths, this.walkPath.bind(this), function (err) {
    if (err) {
      console.error(err);
      return cb(err);
    } else {
      console.log('\n\nScythe Complete\n\n'.bold);
      return cb();
    }
  });
};




Scythe.prototype.truncateDirs = function (dirs) {
  var self = this;

  _.each(dirs, function (dir) {
    var files = fs.readdirSync(dir);

    if (files.length > 0) {
      if (self.verbose || self.simulation) console.log("Dir  Preserved: ".data + dir.data.bold);
      return;
    }

    try {
      if (! self.simulation) fs.rmdirSync(path.resolve(dir));
      if (self.verbose || self.simulation) console.log("Dir  Unlinked:  ".dir + dir.dir.bold);
    } catch (e) {
      console.error("Could not unlink ".error + dir.error.bold);
    }
  });
};



