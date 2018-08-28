'use strict';

const Document = require('camo').Document;

class Task extends Document {
    constructor() {
        super();

        this.schema({
            type: {
                type: String,
                require: false
            },
            data: {
                type: Object,
                require: false
            },
            config: {
                type: Object,
                require: false
            },
            shopName: {
                type: String,
                require: false
            },
            // 0: 等待上传, 10: 正在上传, 20: 已上传, 40: 上传失败
            status: {
                type: Number,
                require: true
            },
            created_at: {
                type: Date,
                require: true
            },
            finished_at: {
                type: Date,
                require: false
            },
            error: {
                type: String,
                require: false
            },
            success: {
                type: String,
                require: false
            }
        });
    }

    static collectionName() {
        return 'task';
    }
}

module.exports = Task;