'use strict';

const connect = require('camo').connect;

const config = require('../config');

const models = {
    Account: require('./Account'),
    Goods: require('./Goods'),
    Task: require('./Task'),
    Image: require('./Image'),
    Punish: require('./Punish'),
    Lexicon: require('./Lexicon'),
    Limit: require('./Limit'),
    Config: require('./Config')
};

module.exports = () => {
    const uri = `nedb://${config.path.DB}`;

    return connect(uri).then(() => models);
};