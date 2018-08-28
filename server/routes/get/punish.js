const Api = [
    {
        name: 'list',
        cb: async (ctx, next, {
            db
        }) => {
            const {
                uid
            } = ctx.request.query;
            let params = {};
            if (uid) params.uid = uid;

            const list = await db.Punish.find(params, {
                sort: 'created_at'
            });

            ctx.body = {
                data: list,
            };
            await next();
        }
    }
];

module.exports = Api;