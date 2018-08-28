import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Select, message, TreeSelect, Button, Table, Tooltip } from 'antd';
import PropTypes from 'prop-types';

import { Avatar, Loading } from '~/app/components';

import './style.less';

const { shell } = require('electron');

class Zombie extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cateList: [],
            // cate: undefined,
            list: [],
            loading: false,
            loadingCate: false,
            condition: {
                dateType: 'recent1'
            },
            pager: {
                current: 1,
                pageSize: 10,
                total: 0
            },
            task: [],
            deleteList: [],
            selectedRowKeys: []
        };

        const handles = ['getList', 'getCate', 'handleAddDeleteTask'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }
    componentDidMount() {
        this.getCate();
    }

    startDelete() {
        const { deleteList } = this.state;

        const hasDelete = deleteList.filter(item => item.status == 0);
        const start = () => {
            const { task, deleteList } = this.state;
            const item = task.shift();
            // 避免清空时报错
            if (!item) return;
            deleteList.unshift({
                id: item.id,
                status: 0
            });
            this.handleDelete(item.id).then(() => {
                deleteList[0].status = 20;
                this.setState({
                    deleteList
                }, () => {
                    if (task.length) start();
                });
            }).catch(() => {
                deleteList[0].status = 40;
                this.setState({
                    deleteList
                }, () => {
                    if (task.length) start();
                });
            });
            this.setState({
                task,
                deleteList
            });
        };

        if (!hasDelete.length) {
            start();
        }
    }

    getCate() {
        const { shop } = this.props;
        this.setState({ loadingCate: true });

        MServer.get('/goods/itemClassify.json', {
            uid: shop.current._id
        }).then(res => {
            this.setState({ loadingCate: false });
            if (res.data && res.data.cateClassify) {
                this.setState({
                    cateList: res.data.cateClassify.children.map(item => {
                        const data = {
                            key: item.cateId.toString(),
                            value: item.cateId.toString(),
                            title: item.cateName
                        };
                        if (item.children && item.children.length) {
                            data.children = item.children.map(it => ({
                                key: it.cateId.toString(),
                                value: it.cateId.toString(),
                                title: it.cateName
                            }));
                        }
                        return data;
                    })
                });
            }
        }).catch(e => {
            this.setState({ loadingCate: false });
            message.error(e.message);
        });
    }

    getList(page = 1) {
        const { shop } = this.props;
        const { loading, condition, pager } = this.state;
        if (!loading) this.setState({ loading: true });
        if (pager.current != page) this.setState({ pager: Object.assign(pager, {
            current: page
        })});

        const _condition = Object.assign({
            page,
            pageSize: pager.pageSize
        }, condition);
        MServer.get('/goods/itemsEffectDetail.json', {
            uid: shop.current._id,
            condition: JSON.stringify(_condition)
        }).then(res => {
            this.setState({
                list: res.data.data,
                pager: Object.assign(pager, {
                    total: res.data.recordCount
                }),
                loading: false
            });
        }).catch(e => {
            this.setState({ loading: false });
            message.error(e.message);
        });
    }

    handleChangeCondition(type, value) {
        const { condition } = this.state;

        if (value) {
            condition[type] = value;
        } else {
            delete condition[type];
        }
        this.setState({
            condition
        });
    }

    handleDelete(id) {
        const { shop } = this.props;
        return MServer.delete('/goods/deleteTaobao.json', {
            uid: shop.current._id,
            ids: id
        });
    }

    handleAddDeleteTask() {
        const { selectedRowKeys, task } = this.state;

        if (!selectedRowKeys.length) {
            message.error('请至少选择一个商品');
            return;
        }

        this.setState({
            task: task.concat(selectedRowKeys.map(item => ({
                id: item
            })))
        }, () => this.startDelete());
    }

    render() {
        const { cateList, condition, loading, list, pager, selectedRowKeys, deleteList, task, loadingCate } = this.state;
        const dateList = [
            {
                key: 'recent1',
                title: '最近1天'
            },
            {
                key: 'recent7',
                title: '最近7天'
            },
            {
                key: 'recent30',
                title: '最近30天'
            }
        ];
        const columns = [
            {
                key: 'itemId',
                dataIndex: 'itemId',
                title: '商品信息',
                render: (text, record) => (
                    <Avatar.Goods
                        title={(
                            <Tooltip title="点击查看详情"><a
                                onClick={() => {
                                    shell.openExternal(`https://item.taobao.com/item.htm?id=${text}`);
                                }}
                            >{record.itemModel.title}</a></Tooltip>
                        )}
                        headImg={/http[s]?/.test(record.itemModel.pictUrl) ? record.itemModel.pictUrl : `https:${record.itemModel.pictUrl}`}
                        sub={`商品id：${text}`}
                    />
                )
            },
            {
                key: 'uv',
                dataIndex: 'itemEffectIndex',
                title: '访客数',
                width: 60,
                align: 'center',
                render: (obj) => obj.itemUv
            },
            {
                key: 'pv',
                dataIndex: 'itemEffectIndex',
                title: '浏览量',
                width: 60,
                align: 'center',
                render: (obj) => obj.itemPv
            },
            {
                key: 'csale',
                dataIndex: 'itemEffectIndex',
                title: '销量',
                width: 60,
                align: 'center',
                render: (obj) => obj.payItemQty
            },
            {
                key: 'status',
                dataIndex: 'itemModel',
                title: '当前状态',
                width: 80,
                align: 'center',
                render: (obj) => obj.itemStatus == 1 ? '当前在线' : '已下架'
            },
            {
                key: 'publishTime',
                dataIndex: 'itemModel',
                title: '上架时间',
                width: 110,
                align: 'center',
                render: (obj) => obj.publishTime
            },
            {
                key: 'c_status',
                dataIndex: 'itemId',
                title: '操作状态',
                width: 80,
                align: 'center',
                render: (id) => {
                    const taskFilter = task.filter(item => item.id == id);
                    if (taskFilter.length) return <span className="text-secondary">等待删除</span>;
                    
                    const delteFilter = deleteList.filter(item => item.id == id);
                    if (delteFilter.length) {
                        switch (delteFilter[0].status)
                        {
                        case 0: 
                            return <span className="text-warn">正在删除</span>;
                        case 20:
                            return <span className="text-success">删除成功</span>;
                        case 40:
                            return <span className="text-error">删除失败</span>;
                        }
                    }

                    return '-';
                }
            }
        ];

        const rowSelection = {
            onChange: (selectedRowKeys) => {
                this.setState({
                    selectedRowKeys
                });
            },
            getCheckboxProps: record => ({
                disabled: task.map(item => item.id).concat(deleteList.filter(item => item.status == 0).map(item => item.id)).includes(record.itemId)
            }),
            selectedRowKeys
        };

        return (
            <div className="zombie-content">
                <div className="zombie-content-hd">
                    <Select
                        style={{ width: 140 }}
                        defaultValue={dateList[0].key}
                        value={condition.dateType}
                        onChange={value => this.handleChangeCondition('dateType', value)}
                    >
                        {
                            dateList.map(item => (
                                <Select.Option key={item.key}>{item.title}</Select.Option>
                            ))
                        }
                    </Select>
                    <TreeSelect
                        style={{ width: 200 }}
                        value={condition.cateId}
                        dropdownStyle={{ maxHeight: 280, overflow: 'auto' }}
                        treeData={cateList}
                        placeholder="默认全部分类"
                        treeDefaultExpandAll
                        allowClear
                        onChange={value => this.handleChangeCondition('cateId', value)}
                    />
                    <Button onClick={() => this.getList()} loading={loading}>加载列表</Button>
                    <Button onClick={() => this.getCate()} loading={loadingCate}>刷新分类</Button>
                    <Button onClick={this.handleAddDeleteTask}>删除勾选</Button>
                    <Button onClick={() => this.setState({ task: [] })}>停止</Button>
                </div>
                <div className="zombie-content-bd">
                    <Loading.Content loading={loading}>
                        <Table
                            rowKey="itemId"
                            rowSelection={rowSelection}
                            selectedRowKeys={selectedRowKeys}
                            columns={columns}
                            dataSource={list}
                            pagination={Object.assign({
                                onChange: page => this.getList(page)
                            }, pager)}
                        />
                    </Loading.Content>
                </div>
            </div>
        );
    }
}

Zombie.propTypes = {
    shop: PropTypes.object
};

function mapStateToProps(state) {
    return {
        shop: state.shop
    };
}

export default connect(mapStateToProps)(Zombie);