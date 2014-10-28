'use strict';

(function() {
  var cursorPosition = require('./cursor-position');

  // Scroll to the top of the document
  exports.toTop = function() {
    var currentScrollTop = document.getElementById('editor-wrapper').scrollTop
      , windowHeight = document.body.scrollHeight
      , documentHeight = document.getElementById('editor').scrollHeight
      , iteration = (documentHeight / windowHeight) * 5;

    scrollAnimation('up', 0, 200, currentScrollTop, 1);
    cursorPosition.toTop();
  };

  // Scroll to the bottom of the document
  exports.toBottom = function() {
    var currentScrollTop = document.getElementById('editor-wrapper').scrollTop
      , windowHeight = document.body.scrollHeight
      , documentHeight = document.getElementById('editor').scrollHeight
      , iteration = (documentHeight / windowHeight) * 5;

    scrollAnimation('down', documentHeight, 200, currentScrollTop, 1);
    cursorPosition.toBottom();
  };

  // Scroll to a specific Y coordinate
  exports.toOffset = function(destination) {
    var currentScrollTop = document.getElementById('editor-wrapper').scrollTop
      , windowHeight = document.body.scrollHeight
      , documentHeight = document.getElementById('editor').scrollHeight
      , iteration = (documentHeight / windowHeight) * 5;

    console.log(iteration);
    if (destination > currentScrollTop)
      scrollAnimation('down', destination - 10, iteration, currentScrollTop, 1);
    else
      scrollAnimation('up', destination - 10, iteration, currentScrollTop, 1);
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
