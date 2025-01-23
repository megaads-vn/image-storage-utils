const fs = require('fs');
const path = require("path");
const urlParser = require("url");
const axios = require("axios");
const Storage = require('./Storage');

function ImageStorageUtils(options = {
    allowStorage: true,
    storagePath: 'storage/images',
    imageSizes: ['1200x0', '960x960', '96x96', '320x320', '180x180', '160x160', '250x250', '80x80', '400x600', '540x540', '255x255']
}) {
    var storagePath = options.storagePath;
    var allowStorage = options.allowStorage;
    var imageSizes = options.imageSizes;
    var requestHeaders = options.requestHeaders || {};
    var storageType = options.storageType || 'file';
    var storage = new Storage(storageType, options);
    var storageHandler = storage.getHandler();

    this.loadImage = async function (imageUrl, options = {}) {
        let filePath = buildFilePath(imageUrl);
        if (await storageHandler.exists(filePath, options)) {
            const buffer = await storageHandler.getFile(filePath, options);
        }
        return axios({
            method: "GET",
            url: imageUrl,
            responseType: "arraybuffer",
            headers: requestHeaders
        }).then(async response => {
            const fileBuffer = Buffer.from(response.data, 'base64');
            storageHandler.saveFile(filePath, fileBuffer, options);
            return fileBuffer;
        }).catch(error => {
            console.log('image-storage-utils loadImage exception', imageUrl, error.message);
            throw error;
        });
    };

    this.removeImage = async function (imageUrl) {
        let retval = false;
        let filePath = buildFilePath(imageUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            retval = true;
        }
        return retval;
    };

    this.fitImageSize = function (inputSize) {
        const RATIO_WEIGHT = 10000;
        const [requestWidth, requestHeight] = inputSize.split("x").map(Number);
        let sizes = imageSizes.slice();
        sizes.sort((a, b) => {
            const [widthA, heightA] = a.split("x").map(Number);
            const [widthB, heightB] = b.split("x").map(Number);
            hypotA = Math.hypot((widthA - requestWidth), (heightA - requestHeight));
            hypotB = Math.hypot((widthB - requestWidth), (heightB - requestHeight));
            requestRatio = requestWidth ? requestHeight / requestWidth : 1000000;
            ratioA = Math.abs((widthA ? heightA / widthA : 1000000) - requestRatio);
            ratioB = Math.abs((widthB ? heightB / widthB : 1000000) - requestRatio);
            differentA = hypotA + ratioA * RATIO_WEIGHT;
            differentB = hypotB + ratioB * RATIO_WEIGHT;
            return differentA - differentB;
        });
        return sizes[0];
    }

    this.saveFile = async function (filePath, fileBuffer, options = {}) {
        return storageHandler.saveFile(filePath, fileBuffer, options);
    }

    this.getFile = async function (filePath, options = {}) {
        return storageHandler.getFile(filePath, options);
    }

    this.exists = async function (filePath, options = {}) {
        return storageHandler.exists(filePath, options);
    }

    this.remove = async function (filePath, options = {}) {
        return storageHandler.remove(filePath, options);
    }

    function makeDir(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {
                recursive: true
            });
        }
    }

    function buildFilePath(filePath) {
        let dirs = urlParser.parse(filePath).pathname;
        dirs = dirs.split('/');
        bucket = dirs.shift();
        return (storagePath ? storagePath + '/' : '') + dirs.join('/');
    }
}

module.exports = ImageStorageUtils;
