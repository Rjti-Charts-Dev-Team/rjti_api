const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

const emailTemplateEditor = async (templateName, data) => {

    // Load the HTML template
    const templatePath = path.join(__dirname, `/mailer/formats/${templateName}.html`);
    const template = await fs.readFile(templatePath, 'utf8');

    const $ = cheerio.load(template);

    // Replace placeholders in the HTML with actual data
    for (const key in data) {
        const value = data[key];
        $('body').find(`:contains([${key}]):not(:has(:contains([${key}])))`).text((_, oldText) => {
            return oldText.replace(`[${key}]`, value);
        });
    }

    return $.html();

};

module.exports = emailTemplateEditor;