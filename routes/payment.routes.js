const express = require('express');
const router = express.Router();
const errorLogger = require('../utils/errorLogger');
const verifyUser = require('../middlewares/verifyUser');
const verifyAdmin = require('../middlewares/verifyAdmin');

// Paypal configuration

const Package = require('../models/Package');
const Payment = require('../models/Payment');
const Subscription = require('../models/Subscription');
const createOrder = require('../utils/payment/paypal/createOrder');
const verifyOrder = require('../utils/payment/paypal/verifyOrder');
const Transaction = require('../models/Transaction');

router.get('/config', verifyUser, async (req, res) => {

    try {

        res.status(200).json({
            success: true,
            clientID: process.env.PAYPAL_CLIENT_ID
        })

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/create', verifyUser, async (req, res) => {

    try {

        const { packageId } = req.body;

        const sessionUserID = req.verifyUser.id;

        const packageDetails = await Package.findById(packageId);

        if (!packageDetails) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Package ID'
            })
        }

        const newPayment = await Payment.create({
            forPackage: packageId,
            amount: packageDetails.price,
            currency: packageDetails.currency,
            byUser: sessionUserID,
            status: 'new'
        })

        const newOrder = await createOrder(newPayment);

        newPayment.orderID = newOrder.id;

        await newPayment.save();

        console.log(newOrder);

        res.status(200).json({
            success: true,
            orderID: newOrder.id
        })

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.post('/verify/:orderID', verifyUser, async (req, res) => {

    try {

        const sessionUserID = req.verifyUser.id;
        const orderID = req.params.orderID;

        const paymentDetails = await Payment.findOne({
            orderID: orderID,
            byUser: sessionUserID,
            status: 'new'
        })

        if (!paymentDetails) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Payment'
            })
        }

        const paymentStatus = await verifyOrder(paymentDetails.orderID);

        if (!paymentStatus) {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed'
            })
        }

        const packageDetails = await Package.findById(paymentDetails.forPackage);

        paymentDetails.status = 'completed';

        await paymentDetails.save();

        const newSubscription = await Subscription.create({
            paymentID: paymentDetails._id,
            package: paymentDetails.forPackage,
            user: sessionUserID,
            status: 'active',
            duration: packageDetails.duration
        })

        const newTransaction = await Transaction.create({
            amount: paymentDetails.amount,
            currency: paymentDetails.currency,
            orderID: paymentDetails.orderID,
            status: 'completed',
            userID: sessionUserID
        })

        res.status(200).json({
            success: true,
            message: 'Payment completed successfully',
            subscriptionID: newSubscription.id
        })

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.get('/user-get-all', verifyUser, async (req, res) => {

    try {

        const sessionUserID = req.verifyUser.id;

        const userPayments = await Payment.find({
            byUser: sessionUserID
        })

        res.status(200).json({
            success: true,
            data: userPayments
        })

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.get('/admin-get-all', verifyAdmin, async (req, res) => {

    try {

        const allTransactions = await Payment.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'byUser',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $lookup: {
                    from: 'packages',
                    localField: 'forPackage',
                    foreignField: '_id',
                    as: 'package'
                }
            },
            {
                $lookup: {
                    from: 'subscriptions',
                    localField: '_id',
                    foreignField: 'paymentID',
                    as: 'subscription'
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'package.forCategory',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            {
                $addFields: {
                    subscription: { $arrayElemAt: ['$subscription', 0] },
                    package: { $arrayElemAt: ['$package', 0] },
                    user: { $arrayElemAt: ['$user', 0] },
                    category: { $arrayElemAt: ['$category', 0] }
                }
            },
            {
                $project: {
                    _id: 1,
                    amount: 1,
                    currency: 1,
                    status: 1,
                    orderID: 1,
                    'user._id': 1,
                    'user.email': 1,
                    'package._id': 1,
                    'package.name': 1,
                    'subscription._id': 1,
                    'subscription.startDate': 1,
                    'subscription.endDate': 1,
                    'subscription.status': 1,
                    'subscription.duration': 1,
                    'package.type': 1,
                    'package.currency': 1,
                    'package.duration': 1,
                    'package.price': 1,
                    'package.keyPointers': 1,
                    'package.forCategory': 1,
                    'category.name': 1,
                }
            },
            {
                $sort: {
                    _id: -1
                }
            }
        ]);

        const monthNames = [
            "", "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const monthWiseTransactionTotal = await Payment.aggregate([
            {
                $match: {
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: { $month: '$createdAt' },
                    total: { $sum: '$amount' }
                }
            },
            {
                $addFields: {
                    month: {
                        $arrayElemAt: [monthNames, '$_id']
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    month: 1,
                    total: 1
                }
            }
        ]);

        // Create a base array of all months with a total of 0
        const allMonths = monthNames.slice(1).map((month, index) => ({
            month,
            total: 0
        }));

        // Merge the actual results with the base array
        const mergedResults = allMonths.map(baseMonth => {
            const found = monthWiseTransactionTotal.find(result => result.month === baseMonth.month);
            return found ? found : baseMonth;
        });

        const lifetimeSales = await Payment.aggregate([
            {
                $match: {
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ])

        const lastYearSales = await Payment.aggregate([
            {
                $match: {
                    status: 'completed',
                    createdAt: {
                        $gte: new Date(new Date().getFullYear() - 1, 0, 1)
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ])

        res.status(200).json({
            success: true,
            data: {
                allTransactions,
                monthlyTransactionTotal: mergedResults,
                totalTransactions: allTransactions.length,
                salesOverview: {
                    lifetimeSales: lifetimeSales[0],
                    lastYearSales: lastYearSales[0]
                }
            }
        })

    } catch (error) {

        errorLogger(error, req, res);

    }

})

module.exports = router;