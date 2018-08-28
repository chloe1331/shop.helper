'use strict';

const Document = require('camo').Document;

class Task extends Document {
    constructor() {
        super();

        this.schema({
            name: {
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
        return 'limit';
    }
}

module.exports = Task;