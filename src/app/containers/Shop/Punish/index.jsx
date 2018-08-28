import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Collapse, Table, message } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import cx from 'classnames';

import { Avatar, Loading } from '~/app/components';
import './style.less';

const { ipcRenderer } = require('electron');

class Punish extends Component {
    constructor(props) {
        super(props);

        const handles = ['handleCheck', 'handleClear', 'handleDelete'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });

        this.state = {
            result: [],
            task: [],
            check: false,
            deleteList: [],
            loading: true
        };

        ipcRenderer.on('punish:check', (event, res) => {
            if (res.uid === props.shop.current._id) {
                const { result } = this.state;
                result.push(res);
                this.setState({ result });
            }
        });
    }

    componentDidMount() {
        this.getData();
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners('punish:check');
    }

    getData() {
        const { shop } = this.props;
        MServer.get('/punish/list.json', {
            uid: shop.current._id
        }).then(res => {
            this.setState({
                loading: false
            });
            if (res.data) this.setState({ result: res.data });
        }).catch(e => message.error(e.message));
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
                title: item.title,
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

    handleCheck() {
        const { shop } = this.props;

        this.setState({ check: true });
        MServer.post('/punish/check.json', {
            uid: shop.current._id
        }).then(() => {
            this.setState({ check: false });
        }).catch(e => message.error(e.message));
    }

    handleClear() {
        const { shop } = this.props;
        MServer.delete('/punish/clear.json', {
            uid: shop.current._id
        }).then(() => {
            this.setState({ result: [] });
        }).catch(e => message.error(e.message));
    }

    handleOpenWindow(url) {
        const { shop } = this.props;
        ipcRenderer.send('OPENNEWWINDOW', {
            url,
            user: shop.current
        });
    }

    handleDelete(id) {
        const { shop } = this.props;
        return MServer.delete('/goods/deleteTaobao.json', {
            uid: shop.current._id,
            ids: id
        });
    }

    handleAddDelete(item) {
        const { task } = this.state;
        const getTitle = (type, item) => {
            switch (type)
            {
            case 1: return item.title;
            case 2: return item.entityTitle;
            }
        };
        const getId = (type, item) => {
            switch (type) {
            case 1: return item.auctionId;
            case 2: return item.entityId;
            }
        };
        item.res.list.forEach(it => {
            task.push({
                type: item.name,
                title: getTitle(item.type, it),
                id: getId(item.type, it)
            });
        });

        this.setState({
            task
        }, () => {
            message.success('成功加入任务列表');
            this.startDelete();
        });

        // example
        // this.setState({
        //     task: [{
        //         type: '1',
        //         title: '中型可爱泰迪狗窝宠物博美冬天用品床狗屋蒙古包小狗窝比熊猫咪',
        //         id: 575459264175
        //     }, {
        //         type: '2',
        //         title: 'DAZZLE地素 18春专柜新款 满身提花图案针织衫毛衣2F1E4181S',
        //         id: 575458968432
        //     }, {
        //         type: 3,
        //         title: '冬季少女加厚浴巾睡袍中大童男女珊瑚绒可穿可爱秋季浴袍加长款',
        //         id: 575616937067
        //     }]
        // }, () => {
        //     message.success('成功加入任务列表');
        //     this.startDelete();
        // });
    }

    render() {
        const { check, result, loading, task, deleteList } = this.state;

        const columnsMap = {
            1: [
                {
                    key: 'name',
                    title: '商品',
                    dataIndex: 'title',
                    width: 250,
                    render: (text, record) => <Avatar.Goods title={text} headImg={record.picUrl} sub={`id: ${record.auctionId}`} />
                },
                {
                    key: 'reason',
                    title: '原因',
                    dataIndex: 'reason'
                },
                {
                    key: 'setting',
                    title: '操作',
                    dataIndex: 'opts',
                    render: (opts) => (
                        <div>
                            {
                                opts.filter(item => item.type == 1).map((item, index) => (
                                    <Button
                                        size="small"
                                        key={index}
                                        onClick={() => this.handleOpenWindow(item.url)}
                                    >{item.name}</Button>
                                ))
                            }
                        </div>
                    )
                }
            ],
            2: [
                {
                    key: 'name',
                    title: '违规对象',
                    dataIndex: 'entityTitle',
                    render: (text, record) => <Avatar.Goods title={text} headImg={record.picUrl} sub={`id: ${record.entityId}`} />,
                    width: 250
                },
                {
                    key: 'type',
                    title: '违规类型',
                    dataIndex: 'pointRangeStr'
                },
                {
                    key: 'method',
                    title: '处置方式',
                    dataIndex: 'punishModeStr'
                },
                {
                    key: 'ruleCodeName',
                    title: '违规案例',
                    dataIndex: 'ruleCodeName'
                },
                {
                    key: 'reason',
                    title: '违规原因',
                    dataIndex: 'reason',
                    // width: 200
                }
            ]
        };

        if (loading) {
            return (
                <Loading.Content loading={true} />
            );
        }

        if (result && result.length) {
            return (
                <div className="content-collapse">
                    <div className="box">
                        <Collapse bordered={false}>
                            {
                                result.map((item, index) => (
                                    <Collapse.Panel
                                        header={(
                                            <p
                                                className={cx({
                                                    'text-error': item.res.total
                                                })}
                                            >{item.name} ( <a>{item.res.total}</a> ) {item.res.list.length ? <a className="right" onClick={e => {e.preventDefault();e.stopPropagation();this.handleAddDelete(item);}}>删除</a> : null}</p>
                                        )}
                                        key={index}
                                        disabled={!item.res.total}
                                    >
                                        {
                                            item.res.list.length ? (
                                                <Table
                                                    columns={columnsMap[item.type]}
                                                    dataSource={item.res.list.map((item, key) => {
                                                        item.key = key;
                                                        return item;
                                                    })}
                                                    pagination={false}
                                                />
                                            ) : null
                                        }
                                    </Collapse.Panel>
                                ))
                            }
                        </Collapse>
                        <div className="log">
                            <div className="title">任务列表<a className="right" onClick={() => this.setState({ task: [] })}>中断</a></div>
                            <div className="body">
                                {
                                    task.map((item, index) => (
                                        <p key={index}>{item.type}：<a>{item.title}</a></p>
                                    ))
                                }
                                {
                                    task.length == 0 ? <p className="text-secondary">暂未添加删除任务</p> : null
                                }
                            </div>
                            <div className="title">删除记录</div>
                            <div className="body">
                                {
                                    deleteList.map((item, index) => (
                                        <p key={index}>{item.status == 0 ? <span className="text-warn">正在删除</span> : item.status == 40 ? <span className="text-error">请求超时</span> : <span className="text-success">已删除</span>}：{item.title}</p>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                    <div className="footer">
                        <Button
                            type="primary"
                            onClick={this.handleClear}
                        >重新检测</Button>
                        {result.length ? (
                            <span className="text-secondary">检测时间：{moment(result[result.length - 1].created_at).format('YYYY-MM-DD HH:mm:ss')}</span>
                        ) : null}
                    </div>
                </div>
            );
        }

        return (
            <div className="intro-content">
                <p className="title">违规检查</p>
                <p className="sub">检查店铺的待优化、违规待处理和管控待处理商品</p>
                <Button type="primary" size="large" onClick={this.handleCheck} loading={check}>{check ? '开始检测...' : '开始检测'}</Button>
            </div>
        );
    }
}

Punish.propTypes = {
    shop: PropTypes.object
};

function mapStateToProps(state) {
    return {
        shop: state.shop
    };
}

export default connect(mapStateToProps)(Punish);