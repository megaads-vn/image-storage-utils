const { S3Storage, GcsStorage, FileStorage, ContaboStorage } = require('./StorageFacade');

class Storage {
    constructor(type, options = {}) {
        this.type = type;
        this.options = options;
    }

    getHandler() {
        switch (this.type) {
            case 'file':
                return new FileStorage(this.options);
            case 's3':
                return new S3Storage(this.options);
            case 'contabo':
                return new ContaboStorage(this.options);
            case 'gcs':
                return new GcsStorage(this.options);
            default:
                break;
        }
    }
}

module.exports = Storage;