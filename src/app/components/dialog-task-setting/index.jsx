import React, { Component } from 'react';
import { Form, Input, Button, message } from 'antd';
import PropTypes from 'prop-types';

import Dialog from '../dialog';

import './style.less';

class DialogTaskSetting extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            config: null
        };

        const handles = ['handleSubmit'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        MServer.get('/app/config.json').then(res => {
            this.setState({
                config: res
            });
        });
    }

    handleSubmit(e) {
        e.preventDefault();

        const { form } = this.props;
        const { validateFieldsAndScroll } = form;
        validateFieldsAndScroll((err, values) => {
            if (!err) {
                MServer.post('/app/taskSetting.json', values).then(() => {
                    message.success('设置成功');
                }).catch(e => message.error(e.messge));
            }
        });
    }

    render() {
        const { afterClose, getContainer, form } = this.props;
        const { visible, config } = this.state;
        const { getFieldDecorator } = form;

        return (
            <Dialog
                title="任务设置"
                width={500}
                afterClose={afterClose}
                getContainer={getContainer}
                visible={visible}
                onOk={this.handleSubmit}
                onCancel={() => this.setState({ visible: false })}
                className="dialog-task-setting"
            >
                <Form onSubmit={this.handleSubmit}>
                    {/* <Form.Item
                        label="单张图片时间间隔"
                        extra="时间单位毫秒，1000毫秒=1秒"
                    >
                        {getFieldDecorator('imageInterval', {
                            initialValue: config && config.imageInterval
                        })(
                            <Input style={{ width: 80 }} />
                        )}
                    </Form.Item> */}
                    <Form.Item
                        label="单个任务时间间隔"
                        extra="时间单位毫秒，1000毫秒=1秒"
                    >
                        {getFieldDecorator('taskInterval', {
                            initialValue: config && config.taskInterval
                        })(
                            <Input style={{ width: 80 }} />
                        )}
                    </Form.Item>
                    <Form.Item key="submit" style={{ display: 'none' }}>
                        <Button type="primary" htmlType="submit">确认</Button>
                    </Form.Item>
                </Form>
            </Dialog>
        );
    }
}

DialogTaskSetting.propTypes = {
    form: PropTypes.object,
    afterClose: PropTypes.func,
    getContainer: PropTypes.func
};

const _DialogTaskSetting = Form.create()(DialogTaskSetting);

module.exports = {
    open: (props) => {
        Dialog.OpenDialog({}, <_DialogTaskSetting {...props} />);
    }
};