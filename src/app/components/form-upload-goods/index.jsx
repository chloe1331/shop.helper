import React, { Component } from 'react';
import { Form, Input, Checkbox, Select, Button } from 'antd';
import PropTypes from 'prop-types';

export default class FormUploadGoods extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { form } = this.props;
        const { getFieldDecorator } = form;

        const platformStatusArr = [
            {
                key: 0,
                title: '立即上架'
            },
            {
                key: 2,
                title: '放入仓库'
            }
        ];

        const shieldStatusArr = [
            {
                key: 0,
                title: '不复制'
            },
            {
                key: 1,
                title: '删除主图后上传'
            }
        ];

        const otherOpt = [
            {
                label: '自动清除详情里的外链',
                value: 'clear_link'
            },
            {
                label: '主图随机打乱',
                value: 'reset_image'
            },
            {
                label: '自动清除详情里的文字',
                value: 'clear_text'
            },
            {
                label: '采集手机详情',
                value: 'mobile_desc'
            },
            {
                label: '商家编码加时间值',
                value: 'code_time'
            },
            {
                label: '删除第一张主图',
                value: 'delete_first_image'
            },
            {
                label: '检测商品名称是否重复',
                value: 'check_title_repeat'
            }
        ];

        const initValues = localStorage.getItem('GOODSUPLOADCONFIG') ? JSON.parse(localStorage.getItem('GOODSUPLOADCONFIG')) : {};
        return (
            <div>
                <Form.Item key="product_ratio" label="价格乘积系数">
                    {getFieldDecorator('product_ratio')(
                        <Input style={{ width: 120 }} />
                    )}
                </Form.Item>
                <Form.Item
                    key="sum_ratio"
                    label="价格累加系数"
                    extra="商品价格 = 商品原价 * 价格乘积系数 + 价格累加系数"
                >
                    {getFieldDecorator('sum_ratio')(
                        <Input style={{ width: 120 }} />
                    )}
                </Form.Item>
                <Form.Item key="platform_status" label="上架状态">
                    {getFieldDecorator('platform_status', {
                        initialValue: initValues.platform_status || '2'
                    })(
                        <Select style={{ width: 180 }}>
                            {
                                platformStatusArr.map(item => <Select.Option key={item.key}>{item.title}</Select.Option>)
                            }
                        </Select>
                    )}
                </Form.Item>
                {/* <Form.Item key="shield_status" label="护盾商品">
                    {getFieldDecorator('shield_status', {
                        initialValue: '0'
                    })(
                        <Select style={{ width: 180 }}>
                            {
                                shieldStatusArr.map(item => <Select.Option key={item.key}>{item.title}</Select.Option>)
                            }
                        </Select>
                    )}
                </Form.Item> */}
                <Form.Item key="other" label="其他设置">
                    {getFieldDecorator('other', {
                        initialValue: initValues.other || []
                    })(
                        <Checkbox.Group options={otherOpt} />
                    )}
                </Form.Item>
                <Form.Item key="submit" style={{ display: 'none' }}>
                    <Button type="primary" htmlType="submit">确认</Button>
                </Form.Item>
            </div>
        );
    }
}

FormUploadGoods.propTypes = {
    form: PropTypes.object
};