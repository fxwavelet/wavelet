var runtime = require('fx-runtime');
var printHelp = require('./help');

var path = require('path');
if (!path.isAbsolute) {
  path.isAbsolute = function (yourPath) {
    return path.resolve(yourPath) == path.normalize(yourPath)
  }
}

module.exports = function start(appName, config, root) {
  var property = require('./property');
  global.repo = property.get('repo');
  global._repo = property.get('repo');

  if (config) {
    waveletConfig = require(config);
  } else {
    if (path.isAbsolute(appName)) {
      waveletConfig = require(appName + '/app.js');
    } else {
      waveletConfig = require(process.cwd() + '/' + appName + '/app.js');
    }
  }

  if (root) {
    global.root = root;
    global._root = root;
  } else {
    global.root = waveletConfig.root || '';
    global._root = waveletConfig.root || '';
  }

  var home = waveletConfig.home || process.cwd();
  var pluginSearchPaths = waveletConfig.pluginSearchPaths || [process.cwd() + '/plugins'];
  var defaultPluginConfig = waveletConfig.defaultPluginConfig;

  var filter = {};
  if (waveletConfig.whiteList) {
    filter.whiteList = waveletConfig.whiteList;
  }
  if (waveletConfig.blackList) {
    filter.blackList = waveletConfig.blackList;
  }
  if (waveletConfig.serviceMap) {
    filter.binding = waveletConfig.binding;
  }
  if (waveletConfig.apps) {
    filter.apps = waveletConfig.apps;
  }

  // add wavelet plugin to the search path
  pluginSearchPaths.push(__dirname + '/../plugins');

  var plugins = runtime.resolvePlugins(pluginSearchPaths, defaultPluginConfig, null, filter);

  runtime.start(home, plugins.config, function () {
    printHelp(plugins.help)
  });
};