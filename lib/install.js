var property = require('./property');
var os = require('os');
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');
if (!path.isAbsolute) {
  path.isAbsolute = function (yourPath) {
    return path.resolve(yourPath) == path.normalize(yourPath)
  }
}

var async = require('async');
var common = require('./common');

function installNpmDepenencies(path, production, done) {
  var cmd = 'cd ' + path + ' && npm install';

  if (production) {
    cmd += ' --production';
  }

  if (os.platform() == 'win32') {
    cmd += ' --msvs_version=2012';
  }

  console.log('Installing embed plugin: [' + path + ']');
  cmd = cmd.replace(/\\/g, '/');
  exec(cmd, function (error, stdout, stderr) {
    console.log(stdout);

    if (error) {
      console.log('exec error: ' + error);
      return done(error);
    }
    done();
  });
}

function installModule(name, version, forceWavelet, done) {
  if (!done && (typeof forceWavelet === 'function')) {
    done = forceWavelet;
    forceWavelet = false;
  }

  var repo = path.join(process.cwd(), common.REPO_FOLDER);
  if (common.GLOBAL_INSTALL) {
    repo = property.get('repo');
  }

  var pluginDir = path.join(repo, '/plugins');
  var waveletDir = path.join(repo, '/wavelets');

  if (!fs.existsSync(repo)) {
    fs.mkdirSync(repo);
  }

  if (!fs.existsSync(pluginDir)) {
    fs.mkdirSync(pluginDir);
  }

  if (!fs.existsSync(pluginDir + '/node_modules')) {
    fs.mkdirSync(pluginDir + '/node_modules');
  }

  if (!fs.existsSync(waveletDir)) {
    fs.mkdirSync(waveletDir);
  }

  if (!fs.existsSync(waveletDir + '/node_modules')) {
    fs.mkdirSync(waveletDir + '/node_modules');
  }

  var cmd = 'npm install --prefix ';
  if (name.indexOf('node-red') == 0) {
    // fix i18n not working problem for node red native node
    cmd = 'npm install ' + name;
    console.log('Installing node [', name, ']...');
  } else if ((name.indexOf('fx-red') == 0 && name != 'fx-red') || forceWavelet) {
    cmd += waveletDir + ' ' + name;
    console.log('Installing wavelet [', name, ']...');
  } else {
    cmd += pluginDir + ' ' + name;
    console.log('Installing plugin [', name, ']...');
  }

  if (version) {
    cmd += '@' + version;
  }

  if (os.platform() == 'win32') {
    cmd += ' --msvs_version=2012';
  }

  exec(cmd, function (error, stdout, stderr) {
    console.log(stdout);

    if (error) {
      console.log('exec error: ' + error);
      return done(error);
    }

    // install node-red for fx-red
    // TODO: this is not good at all
    if (name == 'fx-red') {
      var delimiter = ";";
      var buildParam = '';
      if (os.platform() == 'win32') {
        delimiter = '&';
        buildParam = '--msvs_version=2012';
      }
      var newCmd = 'cd ' + pluginDir + '/node_modules/fx-red/node-red-customized ' + delimiter + ' npm install ' + buildParam;
      console.log(newCmd);
      exec(newCmd, function (err, stdo, stde) {
        console.log(stdo);

        if (err) {
          console.log('exec error: ' + err);
          return done(err);
        }

        done();
      });
    } else {
      done();
    }
  });
}

function installPack(modules, done) {
  if (!modules) {
    return done();
  }

  var tasks = [];

  for (var key in modules) {
    var module = {
      name: key,
      version: modules[key]
    };
    function getTask(module) {
      return function (cb) {
        installModule(module.name, module.version, cb);
      };
    }

    tasks.push(getTask(module));
  }

  async.series(tasks, function (err, results) {
    if (err) {
      console.error('Install failed!', err.message);
      return;
    }

    console.log('Install succeeds!')
  });
}

function installRedPack(modules, done) {
  if (!modules) {
    return done();
  }
  var tasks = [];

  for (var key in modules) {
    var module = {
      name: key,
      version: modules[key]
    };
    function getTask(module) {
      return function (cb) {
        installModule(module.name, module.version, true, cb);
      };
    }

    tasks.push(getTask(module));
  }

  async.series(tasks, function (err, results) {
    if (err) {
      console.error('Install failed!', err.message);
      return;
    }

    console.log('Install succeeds!')
  });
}

function installPackFromFile(file, done) {
  if (!fs.existsSync(file)) {
    return done(new Error('File not found! ' + file));
  }

  var desc = fs.readFileSync(file);

  try {
    desc = JSON.parse(desc);
  } catch (e) {
    return done(e);
  }

  installPack(desc.wavelet, done);
  installRedPack(desc.red, done);
}

function installPredefined(pack, done) {
  if (pack.indexOf('http') == 0) {
    // get json from http

  }

  // find pack definition json file in pack folder
  installPackFromFile(path.join(__dirname, '../pack/' + pack + '.json'), function (err) {
    if (err) {
      console.error('Fail install pack! Reason: ', err.message);
      return done(err);
    }

    done();
  });
}

function install(args) {
  var op = args[1];
  if (op == 'pack') {
    if (args.length < 3) {
      return cb(new Error('Please specify package name or path'));
    }

    var param = args[2];
    if (path.isAbsolute(param)) {
      installPackFromFile(param, cb);
    } else {
      if (param.indexOf('.') == 0) {
        installPackFromFile(path.join(process.cwd(), param), cb);
      } else {
        // get predefined module
        installPredefined(param, cb);
      }
    }
  } else if (op == 'red') {
    if (args.length < 3) {
      return cb(new Error('Please specify wavelet name or path'));
    }

    var param = args[2];

    var version = "*";
    if (args.length >= 4) {
      version = args[3];
    }
    // get predefined module
    installModule(param, version, true, cb);
  } else {
    var name = null;
    var version = null;
    if (args.length < 2) {
      // install all wavelet dependencies in package.json
      var tasks = [];

      var embedPlugins = fs.readdirSync(path.join(process.cwd(), 'plugins')).filter(function(file) {
        return fs.statSync(path.join(process.cwd(), 'plugins', file)).isDirectory();
      });

      function getInstallNpmTask(pluginPath) {
        return function(callback) {
          installNpmDepenencies(pluginPath, true, callback);
        };
      }
      for (var i = 0; i < embedPlugins.length; i++) {
        var pluginPath = path.join(process.cwd(), 'plugins', embedPlugins[i]);
        tasks.push(getInstallNpmTask(pluginPath));
      }

      tasks.push(function(callback) {
        installPackFromFile(path.join(process.cwd(), 'package.json'), callback);
      });

      async.series(tasks, cb);

      return;
    }

    if (args.length < 3) {
      name = args[1];
    }

    if (args.length >= 3) {
      name = args[1];
      version = args[2];
    }


    installModule(name, version, cb);
  }
}

function cb(err) {
  if (err) {
    console.error(err.message);
    return;
  }

  console.info('Done!');
};


module.exports = install;