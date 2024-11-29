const express = require('express');
const errorLogger = require('../utils/errorLogger');
const Content = require('../models/Content');
const verifyAdmin = require('../middlewares/verifyAdmin');
const router = express.Router();

router.post('/create', verifyAdmin, async (req, res) => {

    try {

        const {
            title,
            description,
            content,
            fileUrl,
            category,
            package,
            buyWidget,
            sellWidget,
            chartWidget
        } = req.body;

        if (!title || !description || !content || !category) {
            return res.status(400).json({
                error: 'Please enter all fields'
            });
        }

        const newContent = new Content({ ...req.body });

        await newContent.save();

        res.status(201).json({
            success: true,
            message: 'Content successfully successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/update/:id', verifyAdmin, async (req, res) => {

    try {

        const {
            title,
            description,
            content,
            fileUrl,
            category
        } = req.body;

        let data = {};

        const validateContent = await Content.findById(req.params.id);

        if (!validateContent) {
            return res.status(404).json({
                error: 'Content not found'
            });
        }

        if (title) { data.title = title }

        if (description) { data.description = description }

        if (content) { data.content = content }

        if (fileUrl) { data.fileUrl = fileUrl }

        if (category) { data.category = category }

        await Content.findByIdAndUpdate(req.params.id, data, { new: true });

        res.status(200).json({
            success: true,
            message: 'Content updated successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.delete('/delete/:id', verifyAdmin, async (req, res) => {

    try {

        const validateContent = await Content.findById(req.params.id);

        if (!validateContent) {
            return res.status(404).json({
                error: 'Content not found'
            });
        }

        await Content.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Content deleted successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.get('/', verifyAdmin, async (req, res) => {

    try {

        const content = await Content.find();

        res.status(200).json({
            success: true,
            data: content
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/filter', verifyAdmin, async (req, res) => {

    try {

        const {
            category,
            package
        } = req.body;

        let filter = {};

        if (category) { filter.category = category }

        if (package) { filter.package = package }

        const content = await Content.find(filter);

        res.status(200).json({
            success: true,
            data: content
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

module.exports = router;