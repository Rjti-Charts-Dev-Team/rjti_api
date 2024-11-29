const { Schema, model, Error } = require('mongoose');

const SmsListSchema = new Schema({

    toNumber: {
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
    type: {
        type: String,
        required: true,
        enum: ['promotion', 'newsletter', 'transactional', 'notification', 'signalemail']
    }

}, { timestamps: true })

module.exports = model('MailList', SmsListSchema);