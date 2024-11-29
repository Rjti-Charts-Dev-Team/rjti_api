const { Schema, model } = require('mongoose');

const CategorySchema = new Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    disclaimer: {
        type: String,
        required: true
    }

})

module.exports = model('category', CategorySchema)