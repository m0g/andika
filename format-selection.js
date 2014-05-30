(function() {
  var FormatSelection = function() {
    this.selection = window.getSelection();
    this.range = this.selection.getRangeAt(0);
  };

  FormatSelection.prototype.toTag = function(tag) {
    this.heading = document.createElement(tag);
    this.heading.innerText = this.selection.toString();
    this.range.deleteContents();
    this.range.insertNode(this.heading);
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
