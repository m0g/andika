(function() {
  var fs = require('fs')
    , Writer = require('./writer')
    , ipc = require('ipc');

  window.onload = function() {
    var writer = new Writer()
      , currentFile = ''
      , title = document.getElementsByTagName('title')[0]
      , editor = document.getElementById('editor');

    var editorKeyUp = function() {
      if(!currentFile && this.innerHTML.length > 0) {
        ipc.sendChannel('init-new-file', true);
        currentFile = 'New file';
        editor.removeEventListener('keyup', editorKeyUp);
      }
    };

    editor.addEventListener('keyup', editorKeyUp);

    ipc.sendChannel('window-loaded', true);

    ipc.on('open-file', function(filePath) {
      writer.openFile(filePath, function(data) {
        title.innerHTML = 'Andika - ' + filePath;
        editor.innerHTML = data;
        currentFile = filePath;
      });
    });

    ipc.on('save-current-file', function(toSave) {
      alert('To save');
      writer.saveFile(currentFile, editor.innerHTML, function(res) {
        console.log(res);
      });
    });

    ipc.on('save-new-file', function(filePath) {
      alert('save new file');
      writer.saveFile(filePath, editor.innerHTML, function(res) {
        title.innerHTML = 'Andika - ' + filePath;
        currentFile = filePath;
      });
    });
  };
})();
