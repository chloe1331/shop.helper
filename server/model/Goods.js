'use strict';
const Document = require('camo').Document;

const path = require('path');
const fs = require('fs');
const Config = require('../config');

function getDescFilename(itemId) {
    return path.join(Config.path.Desc, `/desc_${itemId}.txt`);
}

class Account extends Document {
    constructor() {
        super();

        this.schema({
            // data.item.categoryId
            catId: {
                type: Number,
                require: false
            },
            price: {
                type: String,
                require: false
            },
            priceText: {
                type: String,
                require: false
            },
            quantity: {
                type: String,
                require: false
            },
            deliveryName: {
                type: String,
                require: false
            },
            // data.item.title
            title: {
                type: String,
                require: false
            },
            // data.item.images
            images: {
                type: Array,
                require: false
            },
            qualification: {
                type: Object,
                require: false
            },
            // data.item.itemId
            outerId: {
                type: String,
                require: false
            },
            // data.item.itemId
            itemId: {
                type: Number,
                require: false
            },
            // data.item.taobaoDescUrl
            descForMobile: {
                type: String,
                require: false
            },
            // data.item.taobaoPcDescUrl
            descForPC: {
                type: String,
                require: false
            },
            props: {
                type: Array,
                require: false
            },
            sku: {
                type: Array,
                require: false
            },
            skuProps: {
                type: Array,
                require: false
            },
            // 0: 未上传, 20: 已上传, 40: 上传失败
            upload_at: {
                type: Date,
                require: true
            },
            created_at: {
                type: Date,
                require: true
            },
            uid: {
                type: Number,
                require: true
            },
            shopName: {
                type: String,
                require: false
            },
            shopId: {
                type: Number,
                require: false
            },
            successId: {
                type: Number,
                require: false
            }
        });
    }

    static save(data) {
        data.descForPC = this.saveDesc(data.itemId, data.descForPC);
        return this.findOneAndUpdate({
            itemId: data.itemId,
            uid: data.uid,
        }, Object.assign({
            status: 0,
            created_at: new Date().getTime()
        }, data), {
            upsert: true
        });
    }

    static getList(args = {}) {
        return this.find(args, {
            sort: '-created_at',
            limit: 100
        }).then(res => res && res.map(item => {
            // const filename = getDescFilename(item.itemId);

            // item.descForPC = '';
            // if (fs.existsSync(filename)) {
            //     item.descForPC = fs.readFileSync(filename, {
            //         encoding: 'utf-8'
            //     });
            // }

            return item;
        }));
    }

    static get(args = {}) {
        return this.findOne(args).then(data => {
            const filename = getDescFilename(data.itemId);

            data.descForPC = '';
            if (fs.existsSync(filename)) {
                data.descForPC = fs.readFileSync(filename, {
                    encoding: 'utf-8'
                });
            }

            return data;
        });
    }

    static saveDesc(itemId, content) {
        const filename = getDescFilename(itemId);
        if (!fs.existsSync(Config.path.Desc)) {
            fs.mkdirSync(Config.path.Desc);
        }
        fs.writeFileSync(filename, content);
        return `desc_${itemId}.txt`;
    }

    static collectionName() {
        return 'goods';
    }
}

module.exports = Account;