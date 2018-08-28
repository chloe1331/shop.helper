import React, { Component } from 'react';
import { Form, Input, Select, message, Button, Table } from 'antd';
import PropTypes from 'prop-types';

import Dialog from '../dialog';
import Avatar from '../avatar';
import FormUploadGoods from '../form-upload-goods';

import './style.less';

class DialogFissionUpload extends Component {
    constructor(props) {
        super(props);
        const { user } = this.props;
        const historyTempalte = localStorage.getItem(`GOODSFISSIONDELIVERTEMPLATE_${user.uid}`);
        this.state = {
            visible: true,
            cate: [],
            count: undefined,
            second: null,
            titles: null,
            catId: null,
            template: null,
            product_ratio: null,
            sum_ratio: null,
            deliverTemplate: historyTempalte ? historyTempalte.split(',') : null
        };

        const handles = ['handleSelectCatId', 'handleSubmit'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    componentDidMount() {
        this.getCate();
        this.getDeliverTemplate();
    }

    getCate() {
        MServer.get('/cate/config.json').then(res => {
            if (res.error) {
                message.error('请先词库设置分类');
            } else {
                this.setState({
                    cate: res
                });
            }
        }).catch(e => message.error(e.message));
    }

    getCateTitle() {
        const { user } = this.props;
        const { catId } = this.state;

        MServer.get('/lexicon/detail.json', {
            uid: user._id,
            sid: catId
        }).then(res => {
            if (!res.data) {
                message.error('请先去设置词库标题');
            }
            if (res.data && typeof res.data.titles === 'object') {
                res.data.titles = Object.keys(res.data.titles).map(item => res.data.titles[item]);
            }

            this.setState({
                titles: res.data ? res.data.titles : []
            });
        }).catch(e => message.error(e.message));
    }

    getDeliverTemplate() {
        const { user, goods } = this.props;
        MServer.get('/goods/deliverTemplate.json', {
            uid: user._id,
            catId: goods.catId
        }).then(res => {
            this.setState({
                template: res
            });
        }).catch(e => message.error(e.message));
    }

    handleSelectCatId(value) {
        this.setState({ catId: value }, () => this.getCateTitle());
    }

    handleSubmit(e) {
        e.preventDefault();
        const { goods, user, form } = this.props;
        const { catId, titles, count, deliverTemplate, product_ratio, sum_ratio } = this.state;
        const { validateFieldsAndScroll } = form;
        
        if (!catId) {
            message.error('请先选择分类');
            return;
        }

        if (!titles || !titles.length) {
            message.error('请先在该分类下设置词库标题');
            return;
        }

        if (!count) {
            message.error('请先填写裂变数量');
            return;
        }

        if (parseInt(count) > titles.length) {
            message.error('裂变数量不可超过标题数量');
            return;
        }

        validateFieldsAndScroll((err, values) => {
            if (deliverTemplate) {
                localStorage.setItem(`GOODSFISSIONDELIVERTEMPLATE_${user.uid}`, deliverTemplate.join(','));
            } else {
                localStorage.removeItem(`GOODSFISSIONDELIVERTEMPLATE_${user.uid}`);
            }
            localStorage.setItem('GOODSUPLOADCONFIG', JSON.stringify(values));
            MServer.post('/fission/goods.json', {
                cat_id: catId,
                product_ratio,
                sum_ratio,
                goods_id: goods._id,
                uid: user._id,
                count,
                config: values,
                deliverTemplate: deliverTemplate ? deliverTemplate.join(',') : null
            }).then(() => {
                message.success('已加入任务列表');
                this.setState({ visible: false });
                if (window.onTriggerTask) window.onTriggerTask();
            }).catch(e => message.error(e.message));
        });
    }

    render() {
        const { afterClose, getContainer, goods, form } = this.props;
        const { visible, cate, second, titles, count, template, deliverTemplate, product_ratio, sum_ratio } = this.state;

        return (
            <Dialog
                title="批量上传"
                footer={false}
                width={820}
                afterClose={afterClose}
                getContainer={getContainer}
                visible={visible}
                onCancel={() => this.setState({ visible: false })}
                className="dialog-fission-upload"
            >
                <div className="fission-content-item">
                    <Avatar.Goods title={goods.title} headImg={goods.images[0]} />
                    <Form onSubmit={this.handleSubmit}>
                        <Form.Item label="选择一级类目">
                            <Select
                                showSearch={true}
                                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                            >
                                {
                                    cate.map(first => (
                                        <Select.OptGroup key={first.id} label={first.name}>
                                            {
                                                first.data.map(second => (
                                                    <Select.Option
                                                        key={second.sid}
                                                        onClick={() => this.setState({
                                                            second: second.child
                                                        })}
                                                    >{second.name}</Select.Option>
                                                ))
                                            }
                                        </Select.OptGroup>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                        {
                            second ? (
                                <Form.Item label="选择二级类目">
                                    <Select
                                        showSearch={true}
                                        onChange={this.handleSelectCatId}
                                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {
                                            second.map(item => (
                                                <Select.Option
                                                    key={item.sid}
                                                >{item.name}</Select.Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                            ) : null
                        }
                        <Form.Item label="裂变数量">
                            <Input style={{ width: 100 }} onChange={e => this.setState({ count: e.target.value })} value={count} />
                        </Form.Item>
                        <Form.Item label="裂变累乘系数">
                            <Input style={{ width: 100 }} onChange={e => this.setState({ product_ratio: e.target.value })} value={product_ratio} />
                        </Form.Item>
                        <Form.Item
                            label="裂变累加系数"
                            extra="商品价格 = 商品原价 * (裂变累乘系数 * 裂变下标) + (裂变累加系数 * 裂变下标)"
                        >
                            <Input style={{ width: 100 }} onChange={e => this.setState({ sum_ratio: e.target.value })} value={sum_ratio} />
                        </Form.Item>
                        {
                            template ? (
                                <Form.Item label="选择运费模板">
                                    <Select
                                        mode="multiple"
                                        style={{ width: '100%' }}
                                        placeholder="随机选择运费模板"
                                        defaultValue={deliverTemplate || undefined}
                                        onChange={values => {
                                            this.setState({
                                                deliverTemplate: values
                                            });
                                        }}
                                        filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                    >
                                        {
                                            template.map(item => (
                                                <Select.Option key={item.value}>{item.text}</Select.Option>
                                            ))
                                        }
                                    </Select>
                                </Form.Item>
                            ) : null
                        }
                        <FormUploadGoods form={form} />
                        <Form.Item key="submit" className="ant-form-item-extra">
                            <Button type="primary" htmlType="submit">开始上传</Button>
                        </Form.Item>
                    </Form>
                </div>
                {
                    titles && titles.length ? (
                        <div className="fission-content-item">
                            <Table
                                scroll={{ y: 560 }}
                                columns={[
                                    {
                                        key: 'key',
                                        dataIndex: 'key',
                                        width: 60,
                                        render: (text) => text + 1
                                    },
                                    {
                                        key: 'title',
                                        dataIndex: 'title',
                                        title: '标题'
                                    },
                                    {
                                        key: 'word',
                                        dataIndex: 'word',
                                        title: '字数',
                                        width: 80
                                    }
                                ]}
                                pagination={false}
                                dataSource={titles && titles.map((item, index) => ({
                                    key: index,
                                    title: item,
                                    word: item.length
                                })) || []}
                            />
                        </div>
                    ) : null
                }
            </Dialog>
        );
    }
}

DialogFissionUpload.propTypes = {
    user: PropTypes.object,
    goods: PropTypes.object,
    onSuccess: PropTypes.func,
    afterClose: PropTypes.func,
    getContainer: PropTypes.func,
    form: PropTypes.object
};

const _DialogFissionUpload = Form.create()(DialogFissionUpload);

module.exports = {
    open: (props) => {
        Dialog.OpenDialog({}, <_DialogFissionUpload {...props} />);
    }
};