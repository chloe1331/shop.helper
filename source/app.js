const { app, ipcMain, BrowserWindow, session, Tray } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');

async function createWindow() {
    // const serverObj = await require('../server')();
    // const appIcon = new Tray(path.join(__dirname, './icon.png'));
    const serverObj = await require('./server/server.min.js')();

    global.server = serverObj.server;
    const serverApp = serverObj.app;

    global.config = {
        qiniu_prefix: 'http://pdn3ckef9.bkt.clouddn.com',
        files: (await global.server.get(`http://pdn3ckef9.bkt.clouddn.com/manifest.json?_=${new Date().getTime()}`)).production
    };

    const win = new BrowserWindow({
        width: 320,
        height: 568,
        title: '店铺助手',
        // frame: false,
        resizable: false,
        maximizable: false,
        titleBarStyle: 'hidden',
        // icon: appIcon
    });
    win.loadFile('./index.html');

    ipcMain.on('LOGINED', () => {
        win.setSize(980, 672, true);
        win.center();
        win.setMaximizable(true);
        win.setResizable(true);
    });

    ipcMain.on('READY', async (event) => {
        event.returnValue = true;
    });

    win.on('close', () => {
        serverObj.listen.close();
        app.exit();
    });

    // app.on('window-all-closed', () => {
    //     console.log('ddd');
    //     serverObj.listen.close();
    //     app.exit();
    // });

    serverApp.on('clear:cache', () => {
        const ses = win.webContents.session;
        ses.clearCache(() => {
            console.log('cache');
        });
        ses.clearStorageData({}, () => {
            console.log('storage');
        });
    });

    ipcMain.on('OPENNEWWINDOW', async (event, args) => {
        let _win = new BrowserWindow({
            width: 800,
            height: 600,
            webPreferences: {
                nodeIntegration: false
            }
        });

        if (args.user) {
            for (let i = 0; i < args.user.cookies.length; i++) {
                const item = args.user.cookies[i];
                await new Promise(resolve => {
                    session.defaultSession.cookies.set({
                        url: 'https://myseller.taobao.com/',
                        name: item.name,
                        value: item.value,
                        domain: item.domain,
                        path: item.path,
                        secure: item.secure,
                        httpOnly: item.httpOnly,
                        expirationDate: item.expirationDate
                    }, (error) => {
                        resolve(true);
                    });
                });
            }
        }

        _win.loadURL(/^http[s]?:\/\//.test(args.url) ? args.url : `https://${args.url}`);
        _win.on('close', () => {
            _win.destroy();
        });
    });
}

app.setName('店铺助手');

app.on('ready', createWindow);