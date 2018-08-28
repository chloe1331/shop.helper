const Api = [{
    name: 'clear',
    cb: async (ctx, next, {
        db
    }) => {
        const res = await db.Task.deleteMany({});

        ctx.body = res;

        await next();
    }
}, {
    name: ':id',
    cb: async (ctx, next, {
        db
    }) => {
        const {
            id
        } = ctx.params;

        if (id == 'clear') {
            await next();
            return;
        }

        const res = await db.Task.deleteOne({
            _id: id
        });

        ctx.body = res;

        await next();
    }
}];

module.exports = Api;