const { Schema, model, Error } = require('mongoose');
const otpGenerator = require('otp-generator');
const jwt = require('jsonwebtoken');
const constants = require('../config/constants');

const UserSchema = new Schema({

    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    specialUser: {
        type: Boolean,
        default: false
    },
    contactNo: {
        type: String,
        required: true,
        unique: true
    },
    signalUser: {
        type: Boolean,
        default: true
    },
    otp: {
        type: String,
        default: ''
    },
    otpExpires: {
        type: Date,
    },
    otpType: {
        type: String,
        default: 'auth',
        enum: ['auth', 'reset']
    },
    resetToken: {
        type: String,
    },
    isRestricted: {
        type: Boolean,
        default: false
    },
    isAuth: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

UserSchema.methods.generateOTP = async function (type) {

    const otp = otpGenerator.generate(6, {
        specialChars: false,
        lowerCaseAlphabets: false
    });

    this.otp = otp;
    this.otpExpires = Date.now() + 5 * 60 * 1000;
    this.otpType = type;

    this.resetToken = jwt.sign({
        id: this._id,
        type: type,
    }, process.env.JWT_SECRET, {
        expiresIn: '5m'
    });

    await this.save();

    const mailContent = {
        fromMail: constants.ACCOUNT_MAIL,
        senderName: `${constants.ACCOUNT_MAIL.split('@')[0]}`,
        to: this.email,
        subject: `OTP to ${type === 'reset' ? 'reset your password' : 'verify your email'} for RJTI Charts`,
        body:`
            <html>
                <body>
                    <h1>OTP to ${type === 'reset' ? 'reset your password' : 'verify your email'} for RJTI Charts</h1>
                    <p>Your OTP is: <b>${otp}</b></p>
                    <p>This OTP will expire in 5 minutes.</p>
                </body>
            </html>
        `
    }

    return otp;

}

module.exports = model('user', UserSchema);