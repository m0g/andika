(function() {
  var fs = require('fs')
    , Writer = require('./writer')
    , notify = require('./notify')
    //, map = require('./map')
    , generateMap = require('./generate-map')
    , setCursorLine = require('./set-cursor-line')
    , FormatSelection = require('./format-selection')
    , ipc = require('ipc');

  window.onload = function() {
    var writer = new Writer()
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
    editor.addEventListener('keyup', charCounter);
    editor.addEventListener('keyup', modifiedListener);
    editor.addEventListener('keyup', setCursorLine);
    editor.addEventListener('click', setCursorLine);
    editor.addEventListener('keyup', generateMap);
    editor.addEventListener('click', generateMap);

    ipc.sendChannel('window-loaded', true);

    ipc.on('open-file', function(filePath) {
      writer.openFile(filePath, function(data) {
        title.innerHTML = 'Andika - ' + filePath;
        editor.innerHTML = data;
        currentFile.path = filePath;
        writer.lastSaved = editor.innerHTML;
        generateMap();
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

    ipc.on('format-to-link', function() {
      var formatSelection = new FormatSelection();
      formatSelection.toLink();
    });
  };
})();