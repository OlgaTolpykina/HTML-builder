const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

const pathToExistingFolder = path.join(__dirname, 'files'); 
const pathToNewFolder = path.join(__dirname, 'files-copy');

fs.readdir(pathToNewFolder, { withFileTypes: true }, (err, files) => {
    if (files) {
        files.forEach(file => {
            fs.rm(path.join(pathToNewFolder, file.name), (err) => {
                if (err) throw err;
            });
        });
    };
});

fsPromises.mkdir(pathToNewFolder, { recursive: true})
    .then(function() {
        fs.readdir(pathToExistingFolder, { withFileTypes: true }, (err, files) => {
            files.forEach(file => {
                fs.copyFile(path.join(pathToExistingFolder, file.name), path.join(pathToNewFolder, file.name), (err) => {
                    if (err) throw err;
                });
            });
        });
    })
    .catch(function() {
        console.log('failed to create directory');
    });
