var fs = require('fs'),
  mock = require('mock-fs'),
assert = require('assert'),
Scythe = require('../index');

var prepareMocks = function () {
  mock({
    'mockfs': {
      'file-new' : 'new',
      'file-old' : mock.file({ mtime : new Date(1), mtime : new Date(1), contents : 'old' }),
      'folder-empty' : {/** empty directory */},
      'folder-new'   : {
        'file-new' : 'new'
      },
      'folder-old' : {
        'file-old' : mock.file({ mtime : new Date(1), mtime : new Date(1), contents : 'old' })
      }
    }
  });
}

describe('Default Instantiation', function () {
  var def = new Scythe();

  it('should have a threshold of 1 week', function () {
    var diff = (new Date() - 604800000) - def.threshold;
    assert(diff < 60000);
  });

  it('should be in simulation mode', function () {
    assert(def.simulation);
  });

  it('should truncate empty directories', function () {
    assert(def.truncate);
  });

  it('should limit to 5 async functions', function () {
    assert.equal(def.limit, 5);
  });

  it('should be in verbose mode', function () {
    assert(def.verbose);
  });
});



describe('Custom Instantiation', function () {
  var custom = new Scythe({
    threshold   : new Date(50000),
    force       : true,
    truncate    : false,
    searchPaths : ['test', 'test2'],
    verbose     : true,
    limit       : 10
  });

  it('should recognize custom threshold', function () {
    var diff = custom.threshold - new Date(50000);
    assert(diff < 60000);
  });

  it('should accept non-simulation mode', function () {
    assert(! custom.simulation);
  });

  it('should truncate empty directories', function () {
    assert(custom.truncate);
  });

  it('should allow limit setting', function () {
    assert.equal(custom.limit, 10);
  });

  it('should allow verbose override', function () {
    assert(custom.verbose);
  });
});



describe('Directory removal', function() {
  beforeEach(function() {
    prepareMocks();
  });

  it('should delete empty directories', function() {
    var scythe = new Scythe({ force : true, searchPaths : [ 'mockfs' ] });
    scythe.execute(function () {
      var res = fs.readdirSync('mockfs');
      assert.equal(res.indexOf('folder-empty'), -1);
      assert.equal(res.indexOf('folder-old'), -1);
      mock.restore();
    });
  });

  it('should preserve unempty directories', function() {
    var scythe = new Scythe({ force : true, searchPaths : [ 'mockfs' ] });
    scythe.execute(function () {
      var res = fs.readdirSync('mockfs');
      assert(res.indexOf('folder-new') > -1);
      mock.restore();
    });
  });

  it('should delete old files', function() {
    var scythe = new Scythe({ force : true, searchPaths : [ 'mockfs' ] });
    scythe.execute(function () {
      var res = fs.readdirSync('mockfs');
      assert(res.indexOf('file-new') > -1);
      mock.restore();
    });
  });

  it('should preserve new files', function() {
    var scythe = new Scythe({ force : true, searchPaths : [ 'mockfs' ] });
    scythe.execute(function () {
      var res = fs.readdirSync('mockfs');
      assert.equal(res.indexOf('file-old'), -1);
      mock.restore();
    });
  });

});

