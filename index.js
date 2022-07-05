const http = require('http');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const prompt = require('prompt-sync')();

const templatePath = prompt('Please enter the path to the HTML template file: ');
const dataPath = prompt('Please enter the path to the data file: ');

let newHtmlPage = '';
const templateVariableName = 'target';

try {
    let data = '';

    const ext = path.extname(dataPath);

    fs.access(templatePath, fs.constants.F_OK, (err) => {
        if (err) {
            throw err;
        }
    })

    fs.access(dataPath, fs.constants.F_OK, (err) => {
        if (err) {
            throw err;
        }
    })

    if (!ext || (ext !== '.json' && ext !== '.yml')) {
        throw new Error('File format error. Only JSON or YAML formats are allowed.');
    }

    fs.readFile(dataPath, 'utf-8', (err, result) => {
        if (err) {
            throw err;
        }
        if (ext === '.yml') {
            data = yaml.load(result);
        } else {
            data = JSON.parse(result);
        }
    });

    const server = http.createServer((req, res) => {

        fs.readFile(templatePath, 'utf-8', (err, result) => {
            if (err) {
                throw err;
            }
            const re = new RegExp(`[ ]*{{[ ]*${templateVariableName}[ ]*}}[ ]*`, 'g');
            newHtmlPage = result.replace(re, objectsToList(data));
        });

        res.writeHead(200, {
            'Content-Type': 'text/html'
        })

        res.end(newHtmlPage);
    })

    server.listen(3000, () => {
        console.log('Sever has been started.');
    });

} catch (err) {
    console.log(err.message);
}


function objectsToList(object) {

    let isEmpty = function(obj) {
        return Object.keys(obj).length === 0;
    }

    let crawler = function(obj) {
        let currentUl = '<ul>';

        for (const [key, value] of Object.entries(obj)) {
            let currentLi = '<li>';

            currentLi += key;

            if (value !== null && typeof value === 'object') {
                currentLi += ' :';

                if (!isEmpty(value)) {
                    currentLi += crawler(value);
                }

            } else {
                currentLi += ` : ${value}`;
            }

            currentLi += '</li>';
            currentUl += currentLi;
        }

        currentUl += '</ul>'

        return currentUl;
    }

    return crawler(object);
}