const Utils = require('../utils');
const Config = require('../../config');

const Api = [
    {
        name: 'save',
        cb: async function (ctx, next, {
            db
        }) {
            let { ids } = ctx.request.body;
            const {
                type,
                shopName,
                config = {},
                product_ratio,
                sum_ratio
            } = ctx.request.body;

            if (!type || !shopName) {
                ctx.throw(422, '参数错误');
            }
            if (typeof ids === 'object') {
                ids = Object.keys(ids).map(item => ids[item]);
            }
            for (let i = 0; i < ids.length; i++) {
                const id = ids[i];
                let data = {};
                if (type === 'goods') {
                    if (typeof id == 'object') {
                        data = id;
                    } else {
                        const goods = await db.Goods.get({
                            _id: id
                        });
                        data = {
                            id,
                            title: goods.title,
                            images: goods.images,
                        };
                    }
                }
                await Utils.Global.delay(100);
                if (product_ratio) config.product_ratio = parseFloat(product_ratio) * (i + 1);
                if (sum_ratio) config.sum_ratio = parseFloat(sum_ratio) * (i + 1);
                const _data = {
                    data,
                    shopName,
                    status: 0,
                    type,
                    config,
                    created_at: new Date().getTime()
                };
                const task = db.Task.create(_data);
                await task.save();
            }

            ctx.app.emit('reload:task');
            ctx.app.emit('task:start');

            ctx.body = {
                ret: 0
            };

            await next();
        }
    },
    {
        name: 'start',
        cb: async function(ctx, next, {
            server,
            db
        }) {
            console.log('start one task');
            const taskList = await db.Task.find({
                status: 0
            }, {
                sort: '-created_at'
            });

            const configRecord = await db.Config.findOne({
                appId: Config.appId
            });

            if (taskList && taskList.length) {
                const task = taskList[0];
                await db.Task.findOneAndUpdate({
                    _id: task._id
                }, {
                    status: 10
                });
                ctx.app.emit('reload:task');

                await server.post('/goods/upload.json', {
                    data: task.data,
                    config: task.config
                }).then(res => {
                    return db.Task.findOneAndUpdate({
                        _id: task._id
                    }, {
                        status: 20,
                        success: typeof res == 'object' ? JSON.stringify(res) : res
                    }).then(async () => {
                        ctx.app.is_task = false;
                        ctx.app.emit('reload:task');
                        if (configRecord && configRecord.taskInterval) {
                            await Utils.Global.delay(configRecord.taskInterval);
                        }
                        ctx.app.emit('task:start');
                    });
                }).catch(async e => {
                    await db.Task.findOneAndUpdate({
                        _id: task._id
                    }, {
                        status: 40,
                        error: e.message
                    });

                    await server.post('/task/stop.json');

                    ctx.app.emit('reload:task');
                    ctx.app.is_task = false;
                });
            } else {
                ctx.app.is_task = false;
            }

            ctx.body = {
                ret: 0
            };

            await next();
        }
    },
    {
        name: 'reset',
        cb: async (ctx, next, {
            db
        }) => {
            const { id, type } = ctx.request.body;

            if (type == 'stop') {
                const list = await db.Task.find({
                    status: 41
                });

                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    await db.Task.findOneAndUpdate({
                        _id: item._id
                    }, {
                        status: 0
                    });
                }
            } else {
                if (!id) ctx.throw(422, '参数错误');

                await db.Task.findOneAndUpdate({
                    _id: id
                }, {
                    status: 0
                });
            }
            
            ctx.app.emit('task:start');
            ctx.app.emit('reload:task');

            ctx.body = {
                ret: 0
            };

            await next();
        }
    },
    {
        name: 'stop',
        cb: async (ctx, next, {
            db
        }) => {
            const list = await db.Task.find({
                status: 0
            });

            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                await db.Task.findOneAndUpdate({
                    _id: item._id
                }, {
                    status: 41,
                    error: '系统中断'
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
