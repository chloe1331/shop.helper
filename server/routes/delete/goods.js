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

            const res = await db.Goods.deleteOne({
                _id: id
            });

            ctx.body = res;

            await next();
        }
    },
    {
        name: 'deleteTaobao',
        cb: async (ctx, next, {
            db,
            server
        }) => {
            const {
                uid,
                ids
            } = ctx.request.body;
            
            if (!uid || !ids) ctx.throw(422, '参数错误');

            const user = await db.Account.findOne({
                _id: uid
            });

            await Utils.Taobao.deleteGoods(server, user, {
                ids
            });

            ctx.body = {
                ret: 0
            };

            await next();
        }
    }
];

module.exports = Api;