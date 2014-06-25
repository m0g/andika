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
          mainMenu.currentFile = res[0];

          mainWindow.webContents.send('open-file', currentFile);
        }
      });
    };

    if (mainMenu.confirmToClose) 
      messageBox.modified(mainMenu, dialogBox);
    else dialogBox();
  },

  save = function() {
    if (!mainMenu.saveStatus()) return false;

    if (currentFile)
      mainWindow.webContents.send('save-current-file', true);
    else
      dialog.showSaveDialog({ title: 'new-file.md' }, function(res) {
        if (res) {
          currentFile = res.replace(/\.\w+$/g, '') + '.md'
          mainWindow.webContents.send('save-new-file', currentFile);
        }
      });
  }

  this.confirmToClose = false;
  this.mainWindow = mainWindow;
  this.menu = null;

  if (process.platform == 'darwin')
    this.template = [{
      label: 'Andika',
      submenu: [{
          label: 'About Andika',
          selector: 'orderFrontStandardAboutPanel:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Hide Atom Shell',
          accelerator: 'Command+H',
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          selector: 'hideOtherApplications:'
        },
        {
          label: 'Show All',
          selector: 'unhideAllApplications:'
        },
        {
          type: 'separator'
        },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: function() { app.quit(); }
        }],
      label: 'File',
      submenu: [{
        label: 'New',
          accelerator: 'Command+N',
          click: newFileClick
        },
        {
          label: 'Open',
          accelerator: 'Command+O',
          click: openFileClick
        },
        {
          label: 'Save',
          selector: 'save',
          enabled: false,
          accelerator: 'Command+S',
          click: save
        },
        {
          label: 'Close',
          accelerator: 'Command+W',
          click: function() {
            mainWindow.close();
          }
        }],
      label: 'Edit',
      submenu: [{
        label: 'Undo',
          accelerator: 'Command+Z',
          click: function() {
            mainWindow.webContents.send('undo', true);
          }
        },
        {
          label: 'Redo',
          accelerator: 'Command+Y',
          click: function() {
            mainWindow.webContents.send('redo', true);
          }
        }],
      label: 'View',
      submenu: [{
          label: 'Reload',
          accelerator: 'Command+R',
          click: function() { mainWindow.restart(); }
        },
        {
          label: 'Enter Fullscreen',
          click: function() { mainWindow.setFullscreen(true); }
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'Alt+Command+I',
          click: function() { mainWindow.toggleDevTools(); }
        }],
      label: 'Selection',
      submenu: [{
          label: 'Scroll to top',
          accelerator: 'Command+G',
          click: function() {
            mainWindow.webContents.send('scroll-to', 'top');
          }
        },
        {
          label: 'Scroll to Bottom',
          accelerator: 'Command+Shift+G',
          click: function() {
            mainWindow.webContents.send('scroll-to', 'bottom');
          }
        }],
      label: 'Format',
      submenu: [{
          label: 'H1: Title',
          accelerator: 'Command+1',
          click: function() {
            mainWindow.webContents.send('format-to-h1', true);
          }
        },
        {
          label: 'H2: Chapter',
          accelerator: 'Command+2',
          click: function() {
            mainWindow.webContents.send('format-to-h2', true);
          }
        },
        {
          label: 'H3',
          accelerator: 'Command+3',
          click: function() {
            mainWindow.webContents.send('format-to-h3', true);
          }
        },
        {
          type: 'separator'
        },
        {
          label: 'Bold',
          accelerator: 'Command+B',
          click: function() {
            mainWindow.webContents.send('format-to-bold', true);
          }
        },
        {
          label: 'Italic',
          accelerator: 'Command+I',
          click: function() {
            mainWindow.webContents.send('format-to-italic', true);
          }
        },
        {
          label: 'Link',
          accelerator: 'Command+K',
          click: function() {
            mainWindow.webContents.send('format-to-link', true);
          }
        }]
    }];
  else
    this.template = [
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
        label: 'Selection',
        submenu: [
          {
            label: 'Scroll to top',
            accelerator: 'Ctrl+G',
            click: function() {
              mainWindow.webContents.send('scroll-to', 'top');
            }
          },
          {
            label: 'Scroll to Bottom',
            accelerator: 'Ctrl+Shift+G',
            click: function() {
              mainWindow.webContents.send('scroll-to', 'bottom');
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
            accelerator: 'Shift+Ctrl+I',
            click: function() { mainWindow.toggleDevTools(); }
          },
        ]
      },
      {
        label: 'Format',
        submenu: [
          {
            label: 'H1: Title',
            accelerator: 'Ctrl+1',
            click: function() {
              mainWindow.webContents.send('format-to-h1', true);
            }
          },
          {
            label: 'H2: Chapter',
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
            type: 'separator'
          },
          {
            label: 'Bold',
            accelerator: 'Ctrl+B',
            click: function() {
              mainWindow.webContents.send('format-to-bold', true);
            }
          },
          {
            label: 'Italic',
            accelerator: 'Ctrl+I',
            click: function() {
              mainWindow.webContents.send('format-to-italic', true);
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

  this.menu = Menu.buildFromTemplate(this.template);

  if (process.platform == 'darwin')
    Menu.setApplicationMenu(this.menu);
  else
    this.mainWindow.setMenu(this.menu);

  this.currentFile = currentFile;
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

  if (process.platform == 'darwin')
    Menu.setApplicationMenu(this.menu);
  else
    this.mainWindow.setMenu(this.menu);
}

MainMenu.prototype.saveStatus = function() {
  return this.menu.items[0].submenu.items[1].enabled;
};

MainMenu.prototype.save = function(callback) {
  console.log(this);
  var mainMenu = this;
  if (!mainMenu.saveStatus()) return false;

  if (this.currentFile) {
    this.mainWindow.webContents.send('save-current-file', true);
    callback();
  } else
    dialog.showSaveDialog({ title: 'new-file.md' }, function(res) {
      if (res) {
        mainMenu.currentFile = res.replace(/\.\w+$/g, '') + '.md'
        mainMenu.mainWindow.webContents.send('save-new-file', mainMenu.currentFile);
        callback();
      }
    });
}


module.exports = MainMenu;
