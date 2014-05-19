var app = require('app')
  , Menu = require('menu')
  , MenuItem = require('menu-item')
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

  var template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open',
          accelerator: 'Ctrl+O',
          click: function() {
            dialog.showOpenDialog({ properties: [ 'openFile' ]}, function(res) {
             //app.emit('open-file', res[0]);
              mainWindow.webContents.send('open-file', res[0]);
            });
          }
        },
        {
          label: 'Close',
          accelerator: 'Ctrl+W',
          click: function() { mainWindow.close(); }
        },
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'Ctrl+R',
          click: function() { mainWindow.restart(); }
        },
        {
          label: 'Enter Fullscreen',
          accelerator: 'F11',
          click: function() { 
            mainWindow.setFullScreen((!mainWindow.isFullScreen()));
          }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+Ctrl+I',
          click: function() { mainWindow.toggleDevTools(); }
        },
      ]
    },
  ];

  //window.addEventListener('contextmenu', function (e) {
  //  e.preventDefault();
  //  menu.popup();
  //}, false);

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  menu = Menu.buildFromTemplate(template);
  mainWindow.setMenu(menu);

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
