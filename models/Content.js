const { Schema, model } = require('mongoose')
const Subscription = require('./Subscription')
const { CLIENT_URL } = require('../config/constants')
const User = require('./User')
const emailTemplateEditor = require('../utils/emailTemplateEditor')
const MailList = require('./MailList')
const processEmailQueue = require('../utils/mailer/processEmailQueue')

const ContentSchema = new Schema({

    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    fileUrl: [{
        type: String,
    }],
    buyWidget: {
        type: String,
        required: true
    },
    sellWidget: {
        type: String,
        required: true
    },
    chartWidget: {
        type: String,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    },
    package: {
        type: Schema.Types.ObjectId,
        ref: 'package',
        required: true
    }

}, {
    timestamps: true
})

ContentSchema.pre('save', async function (next) {

    const userList = await Subscription.find({
        package: this.package,
        endDate: { $gte: new Date() }
    })

    if (userList.length === 0) {
        next()
    }

    const data = []

    const mailData = {
        signal_title: this.title,
        signal_description: this.description,
        content_url: `${CLIENT_URL}/subscription/content/${this.id}`
    }

    await Promise.all(
        userList.forEach(async (user) => {

            const userData = await User.findById(user.user)

            const htmlContent = await emailTemplateEditor('SignalEmail', { ...mailData, user_name: userData.name })

            data.push({
                emailTo: userData.email,
                name: this.title,
                content: htmlContent,
                textContent: this.content,
                type: 'signalemail'
            })

        })
    )

    await MailList.insertMany(data)

    processEmailQueue()

    next()
})

module.exports = model('content', ContentSchema)