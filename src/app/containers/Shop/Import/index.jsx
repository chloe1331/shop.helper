import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Table, Popconfirm, Button} from 'antd';
import cx from 'classnames';
import PropTypes from 'prop-types';

import { Layout, Loading, Avatar, DialogGoodsUpload, DialogFissionUpload, FormGoodsCreate } from '~/app/components';
import * as GoodsActions from '~/app/actions/goods';

const { shell } = require('electron');

class Import extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            list: [],
            selectedRowKeys: []
        };

        const handles = ['handleBatchUpload', 'getList'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
        if (props.goods.current) props.actions.setCurrent(null);
    }

    componentDidMount() {
        this.getList();
    }

    getList(cb, args = {}) {
        const { shop } = this.props;
        if (!this.state.loading && !args.silent) this.setState({ loading: true });
        MServer.get('/goods/list.json', {
            uid: shop.current.uid
        }).then(res => {
            if (typeof cb == 'function') cb(res.data);
            this.setState({
                loading: false,
                list: res.data
            });
        }).catch(e => message.error(e.message));
    }

    handUpload(ids) {
        const { shop } = this.props;

        DialogGoodsUpload.open({
            user: shop.current,
            ids
        });
    }

    handleDelete(id) {
        MServer.delete(`/goods/${id}.json`).then(() => {
            this.getList(null, {
                silent: true
            });
        }).catch(e => message.error(e.message));
    }

    handleFissionUpload(goods) {
        const { shop } = this.props;
        DialogFissionUpload.open({
            goods,
            user: shop.current
        });
    }

    handleBatchUpload() {
        const { shop } = this.props;
        const { selectedRowKeys } = this.state;

        if (selectedRowKeys.length) {
            DialogGoodsUpload.open({
                user: shop.current,
                ids: selectedRowKeys
            });
        } else {
            message.error('请至少选择一个商品');
        }
    }

    render() {
        const { shop } = this.props;
        const { loading, list } = this.state;
        console.log(list)
        const columns = [
            {
                key: 'title',
                dataIndex: 'title',
                title: '商品信息',
                render: (text, record) => (
                    <Avatar.Goods
                        title={(
                            <a
                                onClick={() => {
                                    shell.openExternal(`https://item.taobao.com/item.htm?id=${record.itemId}`);
                                }}
                            >{text}</a>
                        )}
                        headImg={record.images[0]}
                        sub={<span className="text-price">¥ {record.priceText}</span>}
                    />
                )
            },
            {
                key: 'shopName',
                dataIndex: 'shopName',
                width: 100,
                title: '所属店铺',
                // align: 'center',
                render: (text) => text || '-'
            },
            {
                key: 'outerId',
                dataIndex: 'outerId',
                width: 80,
                title: '商家编码',
                align: 'center'
            },
            {
                key: 'catId',
                dataIndex: 'catId',
                width: 100,
                title: '分类ID',
                align: 'center'
            },
            {
                key: 'deliveryName',
                dataIndex: 'deliveryName',
                width: 80,
                title: '运费模版',
                align: 'center'
            },
            {
                key: 'setting',
                dataIndex: '_id',
                title: '操作',
                align: 'right',
                width: 120,
                render: (id, record) => (
                    <div className="table-settng">
                        <div>
                            <a
                                onClick={() => this.handUpload([id])}
                            >上传</a>
                        </div>
                        <div>
                            <Popconfirm
                                title="确定要删除这个商品吗？"
                                onConfirm={() => this.handleDelete(id)}
                                placement="left"
                            ><a>删除</a></Popconfirm>
                        </div>
                        <div>
                            <a
                                onClick={() => this.handleFissionUpload(record)}
                            >批量上传</a>
                        </div>
                    </div>
                )
            }
        ];
        const rowSelection = {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRowKeys
                });
            },
            getCheckboxProps: record => ({
                disabled: record.name === 'Disabled User', // Column configuration not to be checked
                name: record.name,
            }),
        };

        return (
            <Layout>
                <Layout.Content>
                    <div
                        className={cx({
                            'goods-table': true,
                            empty: !loading && !list.length,
                            'no-scroll': !loading && list.length <= 3,
                            loading: loading
                        })}
                    >
                        <Loading.Content loading={loading} hidden={true} text="正在加载商品列表...">
                            <Table
                                rowKey="_id"
                                rowSelection={rowSelection}
                                columns={columns}
                                dataSource={list}
                                // pagination={false}
                                scroll={{ y: 280 }}
                            />
                            <div className="table-batch-btn">
                                <Button onClick={this.handleBatchUpload}>上传</Button>
                            </div>
                        </Loading.Content>
                    </div>
                    <FormGoodsCreate user={shop.current} onSuccess={this.getList} />
                </Layout.Content>
            </Layout>
        );
    }
}

Import.propTypes = {
    shop: PropTypes.object,
    goods: PropTypes.object,
    actions: PropTypes.object
};

function mapStateToProps(state) {
    return {
        shop: state.shop,
        goods: state.goods
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Object.assign(
            GoodsActions
        ), dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Import);