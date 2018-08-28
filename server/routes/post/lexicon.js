const Utils = require('../utils');

const Api = [{
    name: 'save',
    cb: async (ctx, next, {
        db
    }) => {
        const {
            uid,
            sid,
            sum,
            main,
            sub
        } = ctx.request.body;

        if (!uid || !sum || !main || !sub || !sid) ctx.throw(422, '参数错误');

        let mainArr = main.split('\n');
        let subArr = sub.split('\n');
        const arr = [];

        if (mainArr) mainArr = mainArr.filter(item => item);
        if (subArr) subArr = subArr.filter(item => item);

        if (Utils.Global.getWordLength(mainArr.join('')) > 60) ctx.throw(422, '主词根不可超过60个字节');

        const mainLen = Utils.Global.getWordLength(mainArr.join(''));
        while (arr.length < sum) {
            const _sub = Utils.Global.getRandomArray(subArr, subArr.length);
            let _arr = [].concat(_sub);
            let name = Utils.Global.shuffle(subArr).join('');
            let len = Utils.Global.getWordLength(name);
            while (len > 60 - mainLen) {
                _arr = Utils.Global.getRandomArray(_arr, _arr.length - 1);
                name = Utils.Global.shuffle(_arr).join('');
                len = Utils.Global.getWordLength(name);
            }
            const fin_arr = mainArr.concat(_arr);

            arr.push(Utils.Global.getRandomArray(fin_arr, fin_arr.length).join(''));
        }

        await db.Lexicon.findOneAndUpdate({
            uid,
            sid
        }, {
            uid,
            sid,
            titles: arr,
            main,
            sub
        }, {
            upsert: true
        });
        
        ctx.body = arr;

        await next();
    }
}, {
    name: 'saveTitles',
    cb: async (ctx, next, {
        db
    }) => {
        const { id, titles } = ctx.request.body;

        if (!id || !titles) ctx.throw(422, '参数错误');

        const record = await db.Lexicon.findOneAndUpdate({
            _id: id
        }, {
            titles
        });

        ctx.body = record;

        await next();
    }
}];

module.exports = Api;