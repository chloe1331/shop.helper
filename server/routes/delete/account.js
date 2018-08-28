const Api = [{
    name: ':id',
    cb: async (ctx, next, {
        db
    }) => {
        const {
            id
        } = ctx.params;

        const res = await db.Account.deleteOne({
            _id: id
        });

        ctx.body = res;

        await next();
    }
}];

module.exports = Api;