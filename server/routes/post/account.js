const Utils = require('../utils');

const Api = [
    {
        name: 'save',
        cb: async function (ctx, next, {
            db,
            server
        }) {
            const {
                cookies,
                userInfo
            } = ctx.request.body;

            if (!cookies && typeof userInfo != 'object') {
                ctx.throw(422, '参数错误');
            }

            const _cookies = Object.keys(cookies).map(item => cookies[item]);
            let uid = undefined;
            for (let i = 0; i < _cookies.length; i++) {
                const item = _cookies[i];
                if (item.name == 'unb') {
                    uid = parseInt(item.value);
                    break;
                }
            }

            const user = await server.get('api:userInfo', {
                action: 'FrameworkLayoutAction',
                event_submit_do_layout_data: true
            }, {
                headers: {
                    Cookie: _cookies.map(item => `${item.name}=${item.value}`).join(';')
                }
            }).then(res => res.data).catch(e => ctx.throw(422, `api:${e.message}`));

            if (userInfo.password) {
                userInfo.password = Utils.Global.encodePassword(userInfo.password);
            }

            const data = await db.Account.findOneAndUpdate({
                uid,
            }, Object.assign(userInfo || {}, {
                uid,
                shopName: user.shopName,
                avatar: user.avatar,
                score: user.dsr.sellerScore,
                cookies: _cookies,
                type: user.sellerType
            }), {
                upsert: true
            }).catch(e => ctx.throw(422, `db:${e.message}`));

            if (data.password) {
                data.password = Utils.Global.encodePassword(userInfo.password);
            }

            ctx.body = {
                ret: 0,
                data
            };

            await next();
        }
    }
];

module.exports = Api;