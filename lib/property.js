var fs = require('fs');
var path = require('path');
if (!path.isAbsolute) {
  path.isAbsolute = function (yourPath) {
    return path.resolve(yourPath) == path.normalize(yourPath)
  }
}

var DEFAULT_REPO = path.join(__dirname, '../repo').replace(/\\/g, '/');

function setProperty(key, value) {
  var properties = {};
  if (fs.existsSync(path.join(__dirname, '../config.json'))) {
    properties = require('../config.json');
  }

  if (!path.isAbsolute(value)) {
    value = path.join(process.cwd(), value).replace(/\\/g, '/');
  }
  properties[key] = value;

  fs.writeFileSync(__dirname + '/../config.json', JSON.stringify(properties, null, 4));
}

function getProperty(key) {
  var properties = {};
  if (fs.existsSync(path.join(__dirname, '../config.json'))) {
    properties = require('../config.json');
  }

  if (properties.hasOwnProperty(key)) {
    return properties[key];
  }

  if (key == 'repo') {
    return DEFAULT_REPO;
  }

  return null;
}

function resetProperty(key) {
  var properties = {};
  if (fs.existsSync(path.join(__dirname, '../config.json'))) {
    properties = require('../config.json');
  }

  var value = null;
  if (key == 'repo') {
    properties[key] = DEFAULT_REPO;
    value = DEFAULT_REPO;
  }

  fs.writeFileSync(__dirname + '/../config.json', JSON.stringify(properties, null, 4));

  return value;
}


module.exports = {
  set: setProperty,
  get: getProperty,
  reset: resetProperty
};