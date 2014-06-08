module.exports = function() {
  var getSelectedNode = function() {
    if (document.selection)
      return document.selection.createRange().parentElement();
    else {
      var selection = window.getSelection();
      if (selection.rangeCount > 0)
        return selection.getRangeAt(0).startContainer.parentNode;
    }
  },

  getLineElement = function(node) {
      var isLine = lineElements.indexOf(
        node.tagName.toLowerCase()
      );

    return (isLine > -1) ? node : getLineElement(node.parentNode);
  }

  var childElements = document.querySelectorAll('.current-position');

  for (var i = 0, childElement; childElement = childElements[i]; i++) {
    childElement.className = '';
    childElement.removeAttribute('style');
  }

  var lineElements = ['div', 'li', 'p', 'h1', 'h2', 'h3']
    , selectedNode = getSelectedNode();

  getLineElement(selectedNode).className = 'current-position';
}
