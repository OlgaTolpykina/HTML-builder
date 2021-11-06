const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;

const projectFolder = path.join(__dirname, 'project-dist');
const htmlFile = path.join(projectFolder, 'index.html');
const template = path.join(__dirname, 'template.html');
const regexp = /{{[a-z]+}}/g;
const readableStream = fs.createReadStream(template, 'utf-8');
const writableStream = fs.createWriteStream(htmlFile, 'utf-8');

const buildPage = () => {
    createFolder(projectFolder);
    formHTML();
    createStyleBundle();
    createFolder(pathToNewFolder);
    copyFolderContent(pathToExistingFolder, pathToNewFolder);
}

const createFolder = (nameFolder) => {
    fs.mkdir(nameFolder, { recursive: true }, () => {
    });
}

const formHTML = () => {
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

const pathToExistingFolder = path.join(__dirname, 'assets');
const pathToNewFolder = path.join(__dirname, 'project-dist', 'assets'); 

const copyFolderContent = (oldfolder, newfolder) => {
   fs.readdir(oldfolder, { withFileTypes: true, recursive: true }, (err, items) => {
            items.forEach(item => {
                if (item.isDirectory()) {
                    createFolder(path.join(newfolder, item.name));
                    copyFolderContent(path.join(oldfolder, item.name), path.join(newfolder, item.name));
                } else {
                    fs.copyFile(path.join(oldfolder, item.name), path.join(newfolder, item.name), (err) => {
                        if (err) throw err;
                    });
                }
            });
        });
}

buildPage();


