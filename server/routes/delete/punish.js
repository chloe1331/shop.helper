const Api = [{
    name: 'clear',
    cb: async (ctx, next, {
        db
    }) => {
        const {
            uid
        } = ctx.request.body;

        let params = {};
        if (uid) params.uid = uid;

        const res = await db.Punish.deleteMany(params);

        ctx.body = res;

        await next();
    }
}];

module.exports = Api;