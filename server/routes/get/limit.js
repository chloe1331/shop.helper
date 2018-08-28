const Api = [
    {
        name: 'list',
        cb: async (ctx, next, {
            db
        }) => {
            const list = await db.Limit.find();

            ctx.body = {
                data: list || [],
                total: await db.Limit.count()
            };
            await next();
        }
    }
];

module.exports = Api;