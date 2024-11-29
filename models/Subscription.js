// For retaining the details of successful payments

const { model, Schema } = require('mongoose')


const SubscriptionSchema = new Schema({
    paymentID: {
        type: Schema.Types.ObjectId,
        ref: 'payment'
    },
    package: {
        type: Schema.Types.ObjectId,
        ref: 'package'
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    status: {
        type: String,
        required: true,
        default: 'active',
        enum: ['active', 'refunded', 'cancelled']
    },
    startDate: {
        type: Date,
        default: Date.now,
    },
    duration: {
        type: String,
    },
    endDate: {
        type: Date,
    },
}, {
    timestamps: true
})

// SubscriptionSchema.pre('save', function (next) {
//     this.endDate = new Date(this.startDate);
//     this.endDate.setMonth(this.endDate.getMonth() + this.duration);
//     next();
// })

module.exports = model('subscriptions', SubscriptionSchema)