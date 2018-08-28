const cheerio = require('cheerio');
const path = require('path');
const fs = require('fs');
const Iconv = require('iconv-lite');
const moment = require('moment');

const Global = require('./global');

const Api = {
    getGoods: (server, id) => {
        return server.get('api:getGoods', {
            jsv: '2.4.11',
            appKey: 12574478,
            t: new Date().getTime(),
            sign: '',
            api: 'mtop.taobao.detail.getdetail',
            v: '6.0',
            ttid: '2018@taobao_iphone_9.9.9',
            utdid: '123123123123123',
            isSec: 0,
            ecode: 0,
            AntiFlood: true,
            AntiCreep: true,
            H5Request: true,
            data: (JSON.stringify({
                itemNumId: id,
                exParams: JSON.stringify({
                    id
                }),
                detail_v: '3.1.1',
                ttid: '2018@taobao_iphone_9.9.9',
                utdid: '123123123123123'
            }))
        }).then(res => res.data);
    },

    getCatGlobal: (server, user, catId) => {
        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);

        return server.get('api:getProps', {
            catId
        }, {
            headers: {
                Cookie: _cookies.map(item => `${item.name}=${item.value}`).join(';')
            },
            user
        }).then(body => {
            body = body.replace(/[\s\n\r]/ig, '');
            const propsMatch = body.match(/define\("page_data",(.*)}}}\);/);
            if (!propsMatch) throw new Error('未获取到属性配置信息，可能店铺不支持该分类的宝贝');
            return Global.parseObjectString(`${propsMatch[1]}}}}`);
        });
    },

    getPropValue: (server, user, args) => {
        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);

        return server.get('api:getPropValue', Object.assign({
            _input_charset: 'utf-8',
            _output_charset: 'utf-8'
        }, args), {
            headers: {
                Cookie: _cookies.map(item => `${item.name}=${item.value}`).join(';')
            },
            user
        });
    },

    getCreateInfo: (server, user) => {
        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);

        return server.get('https://upload.taobao.com/auction/sell.jhtml', {}, {
            headers: {
                Cookie: _cookies.map(item => `${item.name}=${item.value}`).join(';')
            },
            user
        }).then(res => {
            const $ = cheerio.load(res, {
                decodeEntities: false
            });
            const itemId = $('input[name="itemNumId"]').val();
            const token = $('input[name="_tb_token_"]').val();
            return {
                itemId: parseInt(itemId),
                token
            };
        }).catch(() => {
            throw new Error('获取宝贝创建itemId失败');
        });
    },

    uploadGoods: (server, user, data) => {
        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);

        data.catId = parseInt(data.catId);
    
        return Api.getCreateInfo(server, user)
            .then(res => {
                data.itemId = res.itemId;
                // console.log(JSON.stringify(data));
                return server.post('api:uploadGoods', {
                    dataBody: JSON.stringify(data),
                    // token: config.uiConfig.global.token
                    token: res.token
                }, {
                    headers: {
                        Cookie: _cookies.map(item => `${item.name}=${item.name == '_tb_token_' ? res.token : item.value}`).join(';')
                    },
                    qs: {
                        _input_charset: 'utf-8',
                        _output_charset: 'utf-8',
                        submitType: 'ajax',
                        isBbcItem: false,
                        ssss: 393
                    },
                    timeout: 6 * 1000,
                    user
                }).then(res => {
                    if (typeof res != 'object') throw new Error('访问受限了！稍后再试');
                    if (res.isLogin == false) {
                        throw new Error('登录失效');
                    }
                    if (res.error) {
                        console.log(res.error.global);
                        console.log(res.error.fields);
                        if (res.error.global.length) {
                            throw new Error(res.error.global[0][Object.keys(res.error.global[0])[0]]);
                        }
                        if (Object.keys(res.error.fields).length) {
                            const obj = res.error.fields[Object.keys(res.error.fields)[0]][0];
                            const key = Object.keys(obj)[0];
                            throw new Error(`${Object.keys(res.error.fields)[0]}: ${obj[key]}`);
                        }
                    }

                    return res;
                });
            });
    },

    uploadImage: async (server, user, url) => {
        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);

        const file = await server.post('/image/savelocal.json', {
            url
        }).catch(e => ({
            status: 422,
            message: e.message
        }));

        if (file.status) {
            return file;
        }

        const name = path.basename(file.path);
        return server.post('api:uploadImage', null, {
            qs: {
                appkey: 'tu',
                folderId: 0,
                watermark: false,
                _input_charset: 'utf-8'
            },
            headers: {
                Cookie: _cookies.map(item => `${item.name}=${item.value}`).join(';')
            },
            formData: {
                name,
                file: fs.createReadStream(file.path)
            },
            timeout: 6 * 1000,
            user
        });
    },

    getHealthDetailList: async (server, user, scat) => {
        const pageSize = 15;
        let page = 1;
        let list = [];
        let total = 0;

        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);

        while (page == 1 || (page - 1) * pageSize < total) {
            await server.get('api:getHealthDetailList', {
                scat,
                pageSize,
                currentPage: page,
                itemId: ''
            }, {
                user,
                json: false,
                encoding: null,
                headers: {
                    Cookie: _cookies.map(item => `${item.name}=${item.value}`).join(';'),
                    Referer: 'https://healthcenter.taobao.com/health_detail.htm'
                }
            }).then(res => {
                res = JSON.parse(Iconv.decode(res, 'GBK'));
                total = res.pageDO.totalCount;
                list = list.concat(res.module || []);
                return res;
            });
            page++;
        }

        return {
            total,
            list
        };
    },

    getHealthListData: async (server, user) => {
        const pageSize = 15;
        let page = 1;
        let list = [];
        let total = 0;

        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);

        while (page == 1 || (page - 1) * pageSize < total) {
            await server.get('api:getHealthListData', {
                page,
                status: 1,
                dataType: 1,
                entityType: 2
            }, {
                user,
                json: false,
                encoding: null,
                headers: {
                    Cookie: _cookies.map(item => `${item.name}=${item.value}`).join(';'),
                    Referer: 'https://healthcenter.taobao.com/home/pending_list.htm'
                }
            }).then(res => {
                res = JSON.parse(Iconv.decode(res, 'GBK'));
                total = res.listViewResultDO.pageDO.totalCount;
                list = list.concat(res.listViewResultDO.module || []);
                return res;
            });
            page++;
        }

        return {
            total,
            list
        };
    },

    getMarketManagerList: async (server, user) => {
        const pageSize = 15;
        let page = 1;
        let list = [];
        let total = 0;

        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);

        while (page == 1 || (page - 1) * pageSize < total) {
            await server.get('api:getMarketManagerList', {
                page,
                appealStatus: 1
            }, {
                user,
                json: false,
                encoding: null,
                headers: {
                    Cookie: _cookies.map(item => `${item.name}=${item.value}`).join(';'),
                    Referer: 'https://healthcenter.taobao.com/home/market_manager'
                }
            }).then(res => {
                res = JSON.parse(Iconv.decode(res, 'GBK'));
                total = res.market_manager_list.pageDO.totalCount;
                list = list.concat(res.market_manager_list.module || []);
                return res;
            });
            page++;
        }

        return {
            total,
            list
        };
    },

    getCateList: (server, user, args = {}) => {
        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);
        return server.post('api:getCateList', {
            path: args.path || 'all',
            sid: args.sid || '',
            pv: ''
        }, {
            qs: {
                customId: '',
                fenxiaoProduct: ''
            },
            user,
            json: false,
            encoding: null,
            headers: {
                Cookie: _cookies.map(item => `${item.name}=${item.value}`).join(';')
            }
        }).then(res => JSON.parse(Iconv.decode(res, 'GBK')));
    },

    deleteGoods: (server, user, args = {}) => {
        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);
        
        return Api.getCreateInfo(server, user)
            .then(res => {
                return server.post('api:deleteGoods', {
                    _tb_token_: res.token,
                    action: 'goodsmanager/GoodsManageAction',
                    selectedIds: args.ids,
                    event_submit_do_delete: 1
                }, {
                    user,
                    json: false,
                    encoding: null,
                    headers: {
                        Cookie: _cookies.map(item => `${item.name}=${item.name == '_tb_token_' ? res.token : item.value}`).join(';')
                    }
                }).then(res => Iconv.decode(res, 'GBK'));
            });
    },

    getItemClassify: (server, user) => {
        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);

        return Api.getCreateInfo(server, user)
            .then(res => {
                return server.get('api:getItemClassify', {
                    statDate: moment().subtract('day', 1).format('YYYY-MM-DD'),
                    // token: '709bd23ef'
                }, {
                    user,
                    headers: {
                        Cookie: _cookies.map(item => `${item.name}=${item.name == '_tb_token_' ? res.token : item.value}`).join(';')
                    }
                });
            });
    },

    getItemsEffectDetail: (server, user, args = {}) => {
        const _cookies = Object.keys(user.cookies).map(item => user.cookies[item]);
        let dateRange = null;
        args.dateType = args.dateType || 'recent1';
        switch (args.dateType) {
        case 'recent7': 
        {
            const start_date = moment().subtract('day', 7).format('YYYY-MM-DD');
            const end_date = moment().subtract('day', 1).format('YYYY-MM-DD');
            dateRange = `${start_date}|${end_date}`;
            break;
        }
        case 'recent30':
        {
            const start_date = moment().subtract('day', 30).format('YYYY-MM-DD');
            const end_date = moment().subtract('day', 1).format('YYYY-MM-DD');
            dateRange = `${start_date}|${end_date}`;
            break;
        }
        default:
        {
            const date = moment().subtract('day', 1).format('YYYY-MM-DD');
            dateRange = `${date}|${date}`;
        }
        }
        
        const params = {
            dateRange,
            dateType: args.dateType,
            device: 0,
            orderDirection: true,
            orderField: 'itemPv',
            page: args.page || 1,
            pageLimit: args.pageSize || 10,
            type: 1
        };
        if (args.cateId) {
            params.cateId = args.cateId;
        }

        return Api.getCreateInfo(server, user)
            .then(res => {
                return server.get('api:getItemsEffectDetail', params, {
                    user,
                    headers: {
                        Cookie: _cookies.map(item => `${item.name}=${item.name == '_tb_token_' ? res.token : item.value}`).join(';')
                    }
                });
            });
    }
};

module.exports = Api;