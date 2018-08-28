import React, { Component } from 'react';
import { message } from 'antd';
import PropTypes from 'prop-types';

import Dialog from '../dialog';
import CreateShop from '../create-shop';

import './style.less';

class DialogShopLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true
        };
    }

    render() {
        const { afterClose, getContainer, user, onSuccess } = this.props;
        const { visible } = this.state;

        return (
            <Dialog
                title="登录"
                footer={false}
                width={650}
                afterClose={afterClose}
                getContainer={getContainer}
                visible={visible}
                onCancel={() => this.setState({ visible: false })}
                className="dialog-shop-login"
            >
                <CreateShop
                    user={user || null}
                    onSuccess={(data) => {
                        this.setState({
                            visible: false
                        });
                        if (onSuccess) {
                            onSuccess(data);
                        } else {
                            message.success('登录成功');
                        }
                    }}
                />
            </Dialog>
        );
    }
}

DialogShopLogin.propTypes = {
    user: PropTypes.object,
    onSuccess: PropTypes.func,
    afterClose: PropTypes.func,
    getContainer: PropTypes.func,
};

module.exports = {
    open: (props) => {
        Dialog.OpenDialog({}, <DialogShopLogin {...props} />);
    }
};