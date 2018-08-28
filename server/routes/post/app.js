const Api = [{
    name: 'clear',
    cb: async (ctx, next, {
        db
    }) => {
        const {
            data = []
        } = ctx.request.body;

        if (data.includes('cache')) {
            ctx.app.emit('clear:cache');
        }

        if (data.includes('image')) {
            await db.Image.deleteMany();
        }

        if (data.includes('account')) {
            await db.Account.deleteMany();
        }

        if (data.includes('goods')) {
            await db.Goods.deleteMany();
        }

        if (data.includes('task')) {
            await db.Task.deleteMany();
        }

        if (data.includes('lexicon')) {
            await db.Lexicon.deleteMany();
        }

        if (data.includes('limit')) {
            await db.Limit.deleteMany();
        }

        if (data.includes('punish')) {
            await db.Punish.deleteMany();
        }

        ctx.body = {
            ret: 0
        };

        await next();
    }
}];

module.exports = Api;