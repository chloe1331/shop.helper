const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const Dashboard = require('webpack-dashboard');
const DashboardPlugin = require('webpack-dashboard/plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const fs = require('fs');

const theme = require('./less');
const config = require('./config');
const port = config.hotServer.port;
const externalsMap = {};
const externalsList = ['electron'];
const manifestPath = path.join(__dirname, './dist/manifest.json');

externalsList.forEach(item => {
    externalsMap[item] = `require("${item}")`;
});

const getCommonPlugins = ({
    env
}) => {
    return [
        new MiniCssExtractPlugin({
            filename: env === 'development' ? '[name].css' : 'css/[name].[contenthash:8].css',
            chunkFilename: env === 'development' ? undefined : 'css/[name].[contenthash:8].chunk.css'
        }),
        new webpack.DefinePlugin({
            // 定义当前运行环境，在运行环境中可以通过process.env.NODE_ENV访问当前环境
            'process.env.NODE_ENV': JSON.stringify(env === 'development' ? 'development' : 'production')
        })
    ];
};

const getDevelopmentPlugins = () => {
    return [
        new DashboardPlugin(new Dashboard().setData)
    ];
};

const getProductionPlugins = ({
    env
}) => {
    let _manifest = {};
    if (fs.existsSync(manifestPath)) {
        _manifest = fs.readFileSync(manifestPath);
        if (_manifest) {
            _manifest = JSON.parse(_manifest);
        }
    }
    return [
        new ManifestPlugin({
            fileName: './manifest.json',
            writeToFileEmit: true,
            generate: (seed, files) => files.reduce((manifest, {
                name,
                path
            }) => {
                const pathMatch = path.match(/[^/]*\.(js|css)$/);

                if (pathMatch) {
                    if (manifest[env]) {
                        manifest[env] = Object.assign(manifest[env], {
                            [name]: path
                        });
                    } else {
                        manifest[env] = {
                            [name]: path
                        };
                    }
                    if (_manifest[env]) {
                        _manifest[env] = Object.assign(_manifest[env], manifest[env]);
                    } else {
                        _manifest[env] = manifest[env];
                    }
                }

                // manifest = Object.assign(manifest, _manifest);
                return _manifest;
            }, seed)
        })
    ];
};

const getOptimization = ({
    env
}) => {
    if (env != 'development') {
        return {
            splitChunks: {
                chunks: 'all',
                name: () => {
                    return 'vendor';
                }
            }
        };
    }

    return {};
};

module.exports = (env) => {
    return {
        mode: env === 'development' ? env : 'production',
        entry: {
            app: [
                path.join(__dirname, './src/index.jsx')
            ]
        },
        output: {
            filename: env === 'development' ? '[name].js' : 'js/[name].[contenthash:8].js',
            chunkFilename: env === 'development' ? undefined : 'js/[name].[contenthash:8].chunk.js'
        },
        devServer: {
            contentBase: path.join(__dirname, 'dist'),
            compress: true,
            port
        },
        resolve: {
            extensions: ['.js', '.jsx']
        },
        externals: externalsMap,
        module: {
            rules: [{
                test: /\.(js|jsx)$/,
                include: [
                    path.resolve(__dirname, 'src')
                ],
                loader: 'babel-loader'
            }, {
                test: /\.(css|less)$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            sourceMap: true,
                            modifyVars: theme
                        }
                    }
                ]
            }, {
                test: /\.(png|jpg|gif)$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]?[hash]',
                        publicPath: `http://localhost:${config.server.port}/images/`,
                        outputPath: './images/'
                    }
                }]
            }]
        },
        optimization: getOptimization({
            env
        }),
        plugins: getCommonPlugins({
            env
        }).concat(env === 'development' ? getDevelopmentPlugins() : getProductionPlugins({ env }))
    };
};