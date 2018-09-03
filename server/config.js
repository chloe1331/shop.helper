const home = process.env.HOME || (process.env.HOMEDRIVE + process.env.HOMEPATH);

module.exports = {
    port: 3000,
    path: {
        HOME: home,
        APP: `${home}/.shop_helper`,
        DB: `${home}/.shop_helper/data`,
        Desc: `${home}/.shop_helper/desc`,
        Image: `${home}/.shop_helper/image`,
        Config: `${home}/.shop_helper/config`
    },
    appId: 'rSEu3cl7sIT7a3feNj0rVrmDxEHnijTbjWbF8WlkHFDMpVuXyVTx8yvHs6hUmQ9',
    taobao: {
        url: {
            login: 'https://login.taobao.com/member/login.jhtml',
            shop: 'https://myseller.taobao.com/home.htm'
        },
        domain: {
            main: '.taobao.com'
        },
        api: {
            userInfo: 'https://myseller.taobao.com/ajaxProxy.do',
            getGoods: 'https://h5api.m.taobao.com/h5/mtop.taobao.detail.getdetail/6.0',
            getProps: 'https://upload.taobao.com/auction/container/publish.htm',
            getPropValue: 'https://upload.taobao.com/auction/container/get_data.htm',
            getDesc: 'https://api.m.taobao.com/h5/mtop.taobao.detail.getdesc/6.0',
            uploadGoods: 'https://upload.taobao.com/auction/container/item_edit_upload.htm',
            uploadImage: 'https://stream.taobao.com/api/upload.api',
            getHealthListData: 'https://healthcenter.taobao.com/home/json/get_list_data.do',
            getHealthDetailList: 'https://healthcenter.taobao.com/json/get_health_detail_list.do',
            getMarketManagerList: 'https://healthcenter.taobao.com/home/json/get_market_manager_list.json',
            getCateList: 'https://upload.taobao.com/auction/json/reload_cats.htm',
            deleteGoods: 'https://sell.taobao.com/auction/merchandise/auction_list.htm',
            getItemClassify: 'https://sycm.taobao.com/bda/items/common/getItemClassify.json',
            getItemsEffectDetail: 'https://sycm.taobao.com/bda/items/effect/getItemsEffectDetail.json'
        }
    }
};