const cheerio = require('cheerio');
const Utils = require('../utils');

const Api = [
    {
        name: 'save',
        cb: async function (ctx, next, {
            db,
            server
        }) {
            const {
                url,
                uid
            } = ctx.request.body;

            if (!url || !uid) {
                ctx.throw(422, '参数错误');
            }

            const id = Utils.Url.getUrlParam(url, 'id');

            if (!id) ctx.throw(422, '链接错误');
            const data = await Utils.Taobao.getGoods(server, id).catch(e => ctx.throw(422, `api:${e.message}`));

            if (!data) ctx.throw(422, 'api:未抓取到宝贝信息，请检查链接是否正确');

            const user = await db.Account.findOne({
                _id: uid
            });

            if (!user) ctx.throw(422, '未获取到店铺信息');

            const uploadGoods = await db.Goods.findOne({
                successId: parseInt(data.item.itemId)
            });

            const goods = {
                uid: user.uid.toString(),
                title: data.item.title,
                images: data.item.images.map(item => /^\/\//.test(item) ? `https:${item}` : item),
                itemId: data.item.itemId,
                catId: data.item.categoryId,
                outerId: uploadGoods ? uploadGoods.outerId : data.item.itemId,
                shopName: data.seller.shopName,
                shopId: parseInt(data.seller.userId)
            };

            // 获取系统分类信息
            const global = await Utils.Taobao.getCatGlobal(server, user, data.item.categoryId).catch(e => ctx.throw(422, `api:${e.message}`));

            let _saleProps = null;
            const requiredProps = [];
            // 获取基本的props
            if (data.props && data.props.groupProps && data.props.groupProps.length) {
                if (data.props.groupProps[0]['基本信息'].length) {
                    let propMap = null;
                    let _base = null;
                    let _props = null;
                    for (let i = 0; i < global.uiConfig.items.length; i++) {
                        const item = global.uiConfig.items[i];
                        if (item.comid == 'itemBasic') {
                            _base = item;
                            break;
                        }
                    }
                    if (_base) {
                        for (let i = 0; i < _base.items.length; i++) {
                            const item = _base.items[i];
                            if (item.comid == 'props') {
                                _props = item.items;
                            }
                            if (item.comid == 'saleProps') {
                                _saleProps = item.items;
                            }
                        }
                    }
                    const setPropValue = (item) => {
                        if (item.type == 'propWrap' && item.items) {
                            const _options = {};
                            item.items[0].options.forEach(it => {
                                _options[it.text] = {
                                    value: it.value,
                                    text: it.text
                                };
                            });
                            propMap[item.label] = {
                                id: item.items[0].id,
                                type: item.type,
                                options: _options
                            };

                            if (item.required) {
                                requiredProps.push({
                                    id: item.items[0].id,
                                    type: item.type,
                                    options: _options
                                });
                            }
                        }

                        const optTypesArr = ['pop_multiple', 'checkbox_props', 'combobox'];
                        if (optTypesArr.includes(item.type) && item.options) {
                            propMap[item.label] = {
                                id: item.id,
                                type: item.type,
                                options: item.options
                            };

                            if (item.required) {
                                requiredProps.push({
                                    id: item.id,
                                    type: item.type,
                                    options: item.options
                                });
                            }
                        }

                        if (item.type == 'text' || item.type == 'measureProps') {
                            if (item.required) {
                                if (!goods.props) {
                                    goods.props = {};
                                }
                                goods.props[item.id] = '默认';
                            }
                            propMap[item.label] = {
                                id: item.id,
                                type: item.type
                            };

                            if (item.required) {
                                requiredProps.push({
                                    id: item.id,
                                    type: item.type
                                });
                            }
                        }
                    };
                    if (_props) {
                        propMap = {};
                        _props.forEach(item => setPropValue(item));
                    }

                    if (propMap) {
                        let noPropName = [];
                        const getPropFun = async (_propName, _propValue) => {
                            if (propMap[_propName]) {
                                const pidMatch = propMap[_propName].id.match(/[1-9]\d*/);
                                let val = null;
                                switch (propMap[_propName].type) {
                                case 'propWrap': {
                                    if (propMap[_propName].options[_propValue]) {
                                        val = {
                                            value: propMap[_propName].options[_propValue].value,
                                            text: propMap[_propName].options[_propValue].text,
                                            remark: ''
                                        };
                                        const subProps = await Utils.Taobao.getPropValue(server, user, {
                                            pid: pidMatch[0],
                                            catId: goods.catId,
                                            q: _propValue,
                                            vid: propMap[_propName].options[_propValue].value,
                                            module: 'subProps'
                                        }).catch(e => ctx.throw(422, `api:${e.message}`));
                                        if (subProps.data.items.length) {
                                            subProps.data.items.forEach(it => setPropValue(it));
                                        }
                                    } else {
                                        if (!pidMatch) ctx.throw(422, `api:属性:${propMap[_propName].id}格式有误`);
                                        const values = await Utils.Taobao.getPropValue(server, user, {
                                            pid: pidMatch[0],
                                            catId: goods.catId,
                                            q: _propValue,
                                            module: 'query',
                                            mode: 'search'
                                        }).catch(e => ctx.throw(422, `api:${e.message}`));
                                        let _data = {};
                                        values.data.forEach(_item => {
                                            if (_item.text == _propValue) {
                                                _data = _item;
                                            }
                                        });

                                        if (values.data && values.data.length) {
                                            val = {
                                                value: _data.value || -1,
                                                text: _data.text || _propValue,
                                                remark: ''
                                            };

                                            const subProps = await Utils.Taobao.getPropValue(server, user, {
                                                pid: pidMatch[0],
                                                catId: goods.catId,
                                                q: _propValue,
                                                vid: _data.value,
                                                module: 'subProps',
                                            }).catch(e => ctx.throw(422, `api:${e.message}`));
                                            if (subProps.data.items.length) {
                                                subProps.data.items.forEach(it => setPropValue(it));
                                            }
                                        } else {
                                            val = {
                                                value: -1,
                                                text: _propValue,
                                                remark: ''
                                            };
                                            const subProps = await Utils.Taobao.getPropValue(server, user, {
                                                pid: pidMatch[0],
                                                catId: goods.catId,
                                                data: JSON.stringify({
                                                    value: -1,
                                                    text: _propValue
                                                }),
                                                module: 'subProps',
                                            }).catch(e => ctx.throw(422, `api:${e.message}`));
                                            if (subProps.data.items.length) {
                                                subProps.data.items.forEach(it => setPropValue(it));
                                            }
                                        }
                                    }
                                    break;
                                }
                                case 'pop_multiple': {
                                    val = [];

                                    propMap[_propName].options.forEach(item => {
                                        if (_propValue.indexOf(item.text) != -1) {
                                            val.push(item);
                                        }
                                    });
                                    break;
                                }
                                case 'checkbox_props': {
                                    val = [];

                                    propMap[_propName].options.forEach(item => {
                                        if (_propValue.indexOf(item.text) != -1) {
                                            val.push(item);
                                        }
                                    });
                                    break;
                                }
                                case 'combobox': {
                                    val = {
                                        value: -1,
                                        text: _propValue
                                    };
                                    propMap[_propName].options.forEach(item => {
                                        if (item.text == _propValue) {
                                            val = {
                                                value: item.value,
                                                text: _propValue
                                            };
                                        }
                                    });
                                    break;
                                }
                                case 'text': {
                                    val = _propValue;
                                    break;
                                }
                                case 'measureProps': {
                                    val = _propValue;
                                    break;
                                }
                                }

                                if (goods.props) {
                                    goods.props[propMap[_propName].id] = val;
                                } else {
                                    goods.props = {
                                        [propMap[_propName].id]: val
                                    };
                                }
                            } else {
                                noPropName.push({
                                    name: _propName,
                                    value: _propValue
                                });
                            }
                        };
                        for (let i = 0; i < data.props.groupProps[0]['基本信息'].length; i++) {
                            const item = data.props.groupProps[0]['基本信息'][i];
                            const _propName = Object.keys(item)[0].replace(/(^\s*)|(\s*$)/g, '');
                            const _propValue = item[_propName].replace(/(^\s*)|(\s*$)/g, '');

                            await getPropFun(_propName, _propValue);
                        }

                        if (noPropName.length) {
                            const setNoPropName = async (arr) => {
                                const old = [].concat(arr);
                                noPropName = [];
                                for (let i = 0; i < arr.length; i++) {
                                    const item = arr[i];
                                    await getPropFun(item.name, item.value);
                                }
                                if (noPropName.length && noPropName.length != old.length) setNoPropName(noPropName);
                            };

                            await setNoPropName(noPropName);
                        }
                    }
                }
            }

            const hasPropsList = goods.props ? Object.keys(goods.props) : [];
            requiredProps.forEach(item => {
                if (!hasPropsList.includes(item.id)) {
                    // goods.props[item.id] 
                    switch (item.type) {
                    case 'propWrap': {
                        goods.props[item.id] = {
                            remark: '',
                            text: item.items[0].options[0].text,
                            value: item.items[0].options[0].value
                        };
                        break;
                    }
                    case 'pop_multiple': {
                        goods.props[item.id] = [{
                            remark: '',
                            text: item.options[0].text,
                            value: item.options[0].value
                        }];
                        break;
                    }
                    case 'checkbox_props': {
                        goods.props[item.id] = [{
                            remark: '',
                            text: item.options[0].text,
                            value: item.options[0].value
                        }];
                        break;
                    }
                    case 'combobox': {
                        goods.props[item.id] = [{
                            remark: '',
                            text: item.options[0].text,
                            value: item.options[0].value
                        }];
                        break;
                    }
                    case 'text': {
                        goods.props[item.id] = {
                            remark: '',
                            text: '默认',
                            value: -1
                        };
                        break;
                    }
                    case 'measureProps': {
                        goods.props[item.id] = {
                            remark: '',
                            text: '默认',
                            value: -1
                        };
                        break;
                    }
                    }
                }
            });

            // 获取qualification
            await server.get(url, null, {
                headers: {
                    'Content-type': 'text/html;charset=GBK'
                }
            }).then(body => {
                const $ = cheerio.load(body, {
                    decodeEntities: false
                });
                const aDom = $('a');
                aDom.each(function () {
                    const src = $(this).attr('href');
                    if (src) {
                        const srcMatch = src.match(/\/\/baike\.taobao\.com\/view.htm\?.*wd=(\d*)/);
                        if (srcMatch) {
                            goods.qualification = {
                                var_org_auth_tri_c_code: srcMatch[1]
                            };
                        }
                    }
                });
            }).catch(e => ctx.throw(422, `api:${e.message}`));

            // 获取价格和sku
            const apiStack = JSON.parse(data.apiStack[0].value);
            const skuCore = apiStack.skuCore;
            if (!skuCore || !skuCore.sku2info || !skuCore.sku2info[0]) ctx.throw(422, 'api:未获取到宝贝价格信息');
            goods.priceText = skuCore.sku2info[0].price.priceText;
            goods.price = skuCore.sku2info[0].price.priceText.split('-')[0];
            goods.quantity = parseInt(skuCore.sku2info[0].quantity);
            let quantity = 0;
            const propGroup = {};
            if (data.skuBase && data.skuBase.skus && _saleProps) {
                const propMap = {};
                goods.skuProps = {};
                const _salePropMap = {};
                _saleProps.forEach(item => {
                    _salePropMap[item.id] = {
                        type: item.type,
                        custom: item.custom
                    };
                    switch (item.type) {
                    case 'sku_color_new': {
                        item.groups.forEach(it => {
                            it.colors.forEach(i => {
                                _salePropMap[item.id][i.value] = {
                                    text: i.text,
                                    value: i.value
                                };
                            });
                        });
                        break;
                    }
                    case 'frame': {
                        item.items.forEach(it => {
                            if (it.type == 'sku_size') {
                                if (propGroup[item.id]) {
                                    propGroup[item.id].id.push(it.id);
                                } else {
                                    propGroup[item.id] = {
                                        id: [it.id],
                                        status: false
                                    };
                                }
                                it.options.forEach(i => {
                                    _salePropMap[item.id][i.value] = {
                                        id: it.id,
                                        text: i.text,
                                        value: i.value
                                    };
                                });
                            }
                        });
                        break;
                    }
                    default:
                        if (item.options) {
                            item.options.forEach(it => {
                                _salePropMap[item.id][it.value] = {
                                    text: it.text,
                                    value: it.value
                                };
                            });
                        }
                    }
                });
                data.skuBase.props.forEach(item => {
                    const _values = {};
                    item.values.forEach(it => {
                        _values[it.vid] = {
                            name: it.name,
                            vid: it.vid,
                            image: it.image || ''
                        };
                    });

                    propMap[item.pid] = {
                        name: item.name,
                        pid: item.pid,
                        values: _values
                    };
                });
                
                const skuTextMap = {};
                goods.sku = data.skuBase.skus.map(item => {
                    const propsKeys = item.propPath.split(';');
                    let _dataProp = {};
                    const propsArr = propsKeys.map(it => {
                        const propValues = it.split(':');
                        const numberProp = propValues[0];
                        propValues[0] = `prop_${propValues[0]}`;

                        if (_salePropMap[propValues[0]]) {
                            let nameMatch = null;
                            if (_salePropMap[propValues[0]][propValues[1]]) {
                                const nameReg = new RegExp(`(${_salePropMap[propValues[0]][propValues[1]].text})(.*$)`);
                                nameMatch = propMap[numberProp].values[propValues[1]].name.match(nameReg);
                            }
                            const is_custom = !_salePropMap[propValues[0]][propValues[1]] && !nameMatch;
                            const imgUrl = propMap[numberProp].values[propValues[1]].image || '';
                            const value = is_custom ? `-${propMap[numberProp].values[propValues[1]].vid}` : propMap[numberProp].values[propValues[1]].vid;
                            const _val = {
                                text: nameMatch ? nameMatch[1] : propMap[numberProp].values[propValues[1]].name,
                                value,
                                remark: nameMatch ? nameMatch[2].replace(/(^\s*)|(\s*$)/g, '') : '',
                                imgUrl: imgUrl ? (/^\/\//.test(imgUrl) ? `https:${imgUrl}` : imgUrl) : '',
                                // custom: !_salePropMap[propValues[0]][propValues[1]]
                                custom: is_custom
                            };
                            if (_val.custom) {
                                const _custom = _salePropMap[propValues[0]].custom;
                                if (_custom && _custom.maxLength && Utils.Global.getWordLength(_val.text) > _custom.maxLength) {
                                    _val.text = Utils.Global.cutStr(_val.text, _custom.maxLength);
                                }

                                const _key = propsKeys.filter(_k => _k != it).join(';') + ';' + propValues[0];
                                if (skuTextMap[_key]) {
                                    if (!skuTextMap[_key].includes(_val.text)) {
                                        skuTextMap[_key].push(_val.text);
                                    } else {
                                        return null;
                                    }
                                } else {
                                    skuTextMap[_key] = [_val.text];
                                }
                            }
                            if ( Utils.Global.getWordLength(_val.remark) > 16) {
                                _val.remark = Utils.Global.cutStr(_val.remark, 16);
                            }
                            _dataProp[propValues[0]] = {
                                text: '',
                                value
                            };
                            if (_salePropMap[propValues[0]].type == 'frame') {
                                const __val = {
                                    text: _val.text,
                                    value: _val.value,
                                    remark: _val.remark
                                };
                                if (_salePropMap[propValues[0]][propValues[1]]) {
                                    if (goods.skuProps[_salePropMap[propValues[0]][propValues[1]].id]) {
                                        const _l = goods.skuProps[_salePropMap[propValues[0]][propValues[1]].id].filter(i => i.value == __val.value);
                                        if (!_l.length) goods.skuProps[_salePropMap[propValues[0]][propValues[1]].id].push(__val);
                                    } else {
                                        goods.skuProps[_salePropMap[propValues[0]][propValues[1]].id] = [__val];
                                    }
                                    propGroup[propValues[0]].status = true;
                                    goods.skuProps[`${propValues[0]}_group`] = _salePropMap[propValues[0]][propValues[1]].id.replace(`${propValues[0]}_`, '');
                                } else {
                                    if (goods.skuProps[`${propValues[0]}_custom`]) {
                                        const _l = goods.skuProps[`${propValues[0]}_custom`].filter(i => i.value == __val.value);
                                        if (!_l.length) goods.skuProps[`${propValues[0]}_custom`].push(__val);
                                    } else {
                                        goods.skuProps[`${propValues[0]}_custom`] = [__val];
                                    }
                                }
                                
                                goods.skuProps[`${propValues[0]}_template`] = {
                                    isShow: false
                                };
                            } else {
                                if (goods.skuProps[propValues[0]]) {
                                    const _l = goods.skuProps[propValues[0]].filter(i => i.value == _val.value);
                                    if (!_l.length) goods.skuProps[propValues[0]].push(_val);
                                } else {
                                    goods.skuProps[propValues[0]] = [_val];
                                }
                            }
                            if (_salePropMap[propValues[0]][propValues[1]]) {
                                return propValues.join(':');
                            }
                            return [propValues[0], `-${propValues[1]}`].join(':');
                        } else {
                            // ctx.throw(422, `获取sku属性“${propValues[0]}”失败`);
                        }
                    });

                    if (!propsArr.includes(null)) {
                        const _data = {
                            // custom
                            sku_val_key: propsArr.map(it => `$${it}$`).join(''),
                            price: skuCore.sku2info[item.skuId] && skuCore.sku2info[item.skuId].price.priceText || goods.price,
                            quantity: skuCore.sku2info[item.skuId] && skuCore.sku2info[item.skuId].quantity || '0',
                            outerId: '',
                            barcode: ''
                        };

                        if (skuCore.sku2info[item.skuId]) quantity += parseInt(skuCore.sku2info[item.skuId].quantity);

                        return Object.assign(_data, _dataProp);
                    }

                    return null;
                });

                const getLengthFun = (list, index) => {
                    if (index == list.length - 1) {
                        return list[index].length;
                    }
                    return list[index].length * getLengthFun(list, index + 1);
                };
                const getPropSku = (arr) => {
                    const len = arr.length;
                    if (len >= 2) {
                        const len1 = arr[0].length;
                        const len2 = arr[1].length;
                        const lenBoth = len1 * len2;
                        const items = new Array(lenBoth);
                        let index = 0;
                        for (let i = 0; i < len1; i++) {
                            for (var j = 0; j < len2; j++) {
                                items[index] = arr[0][i] + arr[1][j];
                                index++;
                            }
                        }
                        let newArr = new Array(len - 1);
                        for (let i = 2; i < arr.length; i++) {
                            newArr[i - 1] = arr[i];
                        }
                        newArr[0] = items;
                        return getPropSku(newArr);
                    } else {
                        return arr[0];
                    }

                };

                const _arr = getPropSku(Object.keys(goods.skuProps).filter(item => goods.skuProps[item].length).map(item => goods.skuProps[item].map(it => `$${item.match(/prop_\d*/)}:${it.value}$`)));

                if (_arr.length != goods.sku.length) {
                    const skuKeyArr = goods.sku.map(item => item.sku_val_key);
                    _arr.forEach(item => {
                        if (!skuKeyArr.includes(item)) {
                            const _data = {
                                sku_val_key: item,
                                price: goods.price,
                                quantity: '0',
                                outerId: '',
                                barcode: ''
                            };
                            const propArr = item.match(/\$[^$]*\$/ig);
                            propArr.forEach(it => {
                                it = it.replace(/\$/ig, '');
                                const _match = it.match(/(prop_\d*):(\d*)/);

                                _data[_match[1]] = {
                                    text: '',
                                    value: _match[2]
                                };
                            });
                            goods.sku.push(_data);
                        }
                    });
                }

                let minPrice = null;
                goods.sku = goods.sku.filter(item => {
                    if (item) {
                        const _price = parseFloat(item.price);
                        if (minPrice === null || _price < minPrice) {
                            minPrice = _price;
                        }
                    }
                    return !!item;
                });
                if (minPrice && goods.price < minPrice) goods.price = minPrice;

                if (_saleProps) {
                    Object.keys(propGroup).forEach(item => {
                        if (!propGroup[item].status) {
                            goods.skuProps[`${item}_group`] = propGroup[item].id[1];
                        }
                    });
                }
            }
            if (quantity) goods.quantity = quantity;

            // 运费模版名称
            if (apiStack) {
                if (apiStack.delivery && apiStack.delivery.from) {
                    goods.deliveryName = apiStack.delivery.from;
                }
            }

            // 获取电脑端详情
            if (data.item.taobaoPcDescUrl) {
                const desc = await server.get('api:getDesc', {
                    appKey: '12574478',
                    t: new Date().getTime(),
                    sign: '',
                    api: 'mtop.taobao.detail.getdesc',
                    v: '6.0',
                    data: JSON.stringify({
                        id,
                        type: '1',
                        f: 'TB1WvpLJVuWBuNjSszb8qwS7Fla'
                    })
                }).then(res => res.data).catch(e => ctx.throw(422, `api:${e.message}`));
                const $ = cheerio.load(desc.pcDescContent, {
                    decodeEntities: false
                });
                const images = $('img');
                images.each(function() {
                    const src = $(this).attr('src');
                    if (/^\/\//.test(src)) {
                        $(this).attr('src', `https:${src}`);
                    }
                });
                goods.descForPC = $('body').html();
            }

            // 获取手机端详情
            if (data.item.taobaoDescUrl) {
                goods.descForMobile = [];
                const desc = await server.get('api:getDesc', {
                    appKey: '12574478',
                    t: new Date().getTime(),
                    sign: '',
                    api: 'mtop.taobao.detail.getdesc',
                    v: '6.0',
                    data: JSON.stringify({
                        id,
                        type: '0',
                        f: 'TB1WvpLJVuWBuNjSszb8qwS7Fla'
                    })
                }).then(res => res.data).catch(e => ctx.throw(422, `api:${e.message}`));

                if (desc.wdescContent.pages && desc.wdescContent.pages.length) {
                    desc.wdescContent.pages.forEach(item => {
                        const txtMatch = item.match(/^<txt>(.*)<\/txt>/);
                        if (txtMatch) {
                            goods.descForMobile.push({
                                type: 'text',
                                value: txtMatch[1]
                            });
                            return;
                        }
                        const imgMatch = item.match(/^<img([^>]*)>(.*)<\/img>/);
                        if (imgMatch) {
                            goods.descForMobile.push({
                                type: 'image',
                                value: /^\/\//.test(imgMatch[2]) ? `https:${imgMatch[2]}` : imgMatch[2],
                                attr: imgMatch[1]
                            });
                            return;
                        }
                    });
                }
                if (desc.wdescContent.summary && desc.wdescContent.summary.length) {
                    goods.descForMobile = desc.wdescContent.summary.map(item => ({
                        type: 'shortDesc',
                        value: item
                    })).concat(goods.descForMobile);
                }
            }

            ctx.body = await db.Goods.save(goods);
            // ctx.body = global;
            
            await next();
        }
    },
    {
        name: 'upload',
        cb: async function (ctx, next, {
            db,
            server
        }) {
            const {
                data,
                config = {}
            } = ctx.request.body;

            const goodsData = await db.Goods.get({
                _id: data.id
            });

            Object.assign(goodsData, data);

            const user = await db.Account.findOne({
                uid: parseInt(goodsData.uid)
            });

            // 处理商品价格
            if (config.product_ratio || config.sum_ratio) {
                const getPrice = (price) => {
                    price = parseFloat(price);
                    if (config.product_ratio) {
                        price *= parseFloat(config.product_ratio);
                    }
                    if (config.sum_ratio) {
                        price += parseFloat(config.sum_ratio);
                    }

                    return String(price.toFixed(1));
                };
                if (goodsData.sku) {
                    goodsData.sku.forEach(item => {
                        item.price = getPrice(item.price);
                    });
                }

                goodsData.price = getPrice(goodsData.price);
            }

            // 其他设置
            if (config.other) {
                if (config.other.includes('delete_first_image')) {
                    goodsData.images.splice(0, 1);
                }

                // 自动清除详情里的文字
                if (config.other.includes('clear_text')) {
                    const $ = cheerio.load(goodsData.descForPC, {
                        decodeEntities: false
                    });
                    $('body').append('<div id="content"></div>');

                    const images = $('img');
                    images.each(function () {
                        $(this).appendTo('#content');
                    });

                    goodsData.descForPC = $('#content').html();
                }

                // 自动清除详情里的外链
                if (config.other.includes('clear_link')) {
                    const $ = cheerio.load(goodsData.descForPC, {
                        decodeEntities: false
                    });

                    const aDom = $('a');
                    aDom.each(function() {
                        $(this).attr('href', '');
                    });

                    goodsData.descForPC = $('body').html();
                }

                // 主图随机打乱
                if (config.other.includes('reset_image')) {
                    goodsData.images = Utils.Global.shuffle(goodsData.images);
                }

                // 商家编码加时间值
                if (config.other.includes('code_time')) {
                    goodsData.outerId = `${goodsData.outerId}_${new Date().getTime()}`;
                }
            }

            let images = [];
            let descForPC = null;
            let descForMobile = [];
            if (goodsData.shopId && user.uid && goodsData.shopId == user.uid) {
                images = goodsData.images;
                descForPC = goodsData.descForPC;
                descForMobile = goodsData.descForMobile;
            } else {
                console.log('start upload image');
                // 上传主图
                console.log('main image');
                for (let i = 0; i < goodsData.images.length; i++) {
                    const item = goodsData.images[i];
                    const imageDb = await db.Image.findOne({
                        origrn: item,
                        uid: user.uid
                    });
                    if (imageDb) {
                        images.push(imageDb.url);
                    } else {
                        const image = await Utils.Taobao.uploadImage(server, user, item).catch(e => ctx.throw(422, `api:${e.message}`));
                        console.log(item);
                        if (image.status === 0 && image.object && image.object.url) {
                            await db.Image.findOneAndUpdate({
                                origrn: item,
                                uid: user.uid
                            }, {
                                origrn: item,
                                url: image.object.url,
                                uid: user.uid
                            }, {
                                upsert: true
                            });
                            images.push(image.object.url);
                        }
                    }
                }

                // 上传sku图片
                if (goodsData.skuProps) {
                    const keys = Object.keys(goodsData.skuProps);
                    console.log('sku image');
                    for (let i = 0; i < keys.length; i++) {
                        const item = keys[i];
                        if (goodsData.skuProps[item] && goodsData.skuProps[item].length) {
                            for (let j = 0; j < goodsData.skuProps[item].length; j++) {
                                const it = goodsData.skuProps[item][j];
                                if (it.imgUrl) {
                                    const imageDb = await db.Image.findOne({
                                        origrn: it.imgUrl,
                                        uid: user.uid
                                    });
                                    if (imageDb) {
                                        it.imgUrl = imageDb.url;
                                    } else {
                                        const image = await Utils.Taobao.uploadImage(server, user, it.imgUrl).catch(e => ctx.throw(422, `api:${e.message}`));
                                        console.log(it.imgUrl);
                                        if (image.status === 0 && image.object && image.object.url) {
                                            await db.Image.findOneAndUpdate({
                                                origrn: it.imgUrl,
                                                uid: user.uid
                                            }, {
                                                origrn: it.imgUrl,
                                                url: image.object.url,
                                                uid: user.uid
                                            }, {
                                                upsert: true
                                            });
                                            it.imgUrl = image.object.url;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // 上传商品详情图片
                const $ = cheerio.load(goodsData.descForPC, {
                    decodeEntities: false
                });
                const imgs = $('img');
                const td = $('td');
                const pl = [];
                console.log('desc image');
                imgs.each(function () {
                    let src = $(this).attr('src');
                    if (src) {
                        if (!/http[s]?:/.test(src)) {
                            src = `https:${src}`;
                        }
                        pl.push(async () => {
                            const imageDb = await db.Image.findOne({
                                origrn: src,
                                uid: user.uid
                            });
                            if (imageDb) {
                                $(this).attr('src', imageDb.url);
                            } else {
                                const image = await Utils.Taobao.uploadImage(server, user, src).catch(e => ({
                                    status: 422,
                                    message: e.massage
                                }));
                                console.log(src);
                                if (image.status === 0 && image.object && image.object.url) {
                                    await db.Image.findOneAndUpdate({
                                        origrn: src,
                                        uid: user.uid
                                    }, {
                                        origrn: src,
                                        url: image.object.url,
                                        uid: user.uid
                                    }, {
                                        upsert: true
                                    });
                                    $(this).attr('src', image.object.url);
                                } else {
                                    console.log(image);
                                    $(this).remove();
                                }
                            }
                        });
                    }
                });
                td.each(function () {
                    let src = $(this).attr('background');
                    if (src) {
                        if (!/http[s]?:/.test(src)) {
                            src = `https:${src}`;
                        }
                        pl.push(async () => {
                            const imageDb = await db.Image.findOne({
                                origrn: src,
                                uid: user.uid
                            });
                            if (imageDb) {
                                $(this).attr('background', imageDb.url);
                            } else {
                                const image = await Utils.Taobao.uploadImage(server, user, src).catch(e => ({
                                    status: 422,
                                    message: e.massage
                                }));
                                console.log(src);
                                if (image.status === 0 && image.object && image.object.url) {
                                    await db.Image.findOneAndUpdate({
                                        origrn: src,
                                        uid: user.uid
                                    }, {
                                        origrn: src,
                                        url: image.object.url,
                                        uid: user.uid
                                    }, {
                                        upsert: true
                                    });
                                    $(this).attr('background', image.object.url);
                                } else {
                                    console.log(image);
                                    $(this).remove();
                                }
                            }
                        });
                    }
                });

                await Promise.all(pl.map(item => item()));
                descForPC = $('body').html();

                // 上传手机详情图片
                if (config.other && config.other.includes('mobile_desc') && goodsData.descForMobile) {
                    console.log('mobile desc image');
                    for (let i = 0; i < goodsData.descForMobile.length; i++) {
                        const item = goodsData.descForMobile[i];
                        if (item.type == 'image') {
                            const imageDb = await db.Image.findOne({
                                origrn: item.value,
                                uid: user.uid
                            });
                            if (imageDb) {
                                item.value = imageDb.url;
                            } else {
                                const image = await Utils.Taobao.uploadImage(server, user, item.value).catch(e => ctx.throw(422, `api:${e.message}`));
                                console.log(item.value);
                                if (image.status === 0 && image.object && image.object.url) {
                                    await db.Image.findOneAndUpdate({
                                        origrn: item.value,
                                        uid: user.uid
                                    }, {
                                        origrn: item.value,
                                        url: image.object.url,
                                        uid: user.uid
                                    }, {
                                        upsert: true
                                    });
                                    item.value = image.object.url;
                                    descForMobile.push(item);
                                }
                            }
                        } else {
                            descForMobile.push(item);
                        }
                    }
                }
            }

            // 获取运费模版
            let deliverTemplate = null;
            if (!data.deliverTemplate) {
                const _deliverTemplate = await server.get('/goods/deliverTemplate.json', {
                    uid: user._id,
                    catId: goodsData.catId
                }).catch(e => ctx.throw(422, `api:${e.message}`));

                if (goodsData.deliveryName) {
                    _deliverTemplate.forEach(item => {
                        if (item.text == goodsData.deliveryName) deliverTemplate = item.value;
                    });
                }

                if (!deliverTemplate) {
                    deliverTemplate = _deliverTemplate[0].value;
                }
            } else {
                deliverTemplate = parseInt(data.deliverTemplate);
            }

            const _data = {
                stuffStatus: 5,
                title: goodsData.title,
                outerId: goodsData.outerId,
                multiMedia: {
                    image: images.map((item, index) => ({
                        url: item,
                        major: index == 0,
                        position: index
                    })),
                    imageVideo: {
                        interactiveId: '',
                        videoId: ''
                    }
                },
                sku: goodsData.sku,
                price: parseFloat(goodsData.price),
                quantity: goodsData.quantity,
                purchaseLocation: {
                    isGlobalStock: 'false'
                },
                payMode: {
                    type: 1
                },
                descEditorType: {
                    pc: 0,
                    mobile: 0
                },
                qualification: goodsData.qualification,
                descForPC,
                // descForMobile: config.other && config.other.includes('mobile_desc') && goodsData.descForMobile.length ? goodsData.descForMobile : '',
                deliverWay: [1],
                deliverTemplate,
                afterSale: {
                    forceYes: [1]
                },
                subStockType: 1,
                startTime: {
                    startType: typeof config.platform_status != 'undefined' ? parseInt(config.platform_status) : 2
                },
                catId: goodsData.catId
            };

            if (config.other && config.other.includes('mobile_desc') && descForMobile.length) {
                _data.descForMobile = descForMobile;
            }

            const res = await Utils.Taobao.uploadGoods(server, user, Object.assign(_data, goodsData.props, goodsData.skuProps)).catch(e => ctx.throw(422, `api:${e.message}`));
            if (res.success && res.success.itemId) {
                await db.Goods.findOneAndUpdate({
                    _id: data.id
                }, {
                    successId: parseInt(res.success.itemId)
                });
            }
            ctx.body = res;

            await next();
        }
    }
];

module.exports = Api;