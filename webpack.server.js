const path = require('path');

const externalsMap = {};
const externalsList = ['koa', 'koa-router', 'koa-bodyparser', 'request', 'electron',
    'camo', 'cheerio', 'crypto', 'iconv-lite', 'mime-types', 'fs', 'path'
];

externalsList.forEach(item => {
    // externalsMap[item] = `require("${item}")`;
    externalsMap[item] = item;
});

module.exports = {
    mode: 'production',
    devtool: '',
    target: 'node',
    entry: {
        server: [
            path.join(__dirname, './server')
        ]
    },
    output: {
        path: path.join(__dirname, './source/server'),
        filename: '[name].min.js',
        libraryTarget: 'umd'
    },
    resolve: {
        extensions: ['.js'],
    },
    optimization: {
        usedExports: true
    },
    externals: externalsMap,
    // plugins: [
    //     new Uglify()
    // ]
};
