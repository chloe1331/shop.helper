const Api = [
    {
        name: 'detail',
        cb: async (ctx, next, {
            db
        }) => {
            const {
                uid,
                sid
            } = ctx.request.query;

            if (!uid || !sid) ctx.throw(422, '参数错误');

            const record = await db.Lexicon.findOne({
                uid,
                sid
            });

            ctx.body = {
                ret: 0,
                data: record
            };
            await next();
        }
    }
];

module.exports = Api;