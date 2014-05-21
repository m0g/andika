var app = require('app')
  , Menu = require('menu')
  , MenuItem = require('menu-item')
  , ipc = require('ipc')
  , MainMenu = require('./main_menu')
  , BrowserWindow = require('browser-window')  // Module to create native browser window
  //, Writer = require('./writer')
  , dialog = require('dialog');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the javascript object is GCed.
var mainWindow = null;
  //, writer = new Writer();

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit();
});

app.on('open-file', function(filePath) {
  writer.openFile(filePath);
});

// This method will be called when atom-shell has done everything
// initialization and ready for creating browser windows.
app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1024, height: 700});

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Build window menu
  var mainMenu = new MainMenu(mainWindow);

  ipc.on('init-new-file', function() {
    mainMenu.enableSave();
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
