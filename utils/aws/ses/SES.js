const aws = require('aws-sdk');

const SES = new aws.SES({
    region: process.env.SES_REGION,
    accessKeyId: process.env.SES_ACCESS_KEY,
    secretAccessKey: process.env.SES_SECRET_KEY,
    apiVersion: '2010-12-01',
})

module.exports = SES;