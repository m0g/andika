(function() {
  var dialog = require('dialog');

  exports.modified = function(callback) {
    var messageBoxOptions = { 
      type: "warning",
      buttons: ['Save & continue', 'Cancel', 'Continue'],
      message: "Are you sure you're done with this file?"
    };

    dialog.showMessageBox(messageBoxOptions, function(res) {
      if (res == 2) callback();
    });
  }
})();
