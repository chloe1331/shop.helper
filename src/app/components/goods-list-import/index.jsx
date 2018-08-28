import React, { Component } from 'react';
import { Button, Checkbox, Icon, Dropdown, Menu } from 'antd';
import cx from 'classnames';
import PropTypes from 'prop-types';

import Loading from '../loading';
import Empty from '../empty';
import DialogGoodsImport from '../dialog-goods-import';
import DialogGoodsUpload from '../dialog-goods-upload';
import DialogFissionUpload from '../dialog-fission-upload';

import './style.less';

const { shell } = require('electron');

export default class GoodsListImport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        };

        const handles = ['handleCreate'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    handUpload(e, ids) {
        const { user } = this.props;

        DialogGoodsUpload.open({
            user,
            ids
        });
    }

    handleCreate() {
        const { user, onGetList } = this.props;
        DialogGoodsImport.open({
            user,
            onSuccess: onGetList
        });
    }

    handleDelete(id) {
        const { onGetList, current, onChangeCurrent } = this.props;
        MServer.delete(`/goods/${id}.json`).then(() => {
            onGetList((list) => {
                if (current._id === id) onChangeCurrent(list.length ? list[0] : null);
            });
        });
    }

    handleFissionUpload(item) {
        const { user } = this.props;
        DialogFissionUpload.open({
            goods: item,
            user
        });
    }

    render() {
        const { loading, list, current, onChangeCurrent } = this.props;

        return (
            <div className="goods-list-import">
                <div className="goods-list-import-hd">
                    <Button icon="plus" type="primary" onClick={this.handleCreate}>添加商品</Button>
                </div>
                <div className="goods-list-import-bd">
                    {/* <div className="search-box">
                        <Input.Search
                            enterButton
                        />
                    </div> */}
                    <Loading.Content loading={loading} text="正在加载商品列表...">
                        {
                            list.length ? (
                                <ul key="list" className="goods-list">
                                    {
                                        list.map(item => (
                                            <li
                                                key={item._id}
                                                className={cx({
                                                    active: current && current._id == item._id
                                                })}
                                            >
                                                <div onClick={() => onChangeCurrent(item)}>
                                                    <Checkbox onClick={(e) => {
                                                        e.stopPropagation();
                                                    }} />
                                                    <img alt="主图" src={item.images[0]} />
                                                    <div className="info">
                                                        <span className="title">{item.title}</span>
                                                        <span className="sub text-price">¥ {item.priceText}</span>
                                                        <div className="btns">
                                                            {/* <Tooltip title="点击上传">
                                                                <a
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        this.handUpload(e, [item._id]);
                                                                    }}
                                                                ><Icon type="upload-o" /></a>
                                                            </Tooltip>
                                                            <Popconfirm title="确定要删除这个商品吗？" onConfirm={() => this.handleDelete(item._id)} >
                                                                <a
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                    }}
                                                                ><Icon type="delete" /></a>
                                                            </Popconfirm>
                                                            <Tooltip
                                                                title="点击查看"
                                                                onClick={() => {
                                                                    shell.openExternal(`https://item.taobao.com/item.htm?id=${item.itemId}`);
                                                                }}
                                                            ><a><Icon type="eye-o" /></a></Tooltip>
                                                            <Tooltip
                                                                title="批量上传"
                                                            ><a><Icon type="upload" /></a></Tooltip> */}
                                                            <Dropdown
                                                                trigger={['click']}
                                                                overlay={(
                                                                    <Menu style={{ width: 120 }}>
                                                                        <Menu.Item key="upload">
                                                                            <a
                                                                                onClick={e => {
                                                                                    e.stopPropagation();
                                                                                    this.handUpload(e, [item._id]);
                                                                                }}
                                                                            >上传</a>
                                                                        </Menu.Item>
                                                                        <Menu.Item key="fission">
                                                                            <a
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    this.handleFissionUpload(item);
                                                                                }}
                                                                            >批量上传</a>
                                                                        </Menu.Item>
                                                                        <Menu.Item key="delete">
                                                                            <a
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    this.handleDelete(item._id);
                                                                                }}
                                                                            >删除</a>
                                                                        </Menu.Item>
                                                                        <Menu.Item key="preview">
                                                                            <a
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    shell.openExternal(`https://item.taobao.com/item.htm?id=${item.itemId}`);
                                                                                }}
                                                                            >预览</a>
                                                                        </Menu.Item>
                                                                    </Menu>
                                                                )}
                                                            >
                                                                <a
                                                                    onClick={e => {
                                                                        e.stopPropagation();
                                                                        e.preventDefault();
                                                                    }}
                                                                >操作 <Icon type="down" /></a>
                                                            </Dropdown>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    }
                                </ul>
                            ) : (
                                <Empty icon="goods" text={<span>商品列表为空，先去 <a onClick={this.handleCreate}>添加</a> 吧</span>} />
                            )
                        }
                    </Loading.Content>
                </div>
            </div>
        );
    }
}

GoodsListImport.propTypes = {
    loading: PropTypes.bool,
    list: PropTypes.array,
    user: PropTypes.object,
    current: PropTypes.object,
    onGetList: PropTypes.func,
    onChangeCurrent: PropTypes.func
};