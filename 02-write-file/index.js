const fs = require('fs');
const path = require('path');
const { stdin: input, stdout: output, stdout } = require('process');
const readline = require('readline');

const pathToFile = path.join(__dirname, 'greeting.txt');
const outputFile = fs.createWriteStream(pathToFile, 'utf-8');

const rl = readline.createInterface({ input, output });

stdout.write('Добрый день! Можете ввести свой текст.\n');

rl.on('line', (text) => {
    if (text == 'exit') {
        rl.close();
        outputFile.end();
    } else {
        outputFile.write(text + '\n');
    }
});

process.on('exit', () => {
    stdout.write('Хорошего дня!');
    process.exit();
});
