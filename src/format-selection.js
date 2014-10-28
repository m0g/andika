'use strict';

(function() {
  var sanitizeHtml = require('sanitize-html')
    , cursorPosition = require('./cursor-position');

  var FormatSelection = function() {
    this.selection = window.getSelection();
    this.range = this.selection.getRangeAt(0);
  };

  FormatSelection.prototype.toTag = function(tag) {
    // TODO: Format should be reverted instead of cancelled
    if (['H1', 'H2', 'H3'].indexOf(this.range.startContainer.parentNode.tagName) != -1)
      return false;

    if (this.selection.toString().length > 0) {
      document.execCommand('insertHTML', false,
                           '<'+tag+'>'+this.selection.toString()+'</'+tag+'>');
    } else {
      this.heading = document.createElement(tag);
      this.heading.innerText = this.range.startContainer.parentNode.innerText;
      var node = this.range.startContainer.parentNode;

      if (this.range.startContainer.parentNode.tagName == 'P') {
        this.range.deleteContents();

        if (node.nextSibling)
          node.parentNode.insertBefore(this.heading, node.nextSibling);
        else node.parentNode.appendChild(this.heading);

        this.range.startContainer.parentNode.innerText = '';
        // TODO: Cursor should be moved at the end of the heading
      } else {
        //this.range.deleteContents();
        node.parentNode.removeChild(node);
        this.range.insertNode(this.heading);
      }

      cursorPosition.toElement(this.heading);
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

  FormatSelection.prototype.toList = function() {
    document.execCommand('insertunorderedlist', false, null);

    var node = this.range.startContainer;
    var list = node.getElementsByTagName('UL')[0];

    if (node.nextSibling)
      node.parentNode.insertBefore(list, node.nextSibling);
    else node.parentNode.appendChild(list);

    node.parentNode.removeChild(node);
    cursorPosition.toElement(list);
  };

  FormatSelection.prototype.to = function(tag) {
    if (['H1', 'H2', 'H3'].indexOf(tag.toUpperCase()) != -1)
      this.toTag(tag);
    else if (['bold', 'italic'].indexOf(tag) != -1)
      document.execCommand(tag, false, null);
    else if (tag == 'ul')
      this.toList();
    else if (tag == 'link')
      this.toLink();
  };

  module.exports = FormatSelection;
})();
