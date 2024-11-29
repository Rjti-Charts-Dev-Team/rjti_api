const express = require('express');
const verifyAdmin = require('../middlewares/verifyAdmin');
const errorLogger = require('../utils/errorLogger');
const Package = require('../models/Package');
const router = express.Router();

router.post('/create', verifyAdmin, async (req, res) => {

    try {

        const {
            type,
            duration,
            keyPointers,
            price,
            currency,
            forCategory
        } = req.body;

        if (!type || !duration || !price || !currency || !forCategory) {
            return res.status(400).json({
                error: 'Please enter all fields'
            });
        }

        const package = new Package({
            type,
            duration,
            keyPointers,
            price,
            currency,
            forCategory
        });

        await package.save();

        res.status(200).json({
            success: true,
            message: 'Package created successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/update/:id', verifyAdmin, async (req, res) => {

    try {

        const {
            type,
            duration,
            keyPointers,
            price,
            currency,
            forCategory
        } = req.body;

        const package = await Package.findById(req.params.id);

        if (!package) {
            return res.status(404).json({
                error: 'Package not found'
            });
        }

        let data = {};

        if (type) data.type = type;
        if (duration) data.duration = duration;
        if (keyPointers) data.keyPointers = keyPointers;
        if (price) data.price = price;
        if (currency) data.currency = currency;
        if (forCategory) data.forCategory = forCategory;

        await Package.findByIdAndUpdate(req.params.id, data, { new: true });

        res.status(200).json({
            success: true,
            message: 'Package updated successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.delete('/delete/:id', verifyAdmin, async (req, res) => {

    try {

        const package = await Package.findById(req.params.id);

        if (!package) {
            return res.status(404).json({
                error: 'Package not found'
            });
        }

        await Package.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Package deleted successfully'
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.get('/', async (req, res) => { // '?' makes 'category' optional

    try {

        const packages = await Package.find(
            req.query.category !== 'undefined' ? { forCategory: req.query.category } : {}
        );

        res.status(200).json({
            success: true,
            data: packages
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

});


module.exports = router;