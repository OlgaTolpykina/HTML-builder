const path = require('path');
const fs = require('fs');

const pathToFolder = path.join(__dirname, 'secret-folder');

fs.readdir(pathToFolder, 
    { withFileTypes: true },
    (err, files) => {
    if (err) {
        console.log(err)
    } else {
        console.log('Inside secret-folder there are the following files: \n');
        files.forEach(file => {
            const aimFile = path.join(__dirname, 'secret-folder', file.name);
            fs.stat(aimFile, (err, stats) => {
                if (err) {
                    console.log(err);
                } else if (file.isFile()) {
                    console.log(`${path.basename(file.name, path.extname(file.name))} - ${path.extname(file.name).slice(1)} - ${Math.round(stats.size / 1024)}kb`);
                }
            });
        });
    }
})