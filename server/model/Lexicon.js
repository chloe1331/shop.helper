'use strict';

const Document = require('camo').Document;

class Lexicon extends Document {
    constructor() {
        super();

        this.schema({
            uid: {
                type: Number,
                require: false
            },
            sid: {
                type: String,
                require: false
            },
            titles: {
                type: Array,
                require: false
            },
            main: {
                type: String,
                require: false
            },
            sub: {
                type: String,
                require: false
            },
            created_at: {
                type: Date,
                require: false
            }
        });
    }

    static collectionName() {
        return 'lexicon';
    }
}

module.exports = Lexicon;