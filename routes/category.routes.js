const express = require('express');
const errorLogger = require('../utils/errorLogger');
const Category = require('../models/Category');
const verifyAdmin = require('../middlewares/verifyAdmin');
const router = express.Router();

router.post('/create', verifyAdmin, async (req, res) => {

    try {

        const {
            name,
            description,
            details,
            disclaimer
        } = req.body;

        if (!name || !description || !details || !disclaimer) {
            return res.status(400).json({
                error: 'Please enter all fields'
            });
        }

        const category = new Category({
            name,
            description,
            details,
            disclaimer
        });

        await category.save();

        res.status(200).json({
            success: true,
            message: 'Category created successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/update/:id', verifyAdmin, async (req, res) => {

    try {

        const {
            name,
            description,
            details,
            disclaimer
        } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                error: 'Category not found'
            });
        }

        let data = {};

        if (name) data.name = name;
        if (description) data.description = description;
        if (details) data.details = details;
        if (disclaimer) data.disclaimer = disclaimer;

        await Category.findByIdAndUpdate(req.params.id, data, { new: true });

        res.status(200).json({
            success: true,
            message: 'Category updated successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.delete('/delete/:id', verifyAdmin, async (req, res) => {

    try {

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                error: 'Category not found'
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.get('/', async (req, res) => {

    try {

        const categories = await Category.find();

        res.status(200).json({
            success: true,
            data: categories
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

module.exports = router;