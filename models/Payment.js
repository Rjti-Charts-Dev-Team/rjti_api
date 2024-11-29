// For storing the details of all orders created

const { model, Schema } = require('mongoose')

const PaymentSchema = new Schema({

    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    orderID: {
        type: String
    },
    status: {
        type: String,
        required: true,
        default: 'new',
        enum: ['new', 'captured', 'cancelled', 'refunded', 'completed']
    },
    byUser: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    forPackage: {
        type: Schema.Types.ObjectId,
        ref: 'package',
        required: true
    },

}, {
    timestamps: true
})

module.exports = model('payment', PaymentSchema)