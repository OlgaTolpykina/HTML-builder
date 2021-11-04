const path = require('path');
const fs = require('fs');

const pathToStyles = path.join(__dirname, 'styles');
const pathToBundle = path.join(__dirname, 'project-dist', 'bundle.css');
const bundle = fs.createWriteStream(pathToBundle);

fs.readdir(pathToStyles, { withFileTypes:true }, (err, files) => {
    files.forEach(file => {
        if (file.isFile() && path.extname(file.name) == '.css') {
            const pathToFile = path.join(pathToStyles, file.name);
            const readableStream = fs.createReadStream(pathToFile, 'utf-8');

            let data='';
            readableStream.on('data', chunk => bundle.write(data += chunk));
        }
    });
});