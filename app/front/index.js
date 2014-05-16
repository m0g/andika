(function() {
  var fs = require('fs')
    , Writer = require('./writer')
    , ipc = require('ipc');

  window.onload = function() {
    var writer = new Writer()
      , editor = document.getElementById('editor');

    ipc.sendChannel('window-loaded', true);

    ipc.on('open-file', function(filePath) {
      //alert('incoming file: ' + filePath);

      writer.openFile(filePath, function(data) {
        //alert('File received!');
        editor.innerHTML = data;
      });
    });
  };
})();
