const { Readable, PassThrough } = require('stream');
const { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");

const BaseStorage = require('./BaseStorage');

class S3Storage extends BaseStorage {
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
                url: new URL(options.service_url) 
            }
        });
    }
    async streamToBuffer(stream) {
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    }

    async getFile(filePath, options = {}) {
        const bucket = options.bucket || this.options.bucket;
        filePath = this.handleFilePath(filePath);

        const command = new GetObjectCommand({
            Bucket: bucket,
            Key: filePath,
        });

        const response = await this.client.send(command);
    
        const buffer = await this.streamToBuffer(response.Body);
        return buffer;
    }

    async saveFile(filePath, fileBuffer, options = {}) {
        const bucket = options.bucket || this.options.bucket;
        const stream = this.bufferToStream(fileBuffer);
        const passThroughStream = new PassThrough();
        filePath = this.handleFilePath(filePath);
        const parallelUploads3 = new Upload({
            client: this.client,
            params: {
                Bucket: bucket,
                Key: filePath,
                Body: stream,
                ACL: 'public-read',
            },
        })
        stream.pipe(passThroughStream);
        await parallelUploads3.done();
    }

    bufferToStream = (buffer) => {
        const readable = new Readable();
        readable.push(buffer);
        readable.push(null); // Signals the end of the stream
        return readable;
    }

    async exists(filePath, options = {}) {
        const bucket = options.bucket || this.options.bucket;
        filePath = this.handleFilePath(filePath);

        const command = new HeadObjectCommand({
            Bucket: bucket,
            Key: filePath,
        });
        try {
            await this.client.send(command);
            return true;
        } catch (error) {
        }
        return false;

    }

    async remove(filePath, options = {}) {
        const bucket = options.bucket || this.options.bucket;
        filePath = this.handleFilePath(filePath);

        return this.client.deleteObject({
            Bucket: bucket,
            Key: filePath,
        });
    }

    handleFilePath(filePath) {
        if (filePath.indexOf('/') === 0) {
            filePath = filePath.substring(1);
        }
        return filePath;
    }
}

module.exports = S3Storage;