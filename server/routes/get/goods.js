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

            if (['list', 'deliverTemplate', 'itemClassify', 'itemsEffectDetail'].includes(id)) {
                await next();
                return;
            }

            const record = await db.Goods.findOne({
                _id: id
            });

            ctx.body = record;
            await next();
        }
    },
    {
        name: 'list',
        cb: async (ctx, next, {
            db
        }) => {
            const {
                uid
            } = ctx.request.query;

            const list = await db.Goods.getList({
                uid
            }) || [];

            ctx.body = {
                data: list,
                total: await db.Goods.count()
            };
            await next();
        }
    },
    {
        name: 'deliverTemplate',
        cb: async (ctx, next, {
            db,
            server
        }) => {
            const {
                uid,
                catId
            } = ctx.request.query;

            if (!uid || !catId) ctx.throw(422, '参数错误');
            const user = await db.Account.findOne({
                _id: uid
            });

            const global = await Utils.Taobao.getCatGlobal(server, user, catId).catch(e => ctx.throw(422, `api:${e.message}`));
            let _deliverTemplate = null;

            try {
                let _deliverService = null;
                let _deliverSetting = null;
                for (let i = 0; i < global.uiConfig.items.length; i++) {
                    const item = global.uiConfig.items[i];
                    if (item.comid == 'deliverService') {
                        _deliverService = item;
                        break;
                    }
                }
                if (_deliverService) {
                    for (let i = 0; i < _deliverService.items.length; i++) {
                        const item = _deliverService.items[i];
                        if (item.id == 'deliverSetting') {
                            _deliverSetting = item.items;
                        }
                    }
                }
                if (_deliverSetting) {
                    for (let i = 0; i < _deliverSetting.length; i++) {
                        const item = _deliverSetting[i];
                        if (item.id == 'deliverTemplate') {
                            _deliverTemplate = item.options;
                        }
                    }
                }

                if (!_deliverTemplate || !_deliverTemplate.length) ctx.throw(422, '未获取到运费模版');

            } catch (e) {
                ctx.throw(422, `api:${e.message}`);
            }

            ctx.body = _deliverTemplate;

            await next();
        }
    },
    {
        name: 'itemClassify',
        cb: async (ctx, next, {
            db,
            server
        }) => {
            const {
                uid
            } = ctx.request.query;

            if (!uid) ctx.throw(422, '参数错误');
            const user = await db.Account.findOne({
                _id: uid
            });

            ctx.body = await Utils.Taobao.getItemClassify(server, user).catch(e => ctx.throw(422, `api:${e.message}`));

            await next();
        }
    },
    {
        name: 'itemsEffectDetail',
        cb: async (ctx, next, {
            db,
            server
        }) => {
            const {
                uid,
                condition
            } = ctx.request.query;

            if (!uid) ctx.throw(422, '参数错误');
            const user = await db.Account.findOne({
                _id: uid
            });

            ctx.body = await Utils.Taobao.getItemsEffectDetail(server, user, JSON.parse(condition)).catch(e => ctx.throw(422, `api:${e.message}`));

            await next();
        }
    }
];

module.exports = Api;