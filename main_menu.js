var Menu = require('menu')
  , dialog = require('dialog');

MainMenu = function(mainWindow) {
  var openFileClick = function(res) {
    dialog.showOpenDialog({ properties: ['openFile']}, function(res) {
      mainMenu.enableSave();
      mainWindow.webContents.send('open-file', res[0]);
    });
  };

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
          click: function() {
            mainWindow.webContents.send('save-current-file', true);
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
      label: 'Edit',
      submenu: [
        {
          label: 'Undo',
          accelerator: 'Ctrl+Z'
          //click: function() { mainWindow.undo(); }
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
