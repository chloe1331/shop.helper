import React, { Component } from 'react';
import { render } from 'react-dom';
import { Modal } from 'antd';
import PropTypes from 'prop-types';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

import './style.less';

export default class Dialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible || true
        };
        const handles = ['handleCancel'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    handleCancel() {
        this.setState({
            visible: !this.state.visible
        });
    }

    render() {
        const { visible } = this.state;
        let { className } = this.props;
        className = className ? `dialog ${className}` : 'dialog';

        return (
            <Modal visible={typeof this.props.visible != 'undefined' ? this.props.visible : visible} onCancel={this.handleCancel} {...this.props} className={className} />
        );
    }
}

Dialog.propTypes = {
    visible: PropTypes.bool,
    className: PropTypes.string
};

Dialog.OpenDialog = (base = {}, children) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const props = Object.assign(base, {
        afterClose: () => {
            container.parentNode.removeChild(container);
        },
        getContainer: () => container
    });

    if (Store) props.store = Store;

    render((
        <LocaleProvider locale={zh_CN}>
            <children.type {...children.props} {...props} />
        </LocaleProvider>
    ), container);
};