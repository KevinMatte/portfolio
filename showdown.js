const mustache = require('mustache');

const showdown = require('showdown'),
    converter = new showdown.Converter();

const fs = require('fs');
const inputFile = process.argv[2];
let templateFile = process.argv[3];
let outputFile = process.argv[4];

if (!outputFile) {
    outputFile = templateFile;
    templateFile = null;
}

if (!inputFile || !outputFile) {
    // noinspection ES6ModulesDependencies
    // noinspection ES6ModulesDependencies
    // noinspection ES6ModulesDependencies
    // noinspection ES6ModulesDependencies
    console.log(`Usage:  ${process.argv[0]} ${process.argv[1]} input.md output.template output.html`);
    // noinspection ES6ModulesDependencies
    // noinspection ES6ModulesDependencies
    process.exit(1);
}


let inputHtml = null;
let promise;

promise = new Promise((resolve, reject) => {
    // noinspection JSUnresolvedFunction
    fs.readFile(inputFile, 'utf8', function (err, contents) {
        if (err !== null) {
            reject(`Read error file='${inputFile}': ${err}`);
        } else {
            inputHtml = converter.makeHtml(contents);
            resolve(inputHtml);
        }
    });
});

let templateText = null;
if (templateFile) {
    promise = promise.then((t) => {
        return new Promise((resolve, reject) => {
            // noinspection JSUnresolvedFunction
            fs.readFile(templateFile, 'utf8', function (err, contents) {
                if (err !== null) {
                    reject(`Read error file='${templateFile}': ${err}`);
                } else {
                    templateText = contents;
                    const view = {
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
        // noinspection JSUnresolvedFunction
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
  // noinspection ES6ModulesDependencies
    // noinspection ES6ModulesDependencies
    process.exit(1);
});


