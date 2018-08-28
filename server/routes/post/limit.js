const Api = [{
    name: 'save',
    cb: async (ctx, next, {
        db
    }) => {
        const {
            name
        } = ctx.request.body;

        if (!name) ctx.throw(422, '参数错误');

        const data = await db.Limit.findOneAndUpdate({
            name
        }, {
            name,
            created_at: new Date().getTime()
        }, {
            upsert: true
        });

        ctx.body = {
            data
        };

        await next();
    }
}];

module.exports = Api;