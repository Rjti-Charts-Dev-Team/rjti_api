const { Schema, model } = require('mongoose')

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

module.exports = model('content', ContentSchema)