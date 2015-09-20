# Wavelet

Internal name: fx-wavelet

Service Oriented nodejs application

## Installation
``````` sh
npm install -g wavelet
```````

## Usage

````` sh
Usage: wavelet [action] [options]

Action:

start [app] [options]   start an application
 app: application path, by default: current working directory
 
 options:
   --config: the wavelet configuration file, by default {your app}/app.js
   --root: the web app root
   --port: the web app port
   
   Some plugins accept the options from command line, check your plugin manual to see which options you can put here.

create [app] [options]    create a wavelet project
  app: the name of the application
  options:
    -g: use global repository

install [plugin name] [version] [options]   install plugin or wavelet
  plugin name: optional, the plugin or wavlet to install, if not specified it will look for all the plugins defined in the wavelet.json file

  version: optional, the version of plugin or wavelet to install, if not 
  specified the latest version will be installed
  
  options:
    -g install the plugin to global repository otherwise install it locally

install red <node-red-name> [version]   install node-red node
  node-red-name  is the name of Node-RED node module
    Example: wavelet install red node-red-node-instagram
  
  More node-red nodes see [Node-Red Library](http://flows.nodered.org/)

get repo   get repository location

set repo [location]  set repository location

Runtime options:
-v print wavelet version
-d debug, toggle debug
-h help
`````

Example of Usage:
Start wavelet application located at current directory: your_app_folder
`````sh
cd your_app_folder
wavelet start
`````

Start wavelet application by specifying your app location
`````sh
wavelet start your_app_folder
`````

Create a wavelet application: testApp
`````sh
wavelet create testApp
`````

Install all the plugins/dependences on application folder
`````sh
cd your_app_folder
wavelet install
`````

Check wavelet version
`````sh
wavelet -v
`````

## global variable registered
**Wavelet** inherits the gloabl variables defined in fx-runtime. Besides, it registers the following global variables:

#### _waveletVersion
the current wavelet version

#### _root
the web app root. All your web routes registered in your plugin must have a prefix of **_root**

For example
``````javascript
webapp.use(_root + '/register', function(req, res) {
});

webapp.post(_root + '/login', function(req, res) {
});
``````

It could be configured in config file or through command line argument --root


## Format of config file
Wavelet config file could be a json or a js file, or any nodejs requirable files.
Config file must return a json object with following fields:

- apps: [optional] the list of application plugin
- home: the home path of your application, usually __dirname
- root: the root web path, default: ''
- binding: [optional] service implementation binding, if you have multiple implementation of same service, use this binding to choose the one you want to use
- pluginSearchPaths: a list of paths to locate your plugins
- defaultPluginConfig: default plugin configs. [JSON object], key is the plugin name, value is the config object
- whiteList: [optional] the white list of plugin
- blackList: [optional] the black list of plugin

Example:
````` javascript
module.exports = {
  "home": __dirname,
  "pluginSearchPaths": [
    __dirname + '/plugins',
    __dirname + '/../../fx-plugins'
  ],
  "defaultPluginConfig": {
    "fx-mongodb": {

    }
  }
};
`````


