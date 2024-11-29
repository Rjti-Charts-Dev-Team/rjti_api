const { Schema, model } = require('mongoose')

const TransactionSchema = new Schema({
    userID:{
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    orderID: {
        type: String, // This will be the orderID from the payment gateway
        unique: true
    },
    status: {
        type: String,
        required: true,
        default: 'new',
        enum: ['new', 'captured', 'cancelled', 'refunded', 'error', 'completed']
    }
}, {
    timestamps: true
})

module.exports = model('transaction', TransactionSchema)