import React, { Component } from 'react';
import { Drawer, Icon, Button, message } from 'antd';
import PropTypes from 'prop-types';

import Loading from '../loading';
import Empty from '../empty';
import Avatar from '../avatar';
import DialogTaskSetting from '../dialog-task-setting';

import './style.less';

const { ipcRenderer, shell } = require('electron');

export default class RightTask extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            list: []
        };

        ipcRenderer.on('reload:task', () => {
            this.getList();
        });
    }

    componentDidMount() {
        this.getList();
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners('reload:task');
    }

    getList() {
        // if (!this.state.loading) this.setState({ loading: true });
        MServer.get('/task/list.json', {
            type: 'goods'
        }).then(res => {
            this.setState({
                loading: false,
                list: res.data
            });
        }).catch(e => message.error(e.message));
    }

    getStatusDom(item) {
        if (item.status == 0) return <div className="text-footer"><p className="text-secondary">等待上传</p></div>;
        if (item.status == 10) return <div className="text-footer"><p className="text-info"><Icon type="loading" /> 上传中...</p></div>;
        if (item.status == 20) {
            return (
                <div className="text-footer"><p className="text-success">
                    <Icon type="check-circle" /> 上传成功
                    <a
                        className="right"
                        onClick={() => {
                            const _data = JSON.parse(item.success);
                            shell.openExternal(`https://item.taobao.com/item.htm?id=${_data.success.itemId}`);
                        }}
                    >点击查看</a>
                </p></div>
            );
        }
        if ([40, 41].includes(item.status)) {
            return (
                <div className="text-footer">
                    <p className="text-error"><Icon type="close-circle" /> {item.error}</p>
                    <a className="right" onClick={() => this.handleResetTask(item._id)}>重试</a>
                </div>
            );
        }
    }

    handleStartTask() {
        ipcRenderer.send('task:start');
    }

    handleResetTask(id) {
        const params = {};
        if (id) {
            params.id = id;
        } else {
            params.type = 'stop';
        }
        MServer.post('/task/reset.json', params).catch(e => message.error(e.message));
    }

    handleDelete(id) {
        MServer.delete(`/task/${id}.json`).then(() => {
            this.getList();
        }).catch(e => message.error(e.message));
    }

    render() {
        const { visible, onTrigger } = this.props;
        const { loading, list } = this.state;

        return (
            <Drawer
                className="right-task"
                visible={visible}
                placement="right"
                width={320}
                closable={false}
                onClose={onTrigger}
            >
                <Loading.Content loading={loading} text="正在加载任务列表...">
                    {
                        list.length ? (
                            <ul key="list" className="task-list">
                                {
                                    list.map(item => (
                                        <li key={item._id}>
                                            <Avatar.Goods
                                                title={item.data.title}
                                                headImg={item.data.images[0]}
                                                sub={<p>{item.shopName}<a onClick={() => this.handleDelete(item._id)} style={{ float: 'right' }}><Icon type="delete" /></a></p>}
                                            />
                                            {this.getStatusDom(item)}
                                        </li>
                                    ))
                                }
                            </ul>
                        ) : (
                            <Empty icon="task" text={<span>任务列表为空，先去添加吧</span>} />
                        )
                    }
                </Loading.Content>
                <div className="footer">
                    <Button size="small" type="primary" onClick={this.handleStartTask}>手动启动</Button>
                    <Button size="small" onClick={() => this.handleResetTask()}>重试中断</Button>
                    <a
                        className="right"
                        onClick={() => {
                            onTrigger();
                            DialogTaskSetting.open();
                        }}
                    >设置</a>
                </div>
            </Drawer>
        );
    }
}

RightTask.propTypes = {
    visible: PropTypes.bool,
    onTrigger: PropTypes.func
};