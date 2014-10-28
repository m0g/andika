'use strict';

(function() {
  exports.toTop = function() {
    var range, selection
      , contentEditableElement = document.getElementById('editor');

    range = document.createRange();
    range.selectNodeContents(getFirstChildElement(contentEditableElement));
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  exports.toBottom = function() {
    var range, selection
      , contentEditableElement = document.getElementById('editor');

    range = document.createRange();
    range.selectNodeContents(getLastChildElement(contentEditableElement));
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  exports.toElement = function(element) {
    var range, selection
      , contentEditableElement = document.getElementById('editor');

    range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };


  // PRIVATE
  var getLastChildElement = function(el){
    var lc = el.lastChild;

    while(lc.nodeType != 1) {
      if (lc.previousSibling) lc = lc.previousSibling;
      else break;
    }

    return lc;
  },

  getFirstChildElement = function(el) {
    var lc = el.firstChild;

    while(lc.nodeType != 1) {
      if (lc.nextSibling) lc = lc.nextSibling;
      else break;
    }

    return lc;
  };
})();

