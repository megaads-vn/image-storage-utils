const fs = require('fs');
const path = require("path");
const BaseStorage = require('./BaseStorage');

class FileStorage extends BaseStorage {
    constructor(options = {}) {
        super();
        this.options = options;
    }

    async getFile(filePath, options = {}) {
        return fs.readFileSync(filePath);
    }

    async saveFile(filePath, fileBuffer, options = {}) {
        const dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, {
                recursive: true
            });
        }
        fs.writeFileSync(filePath, fileBuffer, function () { });

        return true;
    }

    async exists(filePath) {
        return fs.existsSync(filePath);
    }

    async remove(filePath) {
        let retval = false;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            retval = true;
        }
        return retval;
    }
}

module.exports = FileStorage;