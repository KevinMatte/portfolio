var mustache = require('mustache');

var showdown = require('showdown'),
    converter = new showdown.Converter();

var fs = require('fs');
var inputFile = process.argv[2];
var templateFile = process.argv[3];
var outputFile = process.argv[4];

if (!outputFile) {
    outputFile = templateFile;
    templateFile = null;
}

if (!inputFile || !outputFile) {
    console.log(`Usage:  ${process.argv[0]} ${process.argv[1]} input.md output.template output.html`)
    process.exit(1);
}


var inputHtml = null;
var promise;

promise = new Promise((resolve, reject) => {
    fs.readFile(inputFile, 'utf8', function (err, contents) {
        if (err !== null) {
            reject(`Read error file='${inputFile}': ${err}`);
        } else {
            inputHtml = converter.makeHtml(contents);
            resolve(inputHtml);
        }
    });
});

var templateText = null;
if (templateFile) {
    promise = promise.then((t) => {
        return new Promise((resolve, reject) => {
            fs.readFile(templateFile, 'utf8', function (err, contents) {
                if (err !== null) {
                    reject(`Read error file='${templateFile}': ${err}`);
                } else {
                    templateText = contents;
                    var view = {
                        "body": inputHtml,
                    };
                    inputHtml = mustache.render(templateText, view);
                    resolve(inputHtml);
                }
            });
        });
    });
}

promise = promise.then(() => {
    return new Promise((resolve, reject) => {
        fs.writeFile(outputFile, inputHtml, function (err) {
            if (err !== null) {
                reject(`Write error file='${outputFile}': ${err}`);
            } else {
                resolve(true);
            }
        });

    });
});

promise.catch(function(error) {
  console.log(error);
  process.exit(1);
});


