const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();

const bucketName = process.env.S3_BUCKET;
const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_KEY;
const secretAccessKey = process.env.S3_SECRET;

const s3 = new S3Client({
    region,
    credentials: {
        accessKeyId,
        secretAccessKey
    }
});

const uploadToS3 = async (file) => {
    const commandFile = new PutObjectCommand({
        Bucket: bucketName,
        Key: `spec/${file.name}`,
        Body: file.data.buffer,
        ContentType: file.mimetype
    });
    try {
        await s3.send(commandFile);
    } catch (e) {
        console.log(e);
    }
};

const getS3FilesList = async () => {
    const commandFile = new ListObjectsV2Command({
        Bucket: `${bucketName}`
    });
    try {
        const result = await s3.send(commandFile);
        return [...result.Contents]
            .filter(el => el.Key.includes('spec/' && '.pdf'))
            .map(el => el.Key.slice(5));
    } catch (e) {
        console.log(e);
    }
};

const downloadFromS3 = async (file) => {
    const commandFile = new GetObjectCommand({
        Bucket: bucketName,
        Key: `spec/${file}`
    });

    try {
        return await s3.send(commandFile);
    } catch (e) {
        console.log(e);
    }
};

module.exports = {
    uploadToS3,
    getS3FilesList,
    downloadFromS3,
}