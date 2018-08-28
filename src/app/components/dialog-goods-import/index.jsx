import React, { Component } from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import PropTypes from 'prop-types';

import Dialog from '../dialog';
import FormUploadGoods from '../form-upload-goods';

class DialogGoodsImport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            upload: true,
            submit: false
        };
        const handles = ['handleSubmit'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    handleSubmit(e) {
        e.preventDefault();
        const { form, user, onSuccess } = this.props;
        const { validateFieldsAndScroll } = form;

        if (!user) {
            message.error('用户数据获取失败，请返回店铺列表页面重新进入');
            return;
        }

        validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.uid = user._id;
                this.setState({
                    submit: true
                });
                MServer.post('/goods/save.json', values).then((res) => {
                    console.log(res)
                    this.setState({ visible: false });
                    onSuccess();
                }).catch(e => {
                    this.setState({ submit: false });
                    message.error(e.message);
                });
            }
        });
    }

    render() {
        const { afterClose, getContainer, form } = this.props;
        const { visible, upload, submit } = this.state;
        const { getFieldDecorator } = form;

        return (
            <Dialog
                title="导入商品"
                width={560}
                footer={[
                    <Button key="cancel" onClick={() => this.setState({ visible: false })}>取消</Button>,
                    <Button key="submit" loading={submit} type="primary" onClick={this.handleSubmit}>保存</Button>
                ]}
                afterClose={afterClose}
                getContainer={getContainer}
                visible={visible}
                onCancel={() => this.setState({ visible: false })}
                onOk={this.handleSubmit}
                className="dialog-goods-import"
            >
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item label="宝贝链接">
                        {getFieldDecorator('url', {
                            rules: [
                                {
                                    required: true,
                                    message: '请先输入宝贝链接'
                                }, {
                                    pattern: /^https:\/\//,
                                    message: '链接地址格式不正确'
                                }
                            ]
                        })(
                            <Input ref={e => e.focus()} />
                        )}
                    </Form.Item>
                    <Form.Item className="form-item-extra">
                        <Checkbox checked={upload} onChange={e => this.setState({ upload: e.target.checked })}>导入后直接上传</Checkbox>
                    </Form.Item>
                    {/* {
                        upload ? <FormUploadGoods /> : null
                    } */}
                    <Form.Item label={false} style={{ display: 'none' }}>
                        <Button type="primary" htmlType="submit">确认</Button>
                    </Form.Item>
                </Form>
            </Dialog>
        );
    }
}

DialogGoodsImport.propTypes = {
    afterClose: PropTypes.func,
    getContainer: PropTypes.func,
    onSuccess: PropTypes.func,
    form: PropTypes.object,
    user: PropTypes.object
};

const _DialogGoodsImport = Form.create()(DialogGoodsImport);

module.exports = {
    open: (props) => {
        Dialog.OpenDialog({}, <_DialogGoodsImport {...props} />);
    }
};