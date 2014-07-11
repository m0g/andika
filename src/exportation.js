(function() {
  exports.toPDF = function() {
    var JsPDF = require('./jspdf/jspdf');
    var fs = require('fs')
    var pdf = new JsPDF();

    pdf.text(20, 20, 'Hello world.');
    pdf.output('save', '/tmp/test.pdf', function(blob) {
      console.log(blob);

      fs.createReadStream(blob).pipe(fs.createWriteStream("/tmp/test.pdf"))

      //fs.writeFile('/tmp/test.pdf', blob, function(err) {
      //  if(err) console.log(err);
      //  console.log('done');
      //});
    });
  }
})();
