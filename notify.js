module.exports = function(text) {
  var notify = document.getElementById('notify');

  notify.innerText = text;
  notify.className = 'fade-in';

  setTimeout(function() {
    notify.className = 'fade-out';
  }, 2000);
}
