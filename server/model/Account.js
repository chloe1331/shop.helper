'use strict';

const Document = require('camo').Document;

class Account extends Document {
    constructor() {
        super();

        this.schema({
            uid: {
                type: Number,
                require: false
            },
            username: {
                type: String,
                require: false
            },
            password: {
                type: String,
                require: false
            },
            avatar: {
                type: String,
                require: false
            },
            shopName: {
                type: String,
                require: false
            },
            score: {
                type: Number,
                require: false
            },
            cookies: {
                type: Array,
                require: false
            },
            type: {
                type: Number,
                require: false
            },
            login: {
                type: Boolean,
                require: true
            }
        });
    }

    static collectionName() {
        return 'account';
    }
}

module.exports = Account;