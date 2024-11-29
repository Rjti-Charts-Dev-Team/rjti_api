const s3 = require("./S3");

const s3Delete = async (fileName) => {

    const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName
    };

    await s3.deleteObject(s3Params).promise();

    return;

}

module.exports = s3Delete;