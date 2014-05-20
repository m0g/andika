(function() {
  var fs = require('fs')
    , Writer = require('./writer')
    , ipc = require('ipc');

  window.onload = function() {
    var writer = new Writer()
      , currentFile = ''
      , title = document.getElementsByTagName('title')[0]
      , editor = document.getElementById('editor');

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
  };
})();
