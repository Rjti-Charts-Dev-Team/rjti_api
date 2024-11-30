const { Schema, model, Error } = require('mongoose');
const User = require('./User');
const SmsList = require('./SmsList');

const MailListSchema = new Schema({

    emailTo: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    textContent:{
        type: String,
        required: true
    },
    // content will include the description and the content link for signals email format will be normal html nothing fancy
    type: {
        type: String,
        required: true,
        enum: ['promotion', 'newsletter', 'transactional', 'notification', 'signalemail']
    }

}, { timestamps: true })

MailListSchema.pre('save', async function (next) {

    // check if it is a signal email then add it to the smslist

    if (this.type === 'signalemail') {

        const userData = await User.findOne({ email: this.emailTo });

        const sms = new SmsList({
            toNumber: userData.contactNo,
            name: this.name,
            content: this.textContent,
            type: 'signalemail'
        });

        sms.save().then(() => {
            next();
        }).catch((error) => {
            next(new Error(error));
        });

    }

});

MailListSchema.pre('insertMany', async function (docs, next) {

    try {

        for (const doc of docs) {

            if (doc.type === 'signalemail') {
                const userData = await User.findOne({ email: doc.emailTo });

                const sms = new SmsList({
                    toNumber: userData.contactNo,
                    name: doc.name,
                    content: doc.content,
                    type: 'signalemail'
                });

                await sms.save(); // Ensure SMS is saved
            }

        }

        next(); // Proceed with the bulk insert
    } catch (error) {
        next(error); // Handle errors properly
    }
});

module.exports = model('maillist', MailListSchema);