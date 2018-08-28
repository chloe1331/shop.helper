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

            const record = await db.Task.findOne({
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
            const list = await db.Task.find(ctx.request.query || {}, {
                sort: '-created_at',
                limit: 100
            });

            ctx.body = {
                data: list,
                total: await db.Task.count()
            };
            await next();
        }
    }
];

module.exports = Api;