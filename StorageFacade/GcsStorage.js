const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const { Readable } = require('stream');
const BaseStorage = require('./BaseStorage');

class GcsStorage extends BaseStorage {
    constructor(options = {}) {
        super();
        this.options = options;
    }

    async getFile(filePath, options = {}) {
        const bucketName = options.bucket || this.options.bucket;
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(filePath);
        const [data] = await file.download();
        return data;
    }

    async saveFile(filePath, fileBuffer, options = {}) {
        const bufferStream = new Readable();
        bufferStream.push(fileBuffer);
        bufferStream.push(null); // Signifies the end of the stream
        // Get the writable stream for the destination file in Google Cloud Storage
        const bucketName = options.bucket || this.options.bucket;
        const bucket = storage.bucket(bucketName);
        const remoteFile = bucket.file(filePath);
        const writeStream = remoteFile.createWriteStream({
            resumable: true,
            contentType: 'application/octet-stream', // or other appropriate MIME type
        });

        return bufferStream.pipe(writeStream)
    }

    async exists(filePath, options = {}) {
        const bucketName = options.bucket || this.options.bucket;
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(filePath);
        const [exists] = await file.exists();
        
        return exists;

    }

    async remove(filePath, options = {}) {
        const bucketName = options.bucket || this.options.bucket;
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(bucket);
        await file.delete();
    }
}

module.exports = GcsStorage;