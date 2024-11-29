const express = require('express');
const errorLogger = require('../utils/errorLogger');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const verifyAdmin = require('../middlewares/verifyAdmin');

router.post('/register', verifyAdmin, async (req, res) => {

    try {

        const { email, password, creationCode } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                error: 'Please enter all fields'
            });

        }

        if (creationCode !== process.env.ADMIN_CREATION_CODE) {
            return res.status(401).json({
                error: 'Invalid creation code'
            });
        }

        const validateAdmin = await Admin.findOne({ email });

        if (validateAdmin) {
            return res.status(400).json({
                error: 'Admin already exists'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newAdmin = new Admin({
            email,
            password: hash
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/login', async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.status(400).json({
                error: 'Please enter all fields'
            });

        }

        const validateAdmin = await Admin.findOne({ email })

        if (!validateAdmin) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const isMatch = await bcrypt.compare(password, validateAdmin.password);

        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const token = await validateAdmin.generateAuthToken();

        res.status(200).json({
            success: true,
            token,
            message: 'Logged in successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

module.exports = router;