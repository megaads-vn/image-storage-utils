const fs = require('fs');
const path = require("path");
const urlParser = require("url");
const axios = require("axios");

function ImageStorageUtils(options = {
    allowStorage: true,
    storagePath: 'storage/images',
    imageSizes: ['1200x0', '960x960', '96x96', '320x320', '180x180', '160x160', '250x250', '80x80', '400x600', '540x540', '255x255']
}) {
    var storagePath = options.storagePath;
    var allowStorage = options.allowStorage;
    var imageSizes = options.imageSizes;

    this.loadImage = async function (imageUrl) {
        let filePath = buildFilePath(imageUrl);
        if (fs.existsSync(filePath) && fs.statSync(filePath).size > 0) {            
            return fs.readFileSync(filePath);
        }
        return axios({
            method: "GET",
            url: imageUrl,
            responseType: "arraybuffer"
        }).then(async response => {
            const fileBuffer = Buffer.from(response.data, 'base64');
            saveFile(filePath, fileBuffer);
            return fileBuffer;
        }).catch(error => {
            console.log('image-storage-utils loadImage exception', imageUrl, error.message);
            throw error;
        });
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

    async function saveFile(filePath, fileBuffer) {
        let retval = false;
        if (allowStorage) {
            try {
                await makeDir(path.dirname(filePath));
                await fs.writeFile(filePath, fileBuffer, function () { });
                retval = true;
            } catch (error) {
                console.log("image-storage-utils cannot save file", filePath, error.message);
            }
        }
        return retval;
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
        return storagePath + "/" + dirs.join('/');
    }
}

module.exports = ImageStorageUtils;
