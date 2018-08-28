import React, { Component } from 'react';
import { Menu, Layout, Checkbox, Button, message } from 'antd';
import PropTypes from 'prop-types';

import Dialog from '../dialog';

// import './style.less';

class DialogSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            clear: ['cache']
        };

        const handles = ['handleClearCache'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    handleClearCache() {
        const { clear } = this.state;
        
        MServer.post('/app/clear.json', {
            data: clear
        }).then(() => {
            message.success('清除成功，请重启软件');
        });
    }

    render() {
        const { afterClose, getContainer } = this.props;
        const { visible, clear } = this.state;
        const menu = [
            {
                key: 'clear',
                title: '清除缓存'
            }
        ];

        const otherOpt = [
            {
                label: '清除app缓存',
                value: 'cache'
            },
            {
                label: '清除图片缓存',
                value: 'image'
            },
            {
                label: '清空店铺列表',
                value: 'account'
            },
            {
                label: '清空商品列表',
                value: 'goods'
            },
            {
                label: '清空任务列表',
                value: 'task'
            },
            {
                label: '清空词库列表',
                value: 'lexicon'
            },
            {
                label: '清空极限词列表',
                value: 'limit'
            },
            {
                label: '清空违规列表',
                value: 'punish'
            }
        ];

        return (
            <Dialog
                title="设置"
                footer={false}
                width={620}
                afterClose={afterClose}
                getContainer={getContainer}
                visible={visible}
                onCancel={() => this.setState({ visible: false })}
                className="dialog-setting"
            >
                <Layout>
                    <Layout.Sider
                        width={120}
                        theme="light"
                    >
                        <Menu
                            mode="inline"
                            defaultSelectedKeys={[menu[0].key]}
                        >
                            {
                                menu.map(item => (
                                    <Menu.Item key={item.key}>{item.title}</Menu.Item>
                                ))
                            }
                        </Menu>
                    </Layout.Sider>
                    <div
                        style={{ backgroundColor: '#fff', padding: '0 16px' }}
                    >
                        <Checkbox.Group value={clear} options={otherOpt} onChange={value => this.setState({ clear: value })} />
                        <Button
                            style={{ marginTop: '20px' }}
                            type="primary"
                            onClick={this.handleClearCache}
                        >清除</Button>
                    </div>
                </Layout>
            </Dialog>
        );
    }
}

DialogSetting.propTypes = {
    afterClose: PropTypes.func,
    getContainer: PropTypes.func,
};

module.exports = {
    open: (props) => {
        Dialog.OpenDialog({}, <DialogSetting {...props} />);
    }
};