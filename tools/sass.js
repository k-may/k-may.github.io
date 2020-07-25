var sass = require('node-sass');
var path = require('path');
var fs = require('fs');

var directory = process.cwd();
var sassFolder = path.join(directory, 'scss');
var fileName = path.join(directory, 'scss/site.scss');
var outputFileName = path.join(directory, 'css/main.css');

var renderSass = () => {

    sass.render({
        file: fileName,
        outFile: outputFileName,
        sourceMap : true
    }, (err, result) => {

        if(err){
            console.log(err);
            return;
        }
        fs.writeFile(outputFileName, result.css, function (err) {
            if (!err) {
                //file written on disk
            }
        });

        fs.writeFile(outputFileName + '.map', result.map, function (err) {
            if (!err) {
                //file written on disk
            }
        });
    });
}

var watch = (path, cb) => {
    var tmeOut;
    fs.watch(path, {recursive: true}, () => {
        if (!tmeOut) {
            tmeOut = setTimeout(() => {
                cb();
                tmeOut = null;
            });
        }
    });
}

watch(sassFolder, renderSass);
renderSass();