var Menu = require('menu')
  , dialog = require('dialog');

MainMenu = function(mainWindow) {
  var currentFile = '',

  openFileClick = function(res) {
    dialog.showOpenDialog({ properties: ['openFile']}, function(res) {
      currentFile = res[0];
      mainMenu.enableSave();
      mainWindow.webContents.send('open-file', currentFile);
    });
  },

  save = function() {
    if (currentFile)
      mainWindow.webContents.send('save-current-file', true);
    else
      dialog.showSaveDialog({ title: 'new-file.md' }, function(res) {
        currentFile = res;
        mainWindow.webContents.send('save-new-file', res);
      });
  }

  this.mainWindow = mainWindow;
  this.menu = null
    , template = [
    {
      label: 'File',
      submenu: [
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
          click: function() { mainWindow.close(); }
        },
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Ctrl+Z'
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

module.exports = MainMenu;
