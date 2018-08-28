import React, { Component } from 'react';
import { Form, message } from 'antd';
import PropTypes from 'prop-types';

import Dialog from '../dialog';
import FormUploadGoods from '../form-upload-goods';

class DialogGoodsUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true
        };

        const handles = ['handleSubmit'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const { form, user, ids } = this.props;
        const { validateFieldsAndScroll } = form;

        validateFieldsAndScroll((err, values) => {
            localStorage.setItem('GOODSUPLOADCONFIG', JSON.stringify(values));
            MServer.post('/task/save.json', {
                ids,
                config: values,
                shopName: user.shopName,
                type: 'goods'
            }).then(() => {
                message.success('已加入任务列表');
                if (window.onTriggerTask) window.onTriggerTask();
                this.setState({
                    visible: false
                });
            }).catch(e => message.error(e.message));
        });
    }

    render() {
        const { afterClose, getContainer, form } = this.props;
        const { visible } = this.state;

        return (
            <Dialog
                title="上传商品"
                width={560}
                afterClose={afterClose}
                getContainer={getContainer}
                visible={visible}
                onCancel={() => this.setState({ visible: false })}
                onOk={this.handleSubmit}
                className="dialog-goods-upload"
            >
                <Form onSubmit={this.handleSubmit}>
                    <FormUploadGoods form={form} />
                </Form>
            </Dialog>
        );
    }
}

DialogGoodsUpload.propTypes = {
    user: PropTypes.object,
    ids: PropTypes.array,
    form: PropTypes.object,
    afterClose: PropTypes.func,
    getContainer: PropTypes.func,
};

const _DialogGoodsUpload = Form.create()(DialogGoodsUpload);

module.exports = {
    open: (props) => {
        Dialog.OpenDialog({}, <_DialogGoodsUpload {...props} />);
    }
};