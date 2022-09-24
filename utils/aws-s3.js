require('dotenv').config();
const AWS = require('aws-sdk');

const bucketName = process.env.S3_BUCKET;
const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_KEY;
const secretAccessKey = process.env.S3_SECRET;

// Create S3 service object
s3 = new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey
});

module.exports = {
    s3,
    bucketName,
}