'use strict';

var app = require('app')
  , ipc = require('ipc')
  , MainMenu = require('./main-menu')
  , BrowserWindow = require('browser-window')  // Module to create native browser window
  , open = require('open')
  , dialog = require('dialog');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;
  //, writer = new Writer();

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

app.on('open-file', function(filePath) {
  writer.openFile(filePath);
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024, height: 700, icon: __dirname + '/static/andika-logo-250.png'
  });

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Build window menu
  var mainMenu = new MainMenu(mainWindow)
    , confirmToClose = false;

  ipc.on('init-new-file', function() {
    mainMenu.enableSave();
  });

  ipc.on('open-anchor', function(event, link) {
    open(link);
  });

  ipc.on('has-been-modified', function(event, value) {
    confirmToClose = value;
    mainMenu.confirmToClose = value;
  });

  ipc.on('enable-save', function(event, value) {
    if (value) mainMenu.enableSave();
  });

  mainWindow.on('close', function(event) {
    if (confirmToClose) {
      event.preventDefault();

      var messageBoxOptions = { type: "warning",
                                buttons: ['Save & Quit', 'Cancel', 'Quit'],
                                message: "Are you sure you want to quit?" };

      dialog.showMessageBox(messageBoxOptions, function(res) {
        if (res == 2) {
          confirmToClose = false;
          mainWindow.close();
        } else if (res == 0) {
          mainMenu.save(function() {
            confirmToClose = false;
            mainWindow.close();
          });
        }
      });
    }
  });

  mainWindow.on('closed', function() {
    mainWindow = null;
  });
});
