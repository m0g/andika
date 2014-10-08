var ipc = require('ipc')
  , notify = require('./notify')
  , exportation = require('./exportation')
  , scrollDocument = require('./scroll-document')
  , FormatSelection = require('./format-selection');

module.exports = function(title, editor, currentFile, writer, generateMap,
                          charAndWordCounter, currentNotModified) {
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

      document.getElementById('home').remove();
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
}
