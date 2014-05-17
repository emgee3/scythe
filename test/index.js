var Lab = require('lab'),
     fs = require('fs'),
   mock = require('mock-fs'),
 Scythe = require('../index');


Lab.experiment('Default Instantiation', function () {
  var def = new Scythe();

  Lab.test('should have a threshold of 1 week', function (done) {
    var diff = (new Date() - 604800000) - def.threshold;
    Lab.expect(diff < 60000).to.equal(true);
    done();
  });

  Lab.test('should be in simulation mode', function (done) {
    Lab.expect(def.simulation).to.equal(true);
    done();
  });

  Lab.test('should truncate empty directories', function (done) {
    Lab.expect(def.truncate).to.equal(true);
    done();
  });

  Lab.test('should limit to 5 async functions', function (done) {
    Lab.expect(def.limit, 5).to.equal(5);
    done();
  });

  Lab.test('should be in verbose mode', function (done) {
    Lab.expect(def.verbose).to.equal(true);
    done();
  });
});



Lab.experiment('Custom Instantiation', function () {
  var custom = new Scythe({
    threshold   : new Date(50000),
    force       : true,
    truncate    : false,
    searchPaths : ['test', 'test2'],
    verbose     : true,
    limit       : 10
  });

  Lab.test('should recognize custom threshold', function (done) {
    var diff = custom.threshold - new Date(50000);
    Lab.expect(diff < 60000).to.equal(true);
    done();
  });

  Lab.test('should accept non-simulation mode', function (done) {
    Lab.expect(custom.simulation).to.equal(false);
    done();
  });

  Lab.test('should truncate empty directories', function (done) {
    Lab.expect(custom.truncate).to.equal(true);
    done();
  });

  Lab.test('should allow limit setting', function (done) {
    Lab.expect(custom.limit).to.equal(10);
    done();
  });

  Lab.test('should allow verbose override', function (done) {
    Lab.expect(custom.verbose).to.equal(true);
    done();
  });
});



Lab.experiment('Directory removal', function() {
  Lab.beforeEach(function (done) {
    mock({
      'mockfs': {
        'file-new' : 'new',
        'file-old' : mock.file({ mtime : new Date(1), ctime : new Date(1), contents : 'old' }),
        'folder-empty' : {/* empty directory */},
        'folder-new'   : {
          'file-new' : 'new'
        },
        'folder-old' : {
          'file-old' : mock.file({ mtime : new Date(1), ctime : new Date(1), contents : 'old' })
        }
      }
    });
    done();
  });


  Lab.test('should delete empty directories', function (done) {
    var scythe = new Scythe({ force : true, searchPaths : [ 'mockfs' ] });
    scythe.execute(function () {
      var res = fs.readdirSync('mockfs');
      Lab.expect(res.indexOf('folder-empty')).to.equal(-1);
      Lab.expect(res.indexOf('folder-old')).to.equal(-1);
      mock.restore();
      done();
    });
  });

  Lab.test('should preserve unempty directories', function (done) {
    var scythe = new Scythe({ force : true, searchPaths : [ 'mockfs' ] });
    scythe.execute(function () {
      var res = fs.readdirSync('mockfs');
      Lab.expect(res.indexOf('folder-new') > -1).to.equal(true);
      mock.restore();
      done();
    });
  });

  Lab.test('should delete old files', function (done) {
    var scythe = new Scythe({ force : true, searchPaths : [ 'mockfs' ] });
    scythe.execute(function () {
      var res = fs.readdirSync('mockfs');
      Lab.expect(res.indexOf('file-new') > -1).to.equal(true);
      mock.restore();
      done();
    });
  });

  Lab.test('should preserve new files', function (done) {
    var scythe = new Scythe({ force : true, searchPaths : [ 'mockfs' ] });
    scythe.execute(function () {
      var res = fs.readdirSync('mockfs');
      Lab.expect(res.indexOf('file-old')).to.equal(-1);
      mock.restore();
      done();
    });
  });

});

