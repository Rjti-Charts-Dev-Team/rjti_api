const aws = require('aws-sdk');

const s3 = new aws.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_SECRET,
    signatureVersion: 'v4'
});

module.exports = s3;