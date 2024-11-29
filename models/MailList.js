const { Schema, model, Error } = require('mongoose');
const User = require('./User');

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
            content: this.content,
            type: 'signalemail'
        });

        sms.save().then(() => {
            next();
        }).catch((error) => {
            next(new Error(error));
        });

    }

});

module.exports = model('maillist', MailListSchema);