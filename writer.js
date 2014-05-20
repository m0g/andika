//var app = require('app')
//  , Menu = require('menu')
//  , MenuItem = require('menu-item')
//  , fs = require('fs')
//  , ipc = require('ipc')
//  , BrowserWindow = require('browser-window');

var fs = require('fs')
  , markdown = require( "markdown" ).markdown
  , toMarkdown = require('to-markdown').toMarkdown
  , ipc = require('ipc');

Writer = function() {
  this.currentBuffer = '';

  console.log('Writer::construct');
};

Writer.prototype.openFile = function(filePath, callback) {
  console.log('Writer::openFile', filePath);

  fs.readFile(filePath, 'utf8', function(err, data) {
    callback(markdown.toHTML(data));
  });
};

Writer.prototype.saveFile = function(filePath, newContent, callback) {
  newContent = toMarkdown(newContent);

  fs.writeFile(filePath, newContent, function(err) {
    if(err) console.log(err);
    else callback({ success: true });
  });
};

module.exports = Writer;
