'use strict';

(function() {
  var dialog = require('dialog');

  exports.modified = function(mainMenu, callback) {
    var messageBoxOptions = { 
      type: "warning",
      buttons: ['Save & continue', 'Cancel', 'Continue'],
      message: "Are you sure you're done with this file?"
    };

    dialog.showMessageBox(messageBoxOptions, function(res) {
      if (res == 2) callback();
      else if (res == 0) {
        mainMenu.save(callback);
      }
    });
  };
})();
