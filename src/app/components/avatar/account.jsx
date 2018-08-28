import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Account extends Component {
    render() {
        const { headImg, title, sub } = this.props;

        return (
            <div className="account-avatar">
                <img
                    alt="头像"
                    src={headImg || 'http://s.weituibao.com/site/images/1509441663174/1509417519336.jpg'}
                    onError={(e) => {
                        e.target.setAttribute('src', 'http://s.weituibao.com/site/images/1509441663174/1509417519336.jpg');
                    }}
                />
                <div className="userinfo">
                    <p>{title}</p>
                    {
                        sub ? (
                            <div className="sub">{sub}</div>
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

Account.propTypes = {
    headImg: PropTypes.string,
    title: PropTypes.any,
    sub: PropTypes.any
};