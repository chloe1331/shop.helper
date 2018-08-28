import React, { Component } from 'react';
import { Link, matchPath } from 'react-router-dom';
import { Avatar, Icon } from 'antd';
import cx from 'classnames';

import './style.less';

export default class Leftmenu extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const menu = [
            {
                key: 'shop',
                title: '店铺管理',
                icon: 'shop',
                href: '/shop'
            },
            {
                key: 'team',
                title: '成员管理',
                icon: 'team',
                href: '/team'
            }
        ];

        return (
            <div className="left-menu">
                <div className="account-info">
                    <div className="box">
                        <Avatar>U</Avatar>
                        admin
                    </div>
                </div>
                <ul className="menu-list">
                    {
                        menu.map((item, index) => (
                            <li
                                key={item.key}
                                className={cx({
                                    active: (location.hash == '#/' && index == 0) || matchPath(location.hash.replace('#', ''), {
                                        path: item.href
                                    })
                                })}
                            >
                                <Link to={item.href} replace><Icon type={item.icon} /> {item.title}</Link>
                            </li>
                        ))
                    }
                </ul>
            </div>
        );
    }
}