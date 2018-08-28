import React, { Component } from 'react';
import PropTypes from 'prop-types';

export default class Goods extends Component {
    render() {
        const { headImg, title, sub } = this.props;

        return (
            <div className="goods-avatar">
                <img alt="主图" src={/^http[s]?:\/\//.test(headImg) ? headImg : `https:${headImg}`} />
                <div className="goods-info">
                    <div className="title">{title}</div>
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

Goods.propTypes = {
    headImg: PropTypes.string,
    title: PropTypes.any,
    sub: PropTypes.any
};