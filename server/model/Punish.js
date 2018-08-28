'use strict';

const Document = require('camo').Document;

class Punish extends Document {
    constructor() {
        super();

        this.schema({
            name: {
                type: String,
                require: false
            },
            res: {
                type: Object,
                require: false
            },
            type: {
                type: Number,
                require: false
            },
            uid: {
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
        return 'punish';
    }
}

module.exports = Punish;