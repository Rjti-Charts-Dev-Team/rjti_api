const { Schema, model } = require('mongoose')
const User = require('./User')
const crypto = require('crypto')

const TradingSystemSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true, // type of trading system weekly, monthly, yearly
        enum: ['weekly', 'monthly', 'yearly']
    },
    active: {
        type: Boolean,
        default: true
    },
    files: [
        {
            type: {
                type: String // file type for the uploaded file
            },
            url: {
                type: String
            },
            name: {
                type: String
            }
        }
    ],
    accessTo: [{
        userID: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        accessEndTime: {
            type: Date, // calculate this from requestedAccessTime and createdAt of newRequest in months
        },
        password: {
            type: String
        },
        uniqueAccessKey: {
            type: String
        },
        payment: {
            orderID: {
                type: String
            },
            amount: {
                type: Number
            },
            paymentStatus: {
                type: String,
                enum: ['pending', 'success', 'failed'],
                default: 'pending'
            },
            paymentDate: {
                type: Date
            },
            billStatus: {
                type: String,
                enum: ['pending', 'generated', 'paid'],
                default: 'pending'
            },
        }
    }],
    newRequest: [{
        userID: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        requestedAccessTime: {
            type: Number // in months
        },
        createdAt: {
            type: Date
        },
        payment: {
            orderID: {
                type: String
            },
            amount: {
                type: Number
            },
            paymentStatus: {
                type: String,
                enum: ['pending', 'success', 'failed'],
                default: 'pending'
            },
            paymentDate: {
                type: Date
            },
            billStatus: {
                type: String,
                enum: ['pending', 'generated', 'paid'],
                default: 'pending'
            },
        }
    }]
}, {
    timestamps: true
})

// methods for users

TradingSystemSchema.methods.requestAccess = async function (userID, requestedAccessTime) {

    const requestData = {
        userID: userID,
        requestedAccessTime: requestedAccessTime,
        createdAt: new Date(),
    }

    this.newRequest.push(requestData)

    await this.save()

    next()

}

TradingSystemSchema.methods.cancelRequest = async function (userID) {

    this.newRequest = this.newRequest.filter(request => request.userID.toString() !== userID.toString())

    await this.save()

    next()

}

// methods for admin

TradingSystemSchema.methods.initiatePayment = async function (userID, orderID, amount) {

    const requestData = this.newRequest.find(request => request.userID.toString() === userID.toString())

    if (!requestData) {
        throw new Error('Request not found')
    }

    requestData.payment = {
        orderID: orderID,
        amount: amount,
        paymentStatus: 'pending',
        paymentDate: new Date(),
        billStatus: 'pending',
    }

    await this.save()

    next()

}

TradingSystemSchema.methods.giveAccess = async function (userID) {

    const user = await User.findById(userID)

    if (!user) {
        throw new Error('User not found')
    }

    const getAccess = this.newRequest.find(request => request.userID.toString() === userID.toString())

    if (!getAccess) {
        throw new Error('Request not found')
    }

    if (getAccess.payment.paymentStatus !== 'success') {
        throw new Error('Payment not successful')
    }

    const password = crypto.randomBytes(10).toString('hex')

    const accessData = {
        userID: user._id,
        accessEndTime: new Date().getTime() + getAccess.requestedAccessTime * 30 * 24 * 60 * 60 * 1000,
        password: password,
        uniqueAccessKey: crypto.randomBytes(20).toString('hex'),
        payment: getAccess.payment,
    }

    this.accessTo.push(accessData)

    this.newRequest = this.newRequest.filter(request => request.userID.toString() !== userID.toString())

    await this.save()

    // send email to user with password and access end time

    next()

}

module.exports = model('tradingSystem', TradingSystemSchema)