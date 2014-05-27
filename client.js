(function() {
  var fs = require('fs')
    , Writer = require('./writer')
    , notify = require('./notify')
    , setCursorLine = require('./set-cursor-line')
    , FormatSelection = require('./format-selection')
    , ipc = require('ipc');

  window.onload = function() {
    var writer = new Writer()
      , currentFile = ''
      , title = document.getElementsByTagName('title')[0]
      , editor = document.getElementById('editor')
      , charCounterVal = document.getElementById('char-counter-value');

    var editorKeyDown = function() {
      if(!currentFile && this.innerHTML.length > 0) {
        ipc.sendChannel('init-new-file', true);
        currentFile = 'New file';
        editor.removeEventListener('keyup', editorKeyUp);
      }
    },

    charCounter = function() {
      charCounterVal.innerText = editor.innerText.length;
    };

    // Events
    editor.addEventListener('keydown', editorKeyDown);
    editor.addEventListener('keyup', charCounter);
    editor.addEventListener('keyup', setCursorLine);
    editor.addEventListener('click', setCursorLine);

    ipc.sendChannel('window-loaded', true);

    ipc.on('open-file', function(filePath) {
      writer.openFile(filePath, function(data) {
        title.innerHTML = 'Andika - ' + filePath;
        editor.innerHTML = data;
        currentFile = filePath;
      });
    });

    ipc.on('save-current-file', function(toSave) {
      writer.saveFile(currentFile, editor.innerHTML, function(res) {
        notify('File saved');
      });
    });

    ipc.on('save-new-file', function(filePath) {
      writer.saveFile(filePath, editor.innerHTML, function(res) {
        title.innerHTML = 'Andika - ' + filePath;
        currentFile = filePath;
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
