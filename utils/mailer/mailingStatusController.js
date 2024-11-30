const fs = require('fs-extra');
const path = require('path');

const getMailingStatus = async () => {
    try {
        const filePath = path.join(__dirname, 'state.json');

        // Ensure the file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }

        const data = await fs.readFile(filePath, 'utf8');
        const status = JSON.parse(data);

        return status;
    } catch (error) {
        console.error('Error reading or parsing file:', error);
        return null;  // Return null or handle as needed
    }
}

const saveMailingStatus = async (status) => {

    try {

        const filePath = path.join(__dirname, 'state.json');

        // Ensure the file exists
        if (!fs.existsSync(filePath)) {

            throw new Error(`File not found: ${filePath}`);

        }

        await fs.writeFile(filePath, JSON.stringify(status, null, 2), 'utf8');

        return true;

    } catch (error) {

        console.error('Error reading or parsing file:', error);
        return null;

    }

}

const mailingStatusController = {

    getStatus: getMailingStatus,
    saveStatus: saveMailingStatus,

}

module.exports = mailingStatusController;