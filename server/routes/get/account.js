const Utils = require('../utils');

const Api = [
    {
        name: ':id',
        cb: async (ctx, next, {
            db
        }) => {
            const {
                id
            } = ctx.params;

            if (id == 'list') {
                await next();
                return;
            }

            const record = await db.Account.findOne({
                _id: id
            });

            if (record.password) {
                record.password = Utils.Global.decodePassword(record.password);
            }

            ctx.body = record;
            await next();
        }
    },
    {
        name: 'list',
        cb: async (ctx, next, {
            db
        }) => {
            const list = await db.Account.find() || [];

            ctx.body = {
                data: list.map(item => {
                    if (item.password) {
                        item.password = Utils.Global.decodePassword(item.password);
                    }
                    return item;
                })
            };
            await next();
        }
    }
];

module.exports = Api;