const express = require('express')
const errorLogger = require('../utils/errorLogger');
const Blog = require('../models/Blog');
const verifyAdmin = require('../middlewares/verifyAdmin');
const verifyUser = require('../middlewares/verifyUser');
const Subscription = require('../models/Subscription');
const router = express.Router()


router.post('/create', verifyAdmin, async (req, res) => {

    try {

        const {
            title,
            content,
            fileType,
            fileUrl,
            isPremium
        } = req.body;

        if (!title || !content || !fileType || !fileUrl) {

            return res.status(400).json({
                error: 'All fields are required'
            });

        }

        const blog = new Blog({
            title,
            content,
            file: {
                fileType,
                fileUrl,
                fileName: fileUrl.split('/').pop()
            },
            isPremium
        });

        await blog.save();

        res.status(201).json({
            success: true,
            message: 'Blog created successfully'
        });

    } catch (error) {

        errorLogger(error, req, res)

    }

})

router.post('/update/:id', verifyAdmin, async (req, res) => {

    try {

        const {
            title,
            content,
            fileType,
            fileUrl,
            isPremium
        } = req.body;

        let data = {
            file: {}
        }

        if (title) data.title = title;
        if (content) data.content = content;
        if (fileUrl) {
            data.file.fileType = fileType;
            data.file.fileName = fileUrl.split('/').pop();
            data.file.fileUrl = fileUrl;
        }

        console.log("Data : ", data)

        const blog = await Blog.findByIdAndUpdate(req.params.id, { ...data, isPremium }, { new: true });

        if(!blog){
            return res.status(404).json({
                error: 'Blog not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Blog updated successfully'
        });

    } catch (error) {

        errorLogger(error, req, res)

    }

})

router.get('/admin/all', verifyAdmin, async (req, res) => {

    try {

        const blogs = await Blog.find();

        res.status(200).json({
            success: true,
            data: blogs
        });

    } catch (error) {

        errorLogger(error, req, res)

    }

})

router.get('/user/all', verifyUser, async (req, res) => {

    try {

        const userID = req.verifyUser._id;

        const subcription = await Subscription.find({ user: userID }); // improve this to check that the subscription is still valid and not expired or cancelled or refunded etc

        const blogsRegular = await Blog.find({ isPremium: false }).sort({ createdAt: -1 });

        if (!subcription.length) {

            return res.status(200).json({
                success: true,
                data: blogsRegular
            })

        }

        const blogsAll = await Blog.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: blogsAll
        });

    } catch (error) {

        errorLogger(error, req, res)

    }

})

router.get('/user/:query', verifyUser, async (req, res) => {

    try {

        const query = req.params.query;

        const blog = await Blog.findOne({ searchQuery: query });

        res.status(200).json({
            success: true,
            data: blog
        });

    } catch (error) {

        errorLogger(error, req, res)

    }

})

router.get('/admin/:id', verifyAdmin, async (req, res) => {

    try {

        const blog = await Blog.findById(req.params.id);

        res.status(200).json({
            success: true,
            blog
        });

    } catch (error) {

        errorLogger(error, req, res)

    }

})

router.delete('/delete/:id', verifyAdmin, async (req, res) => {

    try {

        await Blog.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        });

    } catch (error) {

        errorLogger(error, req, res)

    }

})

module.exports = router