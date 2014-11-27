'use strict';

module.exports = function() {
  var getSelectedNode = function() {
    var selection = window.getSelection();
    if (selection.rangeCount > 0)
      return selection.getRangeAt(0).startContainer.parentNode;
  },

  getLastChildTextNode = function(childNodes) {
    var childTextNodes = [];

    for (var i=0; i<childNodes.length; i++)
      if (childNodes[i].nodeType == 3)
        childTextNodes.push(childNodes[i]);

    return childTextNodes.pop();
  },

  getCurrentSentence = function(node) {
    var span = document.createElement('span');
    var charPos = window.getSelection().getRangeAt(0).startOffset;
    var sentences = node.innerText.match(/\n|([^\r\n.!?]+([.!?]+|$))/gim);
    var currentSentence = '';
    var sentencesNbChar = 0;
    var range = document.createRange();

    //console.log(window.getSelection().getRangeAt(0).startContainer.parentNode);
    //console.log(sentences);

    if (sentences.length > 1) {
      sentences.forEach(function(sentence) {
        var sentenceRange = { start: sentencesNbChar,
                              end: sentencesNbChar + sentence.length };
        sentencesNbChar = sentencesNbChar + sentence.length;

        if (sentenceRange.end - sentenceRange.start > 1
          && sentenceRange.start > 0
          && charPos <= sentenceRange.end && charPos >= sentenceRange.start) {

          var lastChild = getLastChildTextNode(node.childNodes);
          console.log(sentenceRange, charPos, node, lastChild);

          //range.setStart(lastChild, sentenceRange.start);
          range.setStart(lastChild, 0);
          //range.setEnd(lastChild, (sentenceRange.end - sentenceRange.start));
          range.setEnd(lastChild, lastChild.length);
          range.surroundContents(span);
          range.deleteContents();
          node.appendChild(span);

          selection = window.getSelection();
          selection.collapse(span, 1);
        }
      });

      return span;
    }
  },

  getLineElement = function(node) {
    var isLine = lineElements.indexOf(
      node.tagName.toLowerCase()
    );

    if (node.tagName.toLowerCase() == 'p')
      return getCurrentSentence(node);

    return (isLine > -1) ? node : getLineElement(node.parentNode);
  }

  var childElements = document.getElementById('editor').querySelectorAll('*');

  for (var i = 0, childElement; childElement = childElements[i]; i++) {
    childElement.className = '';
    childElement.removeAttribute('style');
    childElement.removeAttribute('color');
  }

  var lineElements = ['div', 'li', 'p', 'h1', 'h2', 'h3']
    , selectedNode = getSelectedNode();

  var currentNode = getLineElement(selectedNode).className = 'current-position';
  console.log(currentNode);
}
