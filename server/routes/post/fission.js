const Utils = require('../utils');

const Api = [
    {
        name: 'goods',
        cb: async (ctx, next, {
            server,
            db
        }) => {

            const {
                cat_id,
                goods_id,
                uid,
                config,
                deliverTemplate,
                product_ratio,
                sum_ratio
            } = ctx.request.body;

            let {
                count
            } = ctx.request.body;

            if (!cat_id || !goods_id || !uid || !count) ctx.throw(422, '参数错误');

            const goods = await db.Goods.get({
                _id: goods_id
            });

            const user = await db.Account.findOne({
                _id: uid
            });

            const titles = await server.get('/lexicon/detail.json', {
                uid,
                sid: cat_id
            }).then(res => {
                if (res.data && res.data.titles) {
                    if (typeof res.data.titles === 'object') {
                        res.data.titles = Object.keys(res.data.titles).map(item => res.data.titles[item]);
                    }
                    return res.data.titles;
                }
                return null;
            });

            if (!titles || !titles.length) ctx.throw(422, '未获取到商品标题');
            
            let arr = titles;
            count = parseInt(count);

            if (count <= titles.length) {
                arr = Utils.Global.getRandomArray(arr, count);
            } else {
                ctx.throw(422, '裂变数量超过了标题数量');
            }

            await server.post('/task/save.json', {
                type: 'goods',
                shopName: user.shopName,
                ids: arr.map(item => ({
                    id: goods_id,
                    title: item,
                    images: goods.images,
                    deliverTemplate: deliverTemplate ? Utils.Global.getRandomArray(deliverTemplate.split(','), 1)[0] : null
                })),
                config,
                product_ratio,
                sum_ratio
            }).catch(e => ctx.throw(422, `api:${e.message}`));

            ctx.body = {
                ret: 0
            };

            await next();
        }
    }
];

module.exports = Api;