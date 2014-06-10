var Menu = require('menu')
  , messageBox = require('./message-box')
  , dialog = require('dialog');

MainMenu = function(mainWindow) {
  var currentFile = '',

  newFileClick = function(res) {
    if (mainMenu.confirmToClose)
      messageBox.modified(function() {
        mainWindow.webContents.send('new-file', true);
      });
    else
      mainWindow.webContents.send('new-file', true);
  },

  openFileClick = function(res) {
    var dialogBox = function() {
      dialog.showOpenDialog({ properties: ['openFile']}, function(res) {
        if (res) {
          if (res[0].match(/\.md$|\.markdown$/i))
          currentFile = res[0];

          mainWindow.webContents.send('open-file', currentFile);
        }
      });
    };

    if (mainMenu.confirmToClose) messageBox.modified(dialogBox);
    else dialogBox();
  },

  save = function() {
    if (!mainMenu.saveStatus()) return false;

    if (currentFile)
      mainWindow.webContents.send('save-current-file', true);
    else
      dialog.showSaveDialog({ title: 'new-file.md' }, function(res) {
        if (res) {
          currentFile = res;
          mainWindow.webContents.send('save-new-file', res);
        }
      });
  }

  this.confirmToClose = false;
  this.mainWindow = mainWindow;
  this.menu = null
    , template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'Ctrl+N',
          click: newFileClick
        },
        {
          label: 'Open',
          accelerator: 'Ctrl+O',
          click: openFileClick
        },
        {
          label: 'Save',
          selector: 'save',
          enabled: false,
          accelerator: 'Ctrl+S',
          click: save
        },
        {
          label: 'Close',
          accelerator: 'Ctrl+W',
          click: function() {
            mainWindow.close();
          }
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Ctrl+Z',
          click: function() {
            mainWindow.webContents.send('undo', true);
          }
        },
        {
          label: 'Redo',
          accelerator: 'Ctrl+Y',
          click: function() {
            mainWindow.webContents.send('redo', true);
          }
        }
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
    {
      label: 'Format',
      submenu: [
        {
          label: 'H1',
          accelerator: 'Ctrl+1',
          click: function() {
            mainWindow.webContents.send('format-to-h1', true);
          }
        },
        {
          label: 'H2',
          accelerator: 'Ctrl+2',
          click: function() {
            mainWindow.webContents.send('format-to-h2', true);
          }
        },
        {
          label: 'H3',
          accelerator: 'Ctrl+3',
          click: function() {
            mainWindow.webContents.send('format-to-h3', true);
          }
        },
        {
          label: 'Link',
          accelerator: 'Ctrl+K',
          click: function() {
            mainWindow.webContents.send('format-to-link', true);
          }
        }
      ]
    }
  ];

  this.menu = Menu.buildFromTemplate(template);
  this.mainWindow.setMenu(this.menu);

  var mainMenu = this;
}

MainMenu.prototype.openFileClick = function() {
  var mainMenu = this;
  dialog.showOpenDialog({ properties: ['openFile']}, function(res) {
    enableSave();
  });
};

MainMenu.prototype.enableSave = function() {
  this.menu.items[0].submenu.items[1].enabled = true;
  this.mainWindow.setMenu(this.menu);
}

MainMenu.prototype.saveStatus = function() {
  return this.menu.items[0].submenu.items[1].enabled;
};

module.exports = MainMenu;
