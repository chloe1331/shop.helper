import React, { Component } from 'react';
import { Icon } from 'antd';
import PropTypes from 'prop-types';

import './style.less';

export default class Empty extends Component {
    render() {
        const { icon, text } = this.props;

        return (
            <div className="empty-content">
                {icon ? <Icon type={icon} /> : null}
                <span>{text || '未找到内容'}</span>
            </div>
        );
    }
}

Empty.propTypes = {
    icon: PropTypes.string,
    text: PropTypes.any
};