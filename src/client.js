(function() {
  var fs = require('fs')
    , MediumEditor = require('medium-editor')
    , ipc = require('ipc')
    , Writer = require('./writer')
    , notify = require('./notify')
    , exportation = require('./exportation')
    , generateMap = require('./generate-map')
    , setCursorLine = require('./set-cursor-line')
    , scrollDocument = require('./scroll-document')
    , FormatSelection = require('./format-selection');

  window.onload = function() {
    var writer = new Writer()
      , currentFile = { name: '', path: '', modified: false }
      , title = document.getElementsByTagName('title')[0]
      , editor = document.getElementById('editor')
      , charCounterVal = document.getElementById('char-counter-value')
      , wordCounterVal = document.getElementById('word-counter-value');

    // Override default anchor preview behavior
    // TODO: Add an edit button after the link
    MediumEditor.prototype.createAnchorPreview = function() {
      var self = this,
          anchorPreview = document.createElement('div');

      anchorPreview.id = 'medium-editor-anchor-preview-' + this.id;
      anchorPreview.className = 'medium-editor-anchor-preview';
      anchorPreview.innerHTML = this.anchorPreviewTemplate();
      this.options.elementsContainer.appendChild(anchorPreview);

      anchorPreview.addEventListener('click', function () {
        ipc.sendChannel('open-anchor',
                        anchorPreview.querySelector('i').textContent);
      });

      return anchorPreview;
    }

    var mediumEditor = new MediumEditor('#editor', {
      placeholder: '',
      buttons: ['bold', 'italic', 'quote',
                'anchor', 'unorderedlist'],
      cleanPastedHTML: true,
      firstHeader: 'h1',
      secondHeader: 'h2',
      delay: 200,
      targetBlank: true
    });

    var editorKeyDown = function() {
      if(!currentFile.path && this.innerHTML.length > 0) {
        ipc.sendChannel('init-new-file', true);
        currentFile.path = 'New file';
        editor.removeEventListener('keydown', editorKeyDown);
      }
    },

    charAndWordCounter = function() {
      charCounterVal.innerText = editor.innerText.length;
      wordCounterVal.innerText = editor.innerText.split(/\s+/).length;

      if(writer.nbChars == 0)
        writer.nbChars = editor.innerText.length;
    },

    currentModified = function() {
      currentFile.modified = true;
      title.innerText = title.innerText.replace(/\s\*$/i, '') + ' *';
      ipc.sendChannel('has-been-modified', true);
    },

    currentNotModified = function() {
      currentFile.modified = false;
      title.innerText = title.innerText.replace(/\s\*$/i, '');
      ipc.sendChannel('has-been-modified', false);
    },

    clickLink = function(event) {
      var links = editor.getElementsByTagName('a');

      for (var i = 0, link; link = links[i]; i++)
        link.onclick = function(event) {
          event.preventDefault();
          alert('User has clicked!');
        };
    },

    overrideAnchors = function() {
      editor.addEventListener('keyup', setCursorLine);
    },

    modifiedListener = function() {
      var hasBeenModified = writer.hasBeenModified(editor.innerText);

      if (currentFile.path == 'New file')
        currentModified();
      else if (hasBeenModified)
        currentModified();
      else
        currentNotModified();
    };

    // Events
    editor.addEventListener('keydown', editorKeyDown);
    editor.addEventListener('keyup', charAndWordCounter);
    editor.addEventListener('keyup', modifiedListener);
    editor.addEventListener('keyup', setCursorLine);
    editor.addEventListener('keyup', overrideAnchors);
    editor.addEventListener('click', setCursorLine);
    editor.addEventListener('keyup', generateMap);
    editor.addEventListener('click', generateMap);

    // Sockets
    ipc.sendChannel('window-loaded', true);

    ipc.on('new-file', function(val) {
      title.innerHTML = 'Andika';
      editor.innerHTML = '';
      currentFile.path = '';

      charAndWordCounter();
    });

    ipc.on('open-file', function(filePath) {
      writer.openFile(filePath, function(data) {
        title.innerHTML = 'Andika - ' + filePath;
        editor.innerHTML = data;
        currentFile.path = filePath;
        writer.lastSaved = editor.innerHTML;

        ipc.sendChannel('enable-save', true);

        generateMap();
        charAndWordCounter();
      }, function() {
        notify('Error: file is not a valid .md or .markdown file', true);
      });
    });

    ipc.on('save-current-file', function(toSave) {
      writer.saveFile(currentFile.path, editor.innerHTML, function(res) {
        notify('File saved');
        currentNotModified();
        writer.nbChars = editor.innerText.length;
      });
    });

    ipc.on('save-new-file', function(filePath) {
      writer.saveFile(filePath, editor.innerHTML, function(res) {
        title.innerHTML = 'Andika - ' + filePath;
        currentFile.path = filePath;
        currentNotModified();
        writer.nbChars = editor.innerText.length;
      });
    });

    ipc.on('format-to', function(tag) {
      var formatSelection = new FormatSelection();
      formatSelection.to(tag);
    });

    ipc.on('cut', function() {
      document.execCommand('cut', false, null);
    });

    ipc.on('copy', function() {
      document.execCommand('copy', false, null);
    });

    ipc.on('paste', function() {
      document.execCommand('paste', false, null);
    });

    ipc.on('undo', function() {
      document.execCommand('undo', false, null);
    });

    ipc.on('redo', function() {
      document.execCommand('redo', false, null);
    });

    ipc.on('export-to-pdf', function() {
      exportation.toPDF();
    });

    ipc.on('scroll-to', function(direction) {
      if (direction == 'top')
        scrollDocument.toTop();
      else
        scrollDocument.toBottom();
    });
  };
})();
