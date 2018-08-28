const Utils = require('../utils');

const Api = [
    {
        name: 'check',
        cb: async function (ctx, next, {
            server,
            db
        }) {
            const {
                uid
            } = ctx.request.body;

            if (!uid) ctx.throw(422, '参数错误');
            const user = await db.Account.findOne({
                _id: uid
            });

            if (!user) ctx.throw(422, '未获取到用户信息');

            const taskList = [
                {
                    name: '滥发检测',
                    children: [
                        {
                            name: '广告商品',
                            scat: '1010'
                        },
                        {
                            name: '信息不符',
                            scat: '1011'
                        },
                        {
                            name: '信息重复',
                            scat: '1012'
                        },
                        {
                            name: '要素不一',
                            scat: '1013'
                        },
                        {
                            name: '规避信息',
                            scat: '1014'
                        },
                        {
                            name: '特殊要求',
                            scat: '1015'
                        }
                    ]
                },
                {
                    name: '经营优化',
                    children: [
                        {
                            name: '属性优化',
                            scat: '1110'
                        },
                        {
                            name: '价格优化',
                            scat: '1111'
                        },
                        {
                            name: '类目优化',
                            scat: '1112'
                        },
                        {
                            name: '品牌优化',
                            scat: '1113'
                        }
                    ]
                },
                {
                    name: '品质检测',
                    children: [
                        {
                            name: '违规优化',
                            scat: '1211'
                        }
                    ]
                },
                {
                    name: '发布审核',
                    children: [{
                        name: '审核优化',
                        scat: '1510'
                    }]
                }
            ];

            await db.Punish.deleteMany({
                uid
            });
            for (let i = 0; i < taskList.length; i++) {
                const item = taskList[i];
                for (let j = 0; j < item.children.length; j++) {
                    const it = item.children[j];
                    let res = await Utils.Taobao.getHealthDetailList(server, user, it.scat).catch(e => ctx.throw(422, `api:${e.message}`));
                    const name = `${item.name}:${it.name}`;
                    const _db = db.Punish.create({
                        name,
                        res,
                        type: 1,
                        uid,
                        created_at: new Date().getTime()
                    });
                    await _db.save();
                    ctx.app.emit('punish:check', {
                        name,
                        res,
                        type: 1,
                        uid
                    });
                    await Utils.Global.delay(3 * 1000);
                }
            }

            const other = [
                {
                    name: '待处理的违规',
                    type: 2,
                    getFun: Utils.Taobao.getHealthListData
                },
                {
                    name: '待处理的管控',
                    type: 3,
                    getFun: Utils.Taobao.getMarketManagerList
                }
            ];

            for (let i = 0; i < other.length; i++) {
                const item = other[i];
                
                let res = await item.getFun(server, user).catch(e => ctx.throw(422, `api:${e.message}`));
                const _db = db.Punish.create({
                    name: item.name,
                    res,
                    type: item.type,
                    uid,
                    created_at: new Date().getTime()
                });
                await _db.save();
                ctx.app.emit('punish:check', {
                    name: item.name,
                    res,
                    type: item.type,
                    uid
                });
            }

            ctx.body = {
                ret: 0
            };

            await next();
        }
    }
];

module.exports = Api;