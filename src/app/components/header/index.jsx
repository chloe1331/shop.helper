import React, { Component } from 'react';
import { Icon, Tooltip } from 'antd';
import PropTypes from 'prop-types';

import DialogSetting from '../dialog-setting';

export default class Header extends Component {
    constructor(props) {
        super(props);

        const handles = ['handleOpenSetting'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    componentDidMount() {
        const { onTrigger } = this.props;
        window.onTriggerTask = onTrigger;
    }

    handleOpenSetting() {
        DialogSetting.open();
    }

    render() {
        const { onTrigger, visible } = this.props;

        return (
            <div className="app-header">
                <div className="right-btns">
                    <a onClick={this.handleOpenSetting}><Icon type="setting" /></a>
                    <Tooltip
                        title="点击查看任务列表"
                        placement="bottomRight"
                        arrowPointAtCenter
                    ><a onClick={() => onTrigger(visible)} ref={(e) => this.taskDom = e}><Icon type="bars" /></a></Tooltip>
                </div>
            </div>
        );
    }
}

Header.propTypes = {
    onTrigger: PropTypes.func,
    visible: PropTypes.bool
};