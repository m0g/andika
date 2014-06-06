(function() {
  var fs = require('fs')
    , Writer = require('./writer')
    , notify = require('./notify')
    , generateMap = require('./generate-map')
    , setCursorLine = require('./set-cursor-line')
    , FormatSelection = require('./format-selection')
    , ipc = require('ipc');

  window.onload = function() {
    var writer = new Writer()
      , currentFile = { name: '', path: '', modified: false }
      , title = document.getElementsByTagName('title')[0]
      , editor = document.getElementById('editor')
      , charCounterVal = document.getElementById('char-counter-value')
      , wordCounterVal = document.getElementById('word-counter-value');

    var editorKeyDown = function() {
      if(!currentFile.path && this.innerHTML.length > 0) {
        ipc.sendChannel('init-new-file', true);
        currentFile.path = 'New file';
        editor.removeEventListener('keyup', editorKeyUp);
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
      console.log(event.ctrlKey);
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
    editor.addEventListener('click', setCursorLine);
    editor.addEventListener('keyup', generateMap);
    editor.addEventListener('click', generateMap);

    //document.addEventListener('keydown', function(event) {
    //  if (event.keyCode === 17)
    //    editor.contentEditable = false;
    //}, false);

    //document.addEventListener('keyup', function(event) {
    //  if (event.keyCode === 17)
    //      editor.contentEditable = true;
    //}, false);

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

        generateMap();
        charAndWordCounter();
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
