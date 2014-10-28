'use strict';

(function() {
  var MediumEditor = require('medium-editor')
    , ipc = require('ipc');

  // Override default anchor preview behavior
  // TODO: Add an edit button after the link
  MediumEditor.prototype.createAnchorPreview = function() {
    var anchorPreview = document.createElement('div');

    anchorPreview.id = 'medium-editor-anchor-preview-' + this.id;
    anchorPreview.className = 'medium-editor-anchor-preview';
    anchorPreview.innerHTML = this.anchorPreviewTemplate();
    this.options.elementsContainer.appendChild(anchorPreview);

    anchorPreview.addEventListener('click', function () {
      ipc.sendChannel('open-anchor',
                      anchorPreview.querySelector('i').textContent);
    });

    return anchorPreview;
  };

  module.exports = MediumEditor;
})();
