module.exports = function() {
  var getSelectedNode = function() {
    //if (document.selection)
    //  return document.selection.createRange().parentElement();
    //else {
      var selection = window.getSelection();
      if (selection.rangeCount > 0)
        return selection.getRangeAt(0).startContainer.parentNode;
    //}
  },

  getCurrentSentence = function(node) {
    var span = document.createElement('span');
    var charPos = window.getSelection().getRangeAt(0).startOffset;
    var sentences = node.innerText.match(/\n|([^\r\n.!?]+([.!?]+|$))/gim);
    var currentSentence = '';
    var sentencesNbChar = 0;
    var range = document.createRange();

    console.log(window.getSelection().getRangeAt(0).startContainer.parentNode);

    if (sentences.length > 1) {
      sentences.forEach(function(sentence) {
        var sentenceRange = { start: sentencesNbChar,
                              end: sentencesNbChar + sentence.length };
        sentencesNbChar = sentencesNbChar + sentence.length;

        //console.log(charPos, sentenceRange, node.childNodes);
        if (sentenceRange.end - sentenceRange.start > 1 
          && charPos <= sentenceRange.end && charPos >= sentenceRange.start) {
          range.setStart(node.firstChild, sentenceRange.start);
          range.setEnd(node.firstChild, sentenceRange.end);
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

    //if (node.tagName.toLowerCase() == 'p')
    //  getCurrentSentence(node);

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

  getLineElement(selectedNode).className = 'current-position';
}
