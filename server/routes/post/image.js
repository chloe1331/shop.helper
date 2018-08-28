const fs = require('fs');
const { app } = require('electron');

const Api = [{
    name: 'savelocal',
    cb: async function (ctx, next, {
        server
    }) {
        const {
            url
        } = ctx.request.body;

        if (!url) {
            ctx.throw(422, '参数错误');
        }

        const data = await server.get(url, {}, {
            encoding: 'binary',
            timeout: 6 * 1000
        }).catch((e) => {
            console.log('-----------');
            console.log(e.message);
            console.log(url);
            console.log('-----------');
            ctx.throw(422, '下载图片失败');
        });

        const formatMatch = url.match(/.(jpg|png|jpeg|gif)$/);

        // if (!fs.existsSync(Config.path.Image)) {
        //     fs.mkdirSync(Config.path.Image);
        // }
        const fileName = `${new Date().getTime()}.${formatMatch ? formatMatch[1] : 'jpg'}`;

        try {
            fs.writeFileSync(`${app.getPath('temp')}/${fileName}`, data, 'binary');
        } catch (e) {
            ctx.throw(422, '图片保存本地失败');
        }
        ctx.body = {
            name: fileName,
            path: `${app.getPath('temp')}/${fileName}`
        };
        await next();
    }
}];

module.exports = Api;