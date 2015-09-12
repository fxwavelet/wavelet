var hogan = require('hogan');
var fs = require('fs');
var path = require('path');
if (!path.isAbsolute) {
  path.isAbsolute = function (yourPath) {
    return path.resolve(yourPath) == path.normalize(yourPath)
  }
}

var common = require('./common');

function render(file, context) {
  var template = fs.readFileSync(file);

  var precompiled = hogan.compile(template.toString());

  return precompiled.render(context);
}

module.exports = function (projectName) {
  var property = require('./property');
  var repo = path.join(process.cwd(), common.REPO_FOLDER);
  if (common.GLOBAL_INSTALL) {
    repo = property.get('repo');
  }


  console.log('Creating wavelet project:', projectName);
  var projectPath = process.cwd() + '/' + projectName;
  if (path.isAbsolute(projectName)) {
    projectPath = projectName;
  }

  projectName = path.basename(projectName);


  if (fs.existsSync(projectPath)) {
    console.warn('Folder', projectPath, 'already exists!');
    return;
  } else {
    console.log('Creating project folder...');
    fs.mkdirSync(projectPath);

    fs.mkdirSync(projectPath + '/plugins');


    // generate default plugin
    fs.mkdirSync(projectPath + '/plugins/' + projectName);
    var content = render(__dirname + '/../template/plugin_index.mustache', {projectName: projectName});
    fs.writeFileSync(projectPath + '/plugins/' + projectName + '/index.js', content);
    content = render(__dirname + '/../template/plugin_package.mustache', {projectName: projectName});
    fs.writeFileSync(projectPath + '/plugins/' + projectName + '/package.json', content);

    // generate app.js

    content = render(__dirname + '/../template/app_index.mustache', {
      app: projectName,
      repo: common.GLOBAL_INSTALL ? "global.get(\'repo\')" : "__dirname + \'/repo\'",
      plugins: (path.join(repo, '/plugins/node_modules')).replace(/\\/g, '/'),
      wavelets: (path.join(repo, '/wavelets/node_modules')).replace(/\\/g, '/')
    });
    fs.writeFileSync(projectPath + '/app.js', content);

    // generate default flow
    fs.mkdirSync(projectPath + '/.node-red');
    content = render(__dirname + '/../template/flow.mustache', {});
    fs.writeFileSync(projectPath + '/.node-red/flow.json', content);

    // generate package.json
    content = render(__dirname + '/../template/app_package.mustache', {
      app: projectName
    });
    fs.writeFileSync(projectPath + '/package.json', content);
  }

  console.log('Project [', projectName, '] is created at', projectPath);
  console.log('Done');
};