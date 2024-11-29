const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const verifyAdmin = require('../middlewares/verifyAdmin');
const s3 = require('../utils/aws/s3/S3');
const errorLogger = require('../utils/errorLogger');

router.get('/sign', verifyAdmin, async (req, res) => {

    try {

        const fileName = crypto.randomBytes(30).toString('hex');
        const fileType = req.query['file-type'];
        const fileExtension = req.query['file-extension'];

        const s3Params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileType + '-' + fileName + '.' + fileExtension,
            Expires: 120,
            ACL: 'public-read'
        };

        const url = await s3.getSignedUrlPromise('putObject', s3Params);

        res.json({
            signedRequestUrl: url,
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

router.delete('/delete', verifyAdmin, async (req, res) => {

    try {

        const fileName = req.query['file-name'];

        const s3Params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName
        };

        await s3.deleteObject(s3Params).promise();

        res.json({
            message: "File deleted successfully"
        });

    } catch (error) {

        errorLogger(error, req, res);

    }

})

module.exports = router;