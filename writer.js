//var app = require('app')
//  , Menu = require('menu')
//  , MenuItem = require('menu-item')
//  , fs = require('fs')
//  , ipc = require('ipc')
//  , BrowserWindow = require('browser-window');

var fs = require('fs')
  , ipc = require('ipc');

Writer = function() {
  //this.socket = null;
  this.currentBuffer = '';

  console.log('Writer::construct');
};

Writer.prototype.openFile = function(filePath, callback) {
  console.log('Writer::openFile', filePath);

  fs.readFile(filePath, 'utf8', function(err, data) {
    callback(data);
  });
};

module.exports = Writer;
