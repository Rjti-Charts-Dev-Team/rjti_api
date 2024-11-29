const express = require('express');
const errorLogger = require('../utils/errorLogger');
const TradingSystem = require('../models/TradingSystem');
const router = express.Router();
const verifyAdmin = require('../middlewares/verifyAdmin');

router.post('/create', verifyAdmin, async (req, res) => {

    try {

        const {
            name,
            type,
            active,
            files
        } = req.body;

        const tradingSystem = new TradingSystem({
            name,
            type,
            active,
            files
        });

        await tradingSystem.save();

        res.status(200).json({
            success: true,
            message: 'Trading system created successfully'
        });

    } catch (error) {

        errorLogger(req, res, error);

    }

})

router.post('/update/:id', verifyAdmin, async (req, res) => {

    try {

        const {
            name,
            type,
            active,
            files,
            updateType
        } = req.body;

        const allowedUpdateTypes = ['detail', 'access'];

        if (!allowedUpdateTypes.includes(updateType)) {

            return res.status(400).json({
                error: 'Invalid update type'
            });

        }

        const tradingSystem = await TradingSystem.findById(req.params.id);

        if (!tradingSystem) {

            return res.status(404).json({
                error: 'Trading system not found'
            });

        }

        if (updateType === 'detail') {

            tradingSystem.name = name;
            tradingSystem.type = type;
            tradingSystem.active = active;
            tradingSystem.files.push(files);

        } else if (updateType === 'access') {

            const {
                userID,
                accessEndTime
            } = req.body;

            tradingSystem.accessTo.push({
                userID,
                accessEndTime
            });

            // mail to user

        }

        await tradingSystem.save();

        res.status(200).json({
            success: true,
            message: 'Trading system updated successfully'
        });

    } catch (error) {

        errorLogger(req, res, error);

    }

})

router.get('/list', verifyAdmin, async (req, res) => {

    try {

        const tradingSystems = await TradingSystem.find().sort({
            createdAt: -1
        })

        res.status(200).json({
            success: true,
            tradingSystems
        });

    } catch (error) {

        errorLogger(req, res, error);

    }

})

router.get('/detail/:id', verifyAdmin, async (req, res) => {

    try {

        const tradingSystem = await TradingSystem.findById(req.params.id);

        if (!tradingSystem) {

            return res.status(404).json({
                error: 'Trading system not found'
            });

        }

        res.status(200).json({
            success: true,
            tradingSystem
        });

    } catch (error) {

        errorLogger(req, res, error);

    }

})

router.post('/deactivate/:id', verifyAdmin, async (req, res) => {

    try {

        const tradingSystem = await TradingSystem.findById(req.params.id);

        if (!tradingSystem) {

            return res.status(404).json({
                error: 'Trading system not found'
            });

        }

        tradingSystem.active = false;

        await tradingSystem.save();

        res.status(200).json({
            success: true,
            message: 'Trading system deactivated successfully'
        });

    } catch (error) {

        errorLogger(req, res, error);

    }

})

module.exports = router;