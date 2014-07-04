(function() {
  var request = require('request')
    , sys = require('sys')
    , exec = require('child_process').exec
    , pace = require('pace')
    , fs = require('fs');

  // Get the latest release of Atom-shell
  var getLatestRelease = function(target, arch) {
    var options = {
      url: 'https://api.github.com/repos/atom/atom-shell/releases',
      headers: {
        'User-Agent': 'andika'
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var latestReleaseAssets = JSON.parse(body)[0]['assets']
          , versionNumber = JSON.parse(body)[0]['tag_name']


        latestReleaseAssets.some(function(asset) {
          var name = asset['name']
            , url = 'https://github.com/atom/atom-shell/releases/download/'
                  + versionNumber + '/' + name;

          if (name.indexOf(target) != -1 && name.indexOf(arch) != -1
            && name.indexOf('symbols') == -1) {
            hasAlreadyDownload(name, function() {
              console.log('Has already been downloaded');
            }, function() {
              downloadReleaseAsset(url, name, asset['size']);
            });
          }
        });
      }
    });
  },

  hasAlreadyDownload = function(name, success, failure) {
    if (fs.existsSync('build/' + name)) success();
    else failure();
  },

  downloadReleaseAsset = function(url, name, contentLength) {
    var options = {
      url: url,
      headers: {
        'User-Agent': 'andika'
      }
    };

    console.log('start downloading: '+name);
    var req = request(options)
      , received = 0, progress = 0;

    pace = pace(contentLength);

    req.pipe(fs.createWriteStream('build/' + name))

    req.on("data", function(data) {
      pace.op(data.length);
    });

    req.on("end", function() {
      console.log('File has been successfully downloaded');
    });
  };

  var system, architecture;

  process.argv.forEach(function (val, index, array) {
    if (index == 2 && ['win', 'linux', 'darwin', 'all'].indexOf(val) != -1)
      system = val;
    if (index == 3 && ['ia32', 'x64'].indexOf(val) != -1)
      architecture = val;
  });

  if (!fs.existsSync('build'))
    fs.mkdir("build", 0766, function(err){
      getLatestRelease(system, architecture);
    });
  else getLatestRelease(system, architecture);
})();
