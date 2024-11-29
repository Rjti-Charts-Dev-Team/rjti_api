const { Schema, model } = require('mongoose')
const User = require('./User')

const SubscriberSchema = new Schema({

    email: {
        type: String,
        required: true
    },
    isUser: {
        type: Boolean,
        default: false
    },
    userID: {
        type: String,
        default: null
    },
    isSubscribed: {
        type: Boolean,
        default: true
    },

}, { timestamps: true })

SubscriberSchema.pre('save', async function () {

    const validateUser = await User.findOne({ email: this.email })

    if (validateUser) {
        this.isUser = true
        this.userID = validateUser._id
    }
    
    next()
})

module.exports = model('subscriber', SubscriberSchema)