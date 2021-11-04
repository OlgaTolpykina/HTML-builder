const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

const projectFolder = path.join(__dirname, 'project-dist');
const htmlFile = path.join(projectFolder, 'index.html');
const template = path.join(__dirname, 'template.html');
const regexp = /{{[a-z]+}}/g;
const readableStream = fs.createReadStream(template, 'utf-8');
const writableStream = fs.createWriteStream(htmlFile, 'utf-8');

const buildPage = async() => {
    await createFolder(projectFolder);
    await formHTML();
    await createStyleBundle();
    await copyAssetsFolder();
}

const createFolder = async(nameFolder) => {
    await fsPromises.mkdir(nameFolder, { recursive: true });
}

const formHTML = () => {
    let markdown = ''; 
    let array = [];
    let tagContent = '';
    readableStream.on('data', (chunk) => {
        array = chunk.match(regexp);
        tagContent = chunk;    
    });

    readableStream.on('end', (chunk) => {
        array.forEach((item, i) => {
            const steam = replaceTags(item);
            steam.on('data', chunk => {
                tagContent = tagContent.replace(item, chunk);
            });
            steam.on('end', () => {
                if (i === array.length - 1) writableStream.write(tagContent);
            });
        });
    });
}

const replaceTags = (templateTag) => {
    const fileName = templateTag.slice(2,-2);
    const pathToFile = path.join(__dirname, 'components', `${fileName}.html`);
    const componentsContent = fs.createReadStream(pathToFile, 'utf-8');
    return componentsContent;
}

const createStyleBundle = () => { 

    const pathToStyles = path.join(__dirname, 'styles');
    const pathToBundle = path.join(__dirname, 'project-dist', 'style.css');
    const bundle = fs.createWriteStream(pathToBundle);

    fs.readdir(pathToStyles, { withFileTypes:true }, (err, files) => {
        files.forEach(file => {
            if (file.isFile() && path.extname(file.name) == '.css') {
                const pathToFile = path.join(pathToStyles, file.name);
                const readableStream = fs.createReadStream(pathToFile, 'utf-8');

                let data='';
                readableStream.on('data', chunk => bundle.write(data += `\n${chunk}\n`));
            }
        });
    });
}

const copyAssetsFolder = () => {
    const pathToExistingFolder = path.join(__dirname, 'assets');
    const pathToNewFolder = path.join(__dirname, 'project-dist', 'assets');

    fs.readdir(pathToNewFolder, { withFileTypes: true }, (err, files) => {
        if (files) {
            files.forEach(file => {
                fs.rm(path.join(pathToNewFolder, file.name), (err) => {
                    if (err) throw err;
                });
            });
        };
    });

    fsPromises.mkdir(pathToNewFolder, { recursive: true })
        .then(function () {
            fs.readdir(pathToExistingFolder, { withFileTypes: true }, (err, files) => {
                files.forEach(file => {
                    if (file.isFile()) {
                        fs.copyFile(path.join(pathToExistingFolder, file.name), path.join(pathToNewFolder, file.name), (err) => {
                            if (err) throw err;
                        });
                    } else {
                        const pathToExistingSubFolder = path.join(__dirname, 'assets', file.name);
                        const pathToNewSubFolder = path.join(__dirname, 'project-dist', 'assets', file.name);
                        fsPromises.mkdir(pathToNewSubFolder, { recursive: true })
                             .then(function () {
                                fs.readdir(pathToExistingSubFolder, { withFileTypes: true }, (err, files) => {
                                    files.forEach(file => {
                                        fs.copyFile(path.join(pathToExistingSubFolder, file.name), path.join(pathToNewSubFolder, file.name), (err) => {
                                            if (err) throw err;
                                        });
                                    });
                                });        
                        });
                    }
                });
            });
        })
        .catch(function () {
            console.log('failed to create directory');
        });
}

buildPage();


