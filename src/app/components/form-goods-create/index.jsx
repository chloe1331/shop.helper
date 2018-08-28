import React, { Component } from 'react';
import { Button, Input, Form, message, Checkbox, AutoComplete } from 'antd';
import PropTypes from 'prop-types';

import FormUploadGoods from '../form-upload-goods';

import './style.less';

class FormGoodsCreate extends Component {
    constructor(props) {
        super(props);

        const status = localStorage.getItem('GOODSIMPORTUPLOADSTATUS');
        this.state = {
            submit: false,
            upload: status && status == 1
        };

        const handles = ['handleSubmit'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    handleSubmit(e) {
        if (e) e.preventDefault();
        const { submit, upload } = this.state;
        const { form, user, onSuccess } = this.props;
        const { validateFieldsAndScroll } = form;

        if (!user) {
            message.error('用户数据获取失败，请返回店铺列表页面重新进入');
            return;
        }

        if (submit) {
            return;
        }

        validateFieldsAndScroll((err, values) => {
            if (!err) {
                values.uid = user._id;
                this.setState({
                    submit: true
                });
                MServer.post('/goods/save.json', values).then(res => {
                    if (!upload) {
                        message.success('导入成功');
                        this.setState({ submit: false });
                    }
                    onSuccess(null, {
                        silent: true
                    });
                    if (upload) {
                        const config = {
                            product_ratio: values.product_ratio || '',
                            sum_ratio: values.sum_ratio || '',
                            platform_status: values.platform_status || '',
                            other: values.other || '',
                        };
                        localStorage.setItem('GOODSUPLOADCONFIG', JSON.stringify(config));

                        MServer.post('/task/save.json', {
                            ids: [res._id],
                            config,
                            shopName: user.shopName,
                            type: 'goods'
                        }).then(() => {
                            message.success('已加入任务列表');
                            this.setState({ submit: false });
                            if (window.onTriggerTask) window.onTriggerTask();
                        }).catch(e => {
                            message.error(e.message);
                            this.setState({ submit: false });
                        });
                    }
                }).catch(e => {
                    this.setState({ submit: false });
                    message.error(e.message);
                });
            }
        });
    }

    render() {
        const { form } = this.props;
        const { submit, upload } = this.state;
        const { getFieldDecorator } = form;

        return (
            <div className="goods-create-form">
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item label="商品链接">
                        {getFieldDecorator('url', {
                            rules: [
                                {
                                    required: true,
                                    message: '请先输入商品链接'
                                }, {
                                    pattern: /^https:\/\//,
                                    message: '链接地址格式不正确'
                                }
                            ]
                        })(
                            // <Input ref={e => e.focus()} style={{ width: 280 }} />
                            <AutoComplete
                                allowClear
                                autoFocus
                                placeholder="输入链接"
                                style={{ width: 200 }}
                            />
                        )}
                        <Button type="primary" htmlType="submit" loading={submit}>导入商品</Button>
                    </Form.Item>
                    <Form.Item className="ant-form-item-extra">
                        <Checkbox checked={upload} onChange={e => {
                            localStorage.setItem('GOODSIMPORTUPLOADSTATUS', e.target.checked ? 1 : 0);
                            this.setState({ upload: e.target.checked });
                        }}>导入后直接上传</Checkbox>
                    </Form.Item>
                    {upload ? <FormUploadGoods form={form} /> : null}
                </Form>
            </div>
        );
    }
}

FormGoodsCreate.propTypes = {
    form: PropTypes.object,
    user: PropTypes.object,
    onSuccess: PropTypes.func
};

export default Form.create()(FormGoodsCreate);