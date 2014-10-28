'use strict';

(function() {
  exports.toPDF = function() {
    var JsPDF = require('./jspdf/jspdf')
      , fs = require('fs')
      , pdf = new JsPDF();

    pdf.text(20, 20, 'Hello world.');
    pdf.output('save', '/tmp/test.pdf', function(blob) {
      console.log(blob);

      fs.createReadStream(blob).pipe(fs.createWriteStream("/tmp/test.pdf"));
    });
  };
})();

