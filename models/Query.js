const { Schema, model } = require('mongoose');

const QuerySchema = new Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isUser: {
        type: Boolean,
        required: true,
        default: false
    },
    userID: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    status: {
        type: String,
        default: "Pending",
        enum: ["Pending", "Resolved", "In Progress"]
    }
}, {
    timestamps: true
});

module.exports = model('query', QuerySchema);