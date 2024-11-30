const constants = require("../../config/constants");
const MailList = require("../../models/MailList");
const sendEmail = require("./sendEmail");
const mailingStatusController = require("./mailingStatusController");


const processEmailQueue = async () => {

    const mailingStatus = await mailingStatusController.getStatus();

    if (mailingStatus.status) {
        console.log('Mail Queue active');
    }

    const queue = await MailList.find().sort({ createdAt: 1 }).limit(30);

    if (queue.length === 0) {
        console.log('Queue is empty Stopping the process');
        await mailingStatusController.saveStatus({ status: false, lastModified: new Date() });
        return;
    }

    for (const email of queue) {

        const emailData = {
            fromMail: constants.SIGNAL_MAIL,
            senderName: constants.SIGNAL_NAME.split('@')[0].toUpperCase(),
            to: email.emailTo,
            subject: email.subject,
            body: email.content
        }

        try {
            await sendEmail(emailData);
            await MailList.deleteMany(queue.map(mailListData => { _id: mailListData._id }));
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error('Error sending email:', error);
        }

    }

    console.log('Batch of Queue processed');

    processEmailQueue();

}

module.exports = processEmailQueue;