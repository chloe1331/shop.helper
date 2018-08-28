const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const request = require('request');
const { ipcMain } = require('electron');

const Routes = require('./routes');
const Config = require('./config');
const Utils = require('./routes/utils');
const method = ['get', 'post', 'delete'];

const app = new Koa();
const router = new Router();

let ipcEvent = null;

ipcMain.on('api:ipc', (event) => {
    ipcEvent = event;
});

ipcMain.on('task:start', () => {
    app.emit('task:start');
});

app.on('will:login', (args) => {
    if (args.user && args.user.password) {
        args.user.password = Utils.Global.decodePassword(args.user.password);
    }

    ipcEvent && ipcEvent.sender.send('will:login', args);
});

app.on('reload:task', (args) => {
    ipcEvent && ipcEvent.sender.send('reload:task', args);
});

app.on('punish:check', (args) => {
    ipcEvent && ipcEvent.sender.send('punish:check', args);
});

app.on('task:start', () => {
    if (!app.is_task) {
        app.is_task = true;
        app._server.post('/task/start.json');
    }
});

app.is_task = false;

async function getServer() {
    const server = {};
    method.forEach(item => {
        server[item] = (url, data, options) => {
            return new Promise((resolve, reject) => {
                const apiUrlMatch = url.match(/^api:(.*)/);
                const base = {
                    method: item,
                    url: /^http[s]?/.test(url) ? url : apiUrlMatch ? Config.taobao.api[apiUrlMatch[1]] : `http://localhost:${Config.port}${url}`,
                    json: options && options.json || true,
                    encoding: options && options.encoding
                };
                if (data) {
                    if (['get'].includes(item)) {
                        base.qs = data;
                        base.useQuerystring = true;
                    } else {
                        // if (options && options.qs) base.qs = options.qs;
                        base.form = data;
                    }
                }

                request(Object.assign(base, options), (error, response, body) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    if (apiUrlMatch) {
                        if (response.request.host == 'login.taobao.com') {
                            app.emit('will:login', {
                                user: options.user
                            });
                            reject(new Error('登录失效'));
                        }
                    }

                    if (!body) {
                        console.log(base);
                        reject(new Error('未获取到接口信息'));
                        return;
                    }

                    if (apiUrlMatch && base.url.match(/https:\/\/sycm.taobao.com/)) {
                        if (body.code == 5810) {
                            app.emit('will:login', {
                                user: options.user
                            });
                            reject(new Error('登录失效'));
                        } else if (body.code !== 0) {
                            reject(new Error(body.message));
                        }
                    }

                    if (response.statusCode != 200) {
                        reject(new Error(body));
                        return;
                    }

                    resolve(options && options.response ? response : body);
                });
            });
        };
    });

    Routes.get(router, {
        db: await require('./model')(),
        server
    });

    app.use(bodyParser({
        strict: true
    }));

    app.use(router.routes()).use(router.allowedMethods());

    const listen = app.listen(Config.port);

    app._server = server;

    return {
        server,
        listen,
        app
    };
}

module.exports = async function createServer() {
    return await getServer();
};