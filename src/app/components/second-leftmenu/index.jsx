import React, { Component } from 'react';
import { withRouter, Link, matchPath } from 'react-router-dom';
import { Icon, Avatar } from 'antd';
import cx from 'classnames';
import PropTypes from 'prop-types';

// import './style.less';

class SecondLeftmenu extends Component {
    render() {
        const { menu, backUrl, history, params, user } = this.props;

        return (
            <div className="left-menu">
                <div className="account-info">
                    <div className="box">
                        <Avatar src={user && user.avatar}>U</Avatar>
                        <span className="title">{user && user.shopName}</span>
                    </div>
                </div>
                <ul className="menu-list">
                    {
                        menu.map(item => (
                            <li
                                key={item.key}
                                className={cx({
                                    active: matchPath(location.hash.match(/#(.*)\?/)[1], {
                                        path: item.href
                                    })
                                })}
                            >
                                <Link to={params ? `${item.href}?${Object.keys(params).map(param => `${param}=${params[param]}`).join('&')}` : item.href} replace><Icon type={item.icon} /> {item.title}</Link>
                            </li>
                        ))
                    }
                </ul>
                <a className="back" onClick={() => history.push(backUrl)}>返回</a>
            </div>
        );
    }
}

SecondLeftmenu.propTypes = {
    history: PropTypes.object,
    menu: PropTypes.array.isRequired,
    backUrl: PropTypes.string.isRequired,
    params: PropTypes.object,
    user: PropTypes.object
};

export default withRouter(SecondLeftmenu);