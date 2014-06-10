//module.exports = function(text) {
module.exports = function() {
  var text = arguments[0];
  var isError = typeof(arguments[1]) != 'undefined' ? arguments[1] : false;
  var notify = document.getElementById('notify');

  notify.innerText = text;
  notify.className = 'fade-in';

  if (isError) notify.className += ' error';

  setTimeout(function() {
    notify.className = 'fade-out';

    if (isError) notify.className += ' error';
  }, 2000);
}
