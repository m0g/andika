(function() {
  var fs = require('fs')
    , Writer = require('./writer')
    , notify = require('./notify')
    , setCursorLine = require('./set-cursor-line')
    , ipc = require('ipc');

  window.onload = function() {
    var writer = new Writer()
      , currentFile = ''
      , title = document.getElementsByTagName('title')[0]
      , editor = document.getElementById('editor');

    var editorKeyDown = function() {
      if(!currentFile && this.innerHTML.length > 0) {
        ipc.sendChannel('init-new-file', true);
        currentFile = 'New file';
        editor.removeEventListener('keyup', editorKeyUp);
      }
    };

    editor.addEventListener('keydown', editorKeyDown);
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
      //alert('To save');
      writer.saveFile(currentFile, editor.innerHTML, function(res) {
        console.log(res);
        notify('File saved');
      });
    });

    ipc.on('save-new-file', function(filePath) {
      //alert('save new file');
      writer.saveFile(filePath, editor.innerHTML, function(res) {
        title.innerHTML = 'Andika - ' + filePath;
        currentFile = filePath;
      });
    });
  };
})();
