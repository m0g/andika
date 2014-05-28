(function() {
  var fs = require('fs')
    , Writer = require('./writer')
    , notify = require('./notify')
    , setCursorLine = require('./set-cursor-line')
    , FormatSelection = require('./format-selection')
    , ipc = require('ipc');

  window.onload = function() {
    var writer = new Writer()
      //, currentFile = ''
      , currentFile = { name: '', path: '', modified: false }
      , title = document.getElementsByTagName('title')[0]
      , editor = document.getElementById('editor')
      , charCounterVal = document.getElementById('char-counter-value');

    var editorKeyDown = function() {
      if(!currentFile.path && this.innerHTML.length > 0) {
        ipc.sendChannel('init-new-file', true);
        currentFile.path = 'New file';
        editor.removeEventListener('keyup', editorKeyUp);
      }
    },

    charCounter = function() {
      charCounterVal.innerText = editor.innerText.length;

      if(writer.nbChars == 0)
        writer.nbChars = editor.innerText.length;
    },

    modifiedListener = function() {
      var hasBeenModified = writer.hasBeenModified(editor.innerText);

      if (currentFile.path == 'New file') {
        currentFile.modified = true;
        title.innerText = title.innerText.replace(/\s\*$/i, '') + ' *';
        ipc.sendChannel('has-been-modified', true);

      } else if (hasBeenModified) {
        currentFile.modified = true;
        title.innerText = title.innerText.replace(/\s\*$/i, '') + ' *';
        ipc.sendChannel('has-been-modified', true);

      } else {
        currentFile.modified = false;
        title.innerText = title.innerText.replace(/\s\*$/i, '');
        ipc.sendChannel('has-been-modified', false);
      }
    }

    // Events
    editor.addEventListener('keydown', editorKeyDown);
    editor.addEventListener('keyup', charCounter);
    editor.addEventListener('keyup', modifiedListener);
    editor.addEventListener('keyup', setCursorLine);
    editor.addEventListener('click', setCursorLine);

    ipc.sendChannel('window-loaded', true);

    ipc.on('open-file', function(filePath) {
      writer.openFile(filePath, function(data) {
        title.innerHTML = 'Andika - ' + filePath;
        editor.innerHTML = data;
        currentFile.path = filePath;
        writer.lastSaved = editor.innerHTML;
      });
    });

    ipc.on('save-current-file', function(toSave) {
      writer.saveFile(currentFile.path, editor.innerHTML, function(res) {
        notify('File saved');
      });
    });

    ipc.on('save-new-file', function(filePath) {
      writer.saveFile(filePath, editor.innerHTML, function(res) {
        title.innerHTML = 'Andika - ' + filePath;
        currentFile.path = filePath;
      });
    });

    ipc.on('format-to-h1', function() {
      var formatSelection = new FormatSelection();
      formatSelection.toH1();
    });

    ipc.on('format-to-h2', function() {
      var formatSelection = new FormatSelection();
      formatSelection.toH2();
    });

    ipc.on('format-to-h3', function() {
      var formatSelection = new FormatSelection();
      formatSelection.toH3();
    });
  };
})();
