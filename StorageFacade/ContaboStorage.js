const { Readable, PassThrough } = require('stream');
const { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const BaseStorage = require('./BaseStorage');
const S3Storage = require('./S3Storage');

class ContaboStorage extends S3Storage {
    constructor(options = {}) {
        super(options);
        this.options = options;
        this.initClient(options);
    }

    initClient(options) {
        this.client = new S3Client({
            region: options.region,
            credentials: {
                accessKeyId: options.access_key,
                secretAccessKey: options.secret_key,
            },
            endpoint: {
                url: new URL(options.service_url),
                properties: {
                    s3BucketEndpoint: true
                }
            },
            forcePathStyle: true 
        });
    }

    
}

module.exports = ContaboStorage;