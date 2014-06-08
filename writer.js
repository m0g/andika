var fs = require('fs')
  , markdown = require( "markdown" ).markdown
  , toMarkdown = require('to-markdown').toMarkdown
  , sanitizeHtml = require('sanitize-html')
  , ipc = require('ipc');

String.prototype.decodeHTML = function() {
  var map = {"gt": ">", "amp": "&", "nbsp": " "};
  return this.replace(/&(#(?:x[0-9a-f]+|\d+)|[a-z]+);?/gi, function($0, $1) {
    if ($1[0] === "#") {
      return String.fromCharCode($1[1].toLowerCase() === "x" ? parseInt($1.substr(2), 16)  : parseInt($1.substr(1), 10));
    } else {
      return map.hasOwnProperty($1) ? map[$1] : $0;
    }
  });
};

Writer = function() {
  this.lastSaved = '';
  this.nbChars = 0;
};

Writer.prototype.openFile = function(filePath, callback) {
  fs.readFile(filePath, 'utf8', function(err, data) {
    callback(markdown.toHTML(data));
  });
};

Writer.prototype.saveFile = function(filePath, newContent, callback) {
  console.log(newContent.decodeHTML());
  newContent = toMarkdown(sanitizeHtml(
    newContent.decodeHTML(),
    { allowedTags: [ 'b', 'i', 'em', 'strong', 'p', 'ul', 'li',
                     'h1', 'h2', 'h3', 'a' ] }
  ));

  fs.writeFile(filePath, newContent, function(err) {
    if(err) console.log(err);
    else callback({ success: true });
  });
};

Writer.prototype.hasBeenModified = function(currentBuffer) {
  return (currentBuffer.length != this.nbChars);
}

module.exports = Writer;
