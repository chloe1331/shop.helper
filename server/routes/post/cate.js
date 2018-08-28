const fs = require('fs');
const path = require('path');
const Utils = require('../utils');
const Config = require('../../config');

const Api = [{
    name: 'init',
    cb: async (ctx, next, {
        db,
        server
    }) => {
        const {
            uid
        } = ctx.request.body;

        if (!uid) ctx.throw(422, '参数错误');

        const user = await db.Account.findOne({
            _id: uid
        });

        if (!user) ctx.throw(422, '未获取到用户信息');

        try{
            fs.unlinkSync(path.join(Config.path.Config, 'cate.json'));
        } catch(e) {
            console.log(e.message);
        }
        
        // 获取一级目录
        let all = await Utils.Taobao.getCateList(server, user).catch(e => ctx.throw(422, `api:${e.message}`));
        all = all[0].data;

        // 获取二级目录
        for (let i = 0; i < all.length; i++) {
            const first = all[i];
            for (let n = 0; n < first.data.length; n++) {
                const second = first.data[n];
                const res = (await Utils.Taobao.getCateList(server, user, {
                    path: 'next',
                    sid: second.sid
                }).catch(e => ctx.throw(422, `api:${e.message}`)));
                console.log(second.name);
                if (res[0]) {
                    let list = [];
                    res[0].data.forEach(item => {
                        list = list.concat(item.data);
                    });
                    second.child = list;
                }
            }
        }

        if (!fs.existsSync(Config.path.Config)) {
            fs.mkdirSync(Config.path.Config);
        }

        fs.writeFileSync(path.join(Config.path.Config, 'cate.json'), JSON.stringify(all));

        ctx.body = all;

        await next();
    }
}];

module.exports = Api;