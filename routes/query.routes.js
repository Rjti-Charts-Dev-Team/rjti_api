const express = require('express');
const errorLogger = require('../utils/errorLogger');
const User = require('../models/User');
const Query = require('../models/Query');
const verifyAdmin = require('../middlewares/verifyAdmin');
const router = express.Router();

router.post('/create', async (req, res) => {

    try {

        const { fullName, email, contactNo, subject, message } = req.body;

        if (!fullName || !email || !contactNo || !subject || !message) {
            return res.status(400).json({
                error: 'Please fill all the fields'
            });
        }

        const validateUser = await User.findOne({ email });

        const newQuery = new Query({
            fullName,
            email,
            contactNo,
            subject,
            message,
            isUser: validateUser ? true : false,
            userID: validateUser ? validateUser._id : null
        });

        await newQuery.save();

        res.json({
            success: true,
            message: 'Query submitted successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.get('/all', verifyAdmin, async (req, res) => {

    try {

        const queries = await Query.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            data: queries
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/update', verifyAdmin, async (req, res) => {

    try {

        const { queryID, status } = req.body;

        if (!queryID || !status) {
            return res.status(400).json({
                error: 'Please provide query ID and status'
            });
        }

        const validateQuery = await Query.findById(queryID);

        if (!validateQuery) {
            return res.status(400).json({
                error: 'Invalid query ID'
            });
        }

        validateQuery.status = status;

        await validateQuery.save();

        res.json({
            success: true,
            message: 'Query updated successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

module.exports = router;