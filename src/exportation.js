(function() {
  exports.toPDF = function(path) {
    var JsPDF = require('./jspdf');
    var fs = require('fs')
    var pdf = new JsPDF();

    pdf.fromHTML(document.getElementById('editor'), 15, 15, {
      'width': 170
    });

    var data64 = pdf.output('base64');

    fs.writeFile(path, data64, 'base64', function(err) {
      if(err) console.log(err);
      console.log('done');
    });
  }
})();

