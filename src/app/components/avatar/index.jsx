import React, { Component } from 'react';

import Account from './account';
import Goods from './goods';

import './style.less';

export default class Avatar extends Component {
    render() {
        return (
            <div></div>
        );
    }
}

Avatar.Account = Account;
Avatar.Goods = Goods;