(function() {
  exports.toTop = function() {
    var currentScrollTop = document.getElementById('editor-wrapper').scrollTop;
    console.log(currentScrollTop);

    scrollAnimation('up', 0, 200, currentScrollTop, 1);
  };

  exports.toBottom = function() {
    var currentScrollTop = document.getElementById('editor-wrapper').scrollTop
      , documentHeight = document.getElementById('editor').scrollHeight;
    console.log(currentScrollTop, documentHeight);

    scrollAnimation('down', documentHeight, 200, currentScrollTop, 1);
  };

  exports.toOffset = function(destination) {
    var currentScrollTop = document.getElementById('editor-wrapper').scrollTop;

    if (destination > currentScrollTop)
      scrollAnimation('down', destination - 10, 200, currentScrollTop, 1);
    else
      scrollAnimation('up', destination - 10, 200, currentScrollTop, 1);
  };

  // PRIVATE
  var scrollTimeout = function(direction, destination, iteration, position, temp) {
    setTimeout(function() {
      scrollAnimation(direction, destination, iteration, position, temp);
    }, temp);
  },

  scrollAnimation = function(direction, destination, iteration, position, temp) {
    if (direction == 'up' && position - iteration >= destination) {
      document.getElementById('editor-wrapper').scrollTop = position - iteration;

      scrollTimeout(direction, destination, iteration, (position - iteration), temp);
    } else if (direction == 'down' && iteration + position <= destination) {
      document.getElementById('editor-wrapper').scrollTop = iteration + position;

      scrollTimeout(direction, destination, iteration, (iteration + position), temp);
    } else
      document.getElementById('editor-wrapper').scrollTop = destination;
  };
})();
