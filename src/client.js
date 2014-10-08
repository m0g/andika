(function() {
  var fs = require('fs')
    , MediumEditor = require('./medium-editor')
    , ipc = require('ipc')
    , Writer = require('./writer')
    , ClientSocket = require('./client-socket')
    , generateMap = require('./generate-map')
    , setCursorLine = require('./set-cursor-line');

  window.onload = function() {
    var writer = new Writer()
      , currentFile = { name: '', path: '', modified: false }
      , title = document.getElementsByTagName('title')[0]
      , editor = document.getElementById('editor')
      , charCounterVal = document.getElementById('char-counter-value')
      , wordCounterVal = document.getElementById('word-counter-value');

    // Override default anchor preview behavior
    // TODO: Add an edit button after the link

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
      var innerText = editor.innerText.trim();

      charCounterVal.innerText = innerText.length;
      wordCounterVal.innerText = innerText.length ? innerText.split(/\s+/).length : 0;

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
    var clientSocket = new ClientSocket(title, editor, currentFile, writer, generateMap,
                                        charAndWordCounter, currentNotModified);
  };
})();
