const fs = require('fs');
const path = require('path');
const Config = require('../../config');
const Utils = require('../utils');

const Api = [{
    name: 'config',
    cb: async (ctx, next) => {
        try {
            const res = fs.readFileSync(path.join(Config.path.Config, 'cate.json'));
            ctx.body = JSON.parse(res);
        } catch (e) {
            ctx.body = {
                error: 1,
                message: '未获取'
            };
        }

        await next();
    }
}, {
    name: 'next',
    cb: async (ctx, next, {
        server,
        db
    }) => {
        const {
            uid,
            sid
        } = ctx.request.query;

        if (!uid || !sid) ctx.throw(422, '参数错误');

        const user = await db.Account.findOne({
            _id: uid
        });

        if (!user) ctx.throw(422, '未获取到用户信息');

        const res = (await Utils.Taobao.getCateList(server, user, {
            path: 'next',
            sid
        }).catch(e => ctx.throw(422, `api:${e.message}`)));

        ctx.body = res;

        await next();
    }
}];

module.exports = Api;