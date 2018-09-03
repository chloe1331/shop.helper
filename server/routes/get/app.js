
const Api = [
    {
        name: 'config',
        cb: async (ctx, next, {
            db
        }) => {
            const record = await db.Config.findOne({
                appId: 'rSEu3cl7sIT7a3feNj0rVrmDxEHnijTbjWbF8WlkHFDMpVuXyVTx8yvHs6hUmQ9'
            });

            ctx.body = record;
            await next();
        }
    }
];

module.exports = Api;