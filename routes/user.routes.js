const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const errorLogger = require('../utils/errorLogger');
const User = require('../models/User');
const verifyReset = require('../middlewares/verifyReset');
const verifyUser = require('../middlewares/verifyUser');
const verifyAdmin = require('../middlewares/verifyAdmin');
const Subscription = require('../models/Subscription');

router.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Please enter all fields'
            });
        }

        const validateUser = await User.findOne({
            email
        });

        if (!validateUser) {
            return res.status(400).json({
                error: 'Account not found',
                redirect: '/signup'
            });
        }

        const checkPassword = await bcrypt.compare(password, validateUser.password);

        if (!checkPassword) {
            return res.status(400).json({
                error: 'Invalid credentials'
            });
        }

        if (!validateUser.isAuth) {

            await validateUser.generateOTP("auth");

            return res.status(200).json({
                success: true,
                message: 'Please verify your email to login',
                redirect: '/verify-email',
                userID: validateUser._id,
                resetToken: validateUser.resetToken
            });

        }

        const token = await jwt.sign({
            id: validateUser._id
        }, process.env.JWT_SECRET);

        res.status(200).json({
            success: true,
            token,
            message: 'Logged in successfully',
            redirect: '/dashboard'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/signup', async (req, res) => {

    try {

        const { fullName, email, password, contactNo } = req.body;

        if (!fullName || !email || !password || !contactNo) {
            return res.status(400).json({
                error: 'Please enter all fields'
            });
        }

        const validateUser = await User.findOne({
            email
        });

        if (validateUser) {
            return res.status(400).json({
                error: 'User already exists',
                redirect: '/login'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPassword,
            contactNo
        });

        await newUser.generateOTP("auth");

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            redirect: '/verify-email',
            userID: newUser._id,
            resetToken: newUser.resetToken
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/verify-email', verifyReset, async (req, res) => {

    try {

        const {
            userID,
            otp
        } = req.body;

        const resetToken = req.resetToken;
        const decode = req.decode;

        if (!userID || !otp) {
            return res.status(400).json({
                error: 'Please enter all fields'
            });
        }

        const validateUser = await User.findById(userID);

        if (!validateUser) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (validateUser.otpExpires < Date.now()) {

            await validateUser.generateOTP(decode.type);

            return res.status(400).json({
                error: 'OTP expired',
                redirect: '/verify-email',
                userID: validateUser._id,
                resetToken: validateUser.resetToken
            });

        }

        if (validateUser.otp !== otp && validateUser.otpType !== "auth" && validateUser.resetToken !== resetToken) {
            return res.status(400).json({
                error: 'Invalid OTP',
            });
        }

        const data = {
            isAuth: true,
            otp: '',
            otpExpires: '',
            otpType: '',
            resetToken: ''
        }

        await User.findByIdAndUpdate(userID, data, { new: true })

        res.status(200).json({
            success: true,
            message: 'Email verified successfully Login to continue',
            redirect: '/login'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/forget-password', async (req, res) => {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Please enter all fields'
            });
        }

        const validateUser = await User.findOne({
            email
        });

        if (!validateUser) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        await validateUser.generateOTP("reset");

        res.status(200).json({
            success: true,
            message: 'Please check your email to reset password',
            redirect: `/reset-password/${validateUser.resetToken}`,
            userID: validateUser._id,
        })

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/reset-password', verifyReset, async (req, res) => {

    try {

        const {
            password,
            userID,
            otp
        } = req.body;

        const resetToken = req.resetToken;

        if (!password || !userID) {
            return res.status(400).json({
                error: 'Please enter all fields'
            });
        }

        const validateUser = await User.findById(userID);
        const decode = req.decode;

        if (!validateUser) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        if (validateUser.otp !== otp && validateUser.otpExpires < Date.now() && validateUser.otpType !== decode.type && validateUser.resetToken !== resetToken) {
            return res.status(400).json({
                error: 'Invalid OTP',
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const data = {
            isAuth: true,
            password: hashedPassword,
            resetToken: '',
            otpType: '',
            otp: '',
            otpExpires: ''
        }

        await User.findByIdAndUpdate(userID, data, {
            new: true
        });

        res.status(200).json({
            success: true,
            message: 'Password reset successfully',
            redirect: '/login'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/update', verifyUser, async (req, res) => {

    try {

        const {
            fullName,
            contactNo,
            password,
            oldPassword,
            
        } = req.body;

        const userID = req.verifyUser.id;

        const validateUser = req.verifyUser;

        let data = {}

        if (fullName) {
            data.fullName = fullName;
        }

        if (contactNo) {
            data.contactNo = contactNo;
        }

        if (password) {

            const checkPassword = await bcrypt.compare(oldPassword, validateUser.password);

            if (!checkPassword) {
                return res.status(400).json({
                    error: 'Invalid credentials'
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            data.password = hashedPassword;

        }

        await User.findByIdAndUpdate(userID, data, { new: true })

        res.status(200).json({
            success: true,
            message: 'User updated'
        })

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.get('/profile', verifyUser, async (req, res) => {

    try {

        const userData = req.verifyUser

        const data = {
            fullName: userData.fullName,
            email: userData.email,
            contactNo: userData.contactNo,
            signalUser: userData.signalUser,
            specialUser: userData.specialUser
        }

        const userSubscriptions = await Subscription.aggregate([
            {
                $match: { user: userData._id }
            },
            {
                $lookup: {
                    from: 'packages',
                    localField: 'package',
                    foreignField: '_id',
                    as: 'packageInfo'
                }
            },
            {
                $unwind: '$packageInfo'
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'packageInfo.forCategory',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            {
                $unwind: '$categoryDetails'
            },
            {
                $project: {
                    paymentID: 1,
                    status: 1,
                    startDate: 1,
                    endDate: 1,
                    'packageInfo.type': 1,
                    'packageInfo.duration': 1,
                    'packageInfo.keyPointers': 1,
                    'packageInfo.price': 1,
                    'packageInfo.currency': 1,
                    'categoryDetails.name': 1,
                    'categoryDetails.description': 1,
                    'categoryDetails.details': 1,
                    'categoryDetails.disclaimer': 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data,
            userSubscriptions
        })

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.get('/all', verifyAdmin, async (req, res) => {

    try {

        reqObject = {
            _id: req.query.userID
        }

        console.log(reqObject);

        const users = await User.find(req.query.userID !== 'undefined' ? reqObject : {});

        res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/admin/verify-auth/:id', verifyAdmin, async (req, res) => {

    try {

        const userID = req.params.id;

        const validateUser = await User.findById(userID);

        if (!validateUser) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        validateUser.isAuth = true;

        await validateUser.save();

        // send email to user that account is verified by admin

        res.status(200).json({
            success: true,
            message: 'Profile Verified'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/admin/ban-unban/:id', verifyAdmin, async (req, res) => {

    try {

        const userID = req.params.id;

        const validateUser = await User.findById(userID);

        if (!validateUser) {
            return res.status(400).json({
                error: 'User not found'
            });
        }

        validateUser.isRestricted = !validateUser.isRestricted;

        // send email to user that account is banned/unbanned

        await validateUser.save();

        res.status(200).json({
            success: true,
            message: validateUser.isRestricted ? 'User Banned' : 'User Unbanned'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/admin/create-new', verifyAdmin, async (req, res) => {

    try {

        const {

            fullName,
            email,
            password,
            contactNo,
            specialUser

        } = req.body;

    } catch (error) {

        errorLogger(error, req, res);

    }

})

module.exports = router;