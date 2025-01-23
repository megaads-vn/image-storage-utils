class BaseStorage {
    async getFile(filePath, options = {}) {
        throw new Error("getFile must be implemented");
    }
    async saveFile(filePath, fileBuffer, options = {}) {
        throw new Error("saveFile must be implemented");
    }

    async exists(filePath, options = {}) {
        throw new Error("saveFile must be implemented");
    }

    async remove(filePath, options = {}) {
        throw new Error("saveFile must be implemented");
    }
}

module.exports = BaseStorage;