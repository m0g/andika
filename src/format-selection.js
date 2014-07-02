(function() {
  var sanitizeHtml = require('sanitize-html');

  var FormatSelection = function() {
    this.selection = window.getSelection();
    this.range = this.selection.getRangeAt(0);
  };

  FormatSelection.prototype.toTag = function(tag) {
    // TODO: Format should be reverted instead of cancelled
    if (['H1', 'H2', 'H3'].indexOf(this.range.startContainer.parentNode.tagName) != -1)
      return false;

    //this.heading = document.createElement(tag);

    //if (this.selection.toString().length > 0) {
    //  this.heading.innerText = this.selection.toString();
    //} else {
    //  this.heading.innerText = this.range.startContainer.parentNode.innerText;
    //  this.range.startContainer.parentNode.innerText = '';
    //}

    //if (this.range.startContainer.parentNode.tagName == 'P') {
    //  var node = this.range.startContainer.parentNode.parentNode;
    //  this.range.deleteContents();
    //  node.appendChild(this.heading);
    //} else {
    //  console.log(this.heading.innerHTML);
    //  document.execCommand('insertHTML', false,
    //                       '<'+tag+'>'+this.heading.innerText+'</'+tag+'>');
    //}

    if (this.selection.toString().length > 0) {
      document.execCommand('insertHTML', false,
                           '<'+tag+'>'+this.selection.toString()+'</'+tag+'>');
    } else {
      this.heading = document.createElement(tag);
      this.heading.innerText = this.range.startContainer.parentNode.innerText;

      if (this.range.startContainer.parentNode.tagName == 'P') {
        var node = this.range.startContainer.parentNode.parentNode;
        this.range.deleteContents();
        node.appendChild(this.heading);
        // TODO: Cursor should be move at the end of the heading
      } else {
        this.range.deleteContents();
        this.range.insertNode(this.heading);
      }

      this.range.startContainer.parentNode.innerText = '';
    }
  };

  FormatSelection.prototype.toH1 = function() {
    this.toTag('h1');
  };

  FormatSelection.prototype.toH2 = function() {
    this.toTag('h2');
  };

  FormatSelection.prototype.toH3 = function() {
    this.toTag('h3');
  };

  FormatSelection.prototype.toLink = function() {
    this.link = document.createElement('a');
    this.link.href = this.selection.toString();
    this.link.innerText = this.selection.toString();
    this.range.deleteContents();
    this.range.insertNode(this.link);
  };

  module.exports = FormatSelection;
})();
