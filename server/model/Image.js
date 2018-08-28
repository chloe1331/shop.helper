'use strict';

const Document = require('camo').Document;

class Image extends Document {
    constructor() {
        super();

        this.schema({
            origrn: {
                type: String,
                require: false
            },
            url: {
                type: String,
                require: false
            },
            uid: {
                type: Number,
                require: false
            }
        });
    }

    static collectionName() {
        return 'image';
    }
}

module.exports = Image;