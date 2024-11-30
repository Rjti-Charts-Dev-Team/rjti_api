/**
 * Sends an email using Amazon SES with IAM credentials.
 *
 * @param {string} to - The recipient's email address.
 * @param {string} subject - The subject of the email.
 * @param {string} body - The HTML body of the email.
 * @returns {Promise} - A promise that resolves when the email is sent.
 */

const SES = require("../aws/ses/SES");

async function sendEmail({ fromMail, senderName, to, subject, body }) {

    const from = `${senderName} <${fromMail}>`;

    const params = {
        Destination: {
            ToAddresses: [to], // Recipient's email
        },
        Message: {
            Body: {
                Html: {
                    Charset: 'UTF-8',
                    Data: body,
                },
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject,
            },
        },
        Source: from, // Sender's verified email address
    };

    try {
        const result = await SES.sendEmail(params).promise();
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = sendEmail;