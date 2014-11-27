(function() {
  'use strict';

  module.exports = function(text, callback) {
    var modal = document.getElementById('modal');
    var msg = modal.getElementsByClassName('msg')[0];

    modal.className = 'visible';
    msg.innerText = text;
  }
})();
