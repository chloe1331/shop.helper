'use strict';

const Document = require('camo').Document;

class Config extends Document {
    constructor() {
        super();

        this.schema({
            appId: {
                type: String,
                require: false
            },
            imageInterval: {
                type: Number,
                require: false
            },
            taskInterval: {
                type: Number,
                require: false
            }
        });
    }

    static collectionName() {
        return 'config';
    }
}

module.exports = Config;