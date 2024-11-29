const { Schema, model } = require('mongoose');
const jwt = require('jsonwebtoken');

const AdminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
})

AdminSchema.methods.generateAuthToken = async function () {

    const data = {
        id: this.id,
        email: this.email,
        adminAccessSecret: process.env.ADMIN_ACCESS_CODE
    }

    const token = jwt.sign(data, process.env.JWT_SECRET);

    return token;

}

module.exports = model('Admin', AdminSchema);