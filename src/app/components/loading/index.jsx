import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.less';

export default class Loading extends Component {
    render() {
        const { className = '', text } = this.props;

        return (
            <span className={`loading ${className || ''}`}>
                <span className="loading-box">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="15px" height="22px" viewBox="0 0 24 30">
                        <rect x="0" y="8.05556" width="4" height="13.8889" fill="#333" opacity="0.2">
                            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
                            <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
                            <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0s" dur="0.6s" repeatCount="indefinite"></animate>
                        </rect>
                        <rect x="8" y="9.44444" width="4" height="11.1111" fill="#333" opacity="0.2">
                            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
                            <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
                            <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.15s" dur="0.6s" repeatCount="indefinite"></animate>
                        </rect>
                        <rect x="16" y="6.94444" width="4" height="16.1111" fill="#333" opacity="0.2">
                            <animate attributeName="opacity" attributeType="XML" values="0.2; 1; .2" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
                            <animate attributeName="height" attributeType="XML" values="10; 20; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
                            <animate attributeName="y" attributeType="XML" values="10; 5; 10" begin="0.3s" dur="0.6s" repeatCount="indefinite"></animate>
                        </rect>
                    </svg>
                    {text == false ? null : text || '正在加载...'}
                </span>
            </span>
        );
    }
}

Loading.propTypes = {
    text: PropTypes.string,
    className: PropTypes.string
};

class Content extends Component {
    render() {
        const { loading, children, text, className, hidden } = this.props;

        if (hidden) {
            return (
                <div className={`loading-content ${className || ''}`}>
                    {loading ? <Loading text={text} /> : null }
                    <div style={{ opacity: loading ? '0' : '1', height: '100%' }}>{children}</div>
                </div>
            );
        }

        if (loading) {
            return (
                <div className={`loading-content ${className || ''}`}>
                    <Loading text={text} />
                </div>
            );
        }

        return children || <div></div>;
    }
}

Content.propTypes = {
    loading: PropTypes.bool,
    children: PropTypes.any,
    text: PropTypes.string,
    className: PropTypes.string,
    hidden: PropTypes.bool
};

Loading.Content = Content;