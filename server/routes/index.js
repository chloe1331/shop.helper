const methods = [
    {
        name: 'get',
        api: require('./get')
    },
    {
        name: 'post',
        api: require('./post')
    },
    {
        name: 'delete',
        api: require('./delete')
    }
];

module.exports = {
    get: (router, args) => {
        methods.forEach(method => {
            Object.keys(method.api).forEach(item => {
                method.api[item].forEach(it => {
                    router[method.name](`/${item}/${it.name}.json`, (ctx, next) => it.cb(ctx, next, args));
                });
            });
        });
    }
};