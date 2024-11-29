const { Schema, model } = require('mongoose')

const PackageSchema = new Schema({

    type: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    keyPointers: [
        {
            type: String,
        }
    ],
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    forCategory: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    }

}, {
    timestamps: true
})

module.exports = model('package', PackageSchema)