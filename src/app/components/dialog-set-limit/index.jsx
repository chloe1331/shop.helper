import React, { Component } from 'react';
import { Tag, Icon, Input, Tooltip, message } from 'antd';
import PropTypes from 'prop-types';

import Dialog from '../dialog';

// import './style.less';

class DialogShopLogin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tags: [],
            visible: true,
            inputVisible: false,
            inputValue: null
        };

        const handles = ['showInput', 'handleInputChange', 'handleInputConfirm'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    componentDidMount() {
        this.getList();
    }

    showInput() {
        this.setState({ inputVisible: true }, () => this.input.focus());
    }

    getList() {
        MServer.get('/limit/list.json').then(res => {
            this.setState({
                tags: res.data || []
            });
        });
    }

    handleInputChange(e) {
        this.setState({ inputValue: e.target.value });
    }

    handleInputConfirm() {
        const { tags, inputValue } = this.state;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            MServer.post('/limit/save.json', {
                name: inputValue
            }).then(res => {
                tags.push(res.data);
                this.setState({
                    tags,
                    inputVisible: false,
                    inputValue: '',
                });
            }).catch(e => message.error(e.message));
        }
    }

    handleClose(id, index) {
        const { tags } = this.state;
        MServer.delete(`/limit/${id}.json`).then(() => {
            tags.splice(index, 1);
            this.setState({
                tags
            });
        }).catch(e => message.error(e.message));
    }

    render() {
        const { afterClose, getContainer } = this.props;
        const { visible, inputVisible, inputValue, tags } = this.state;

        return (
            <Dialog
                title="设置极限词"
                footer={false}
                width={500}
                afterClose={afterClose}
                getContainer={getContainer}
                visible={visible}
                onCancel={() => this.setState({ visible: false })}
                className="dialog-set-limit"
            >
                {tags.map((tag, index) => {
                    const isLongTag = tag.name.length > 20;
                    const tagElem = (
                        <Tag key={tag._id} closable afterClose={() => this.handleClose(tag._id, index)}>
                            {isLongTag ? `${tag.name.slice(0, 20)}...` : tag.name}
                        </Tag>
                    );
                    return isLongTag ? <Tooltip title={tag.name} key={tag._id}>{tagElem}</Tooltip> : tagElem;
                })}
                {inputVisible && (
                    <Input
                        ref={e => this.input = e}
                        type="text"
                        size="small"
                        style={{ width: 78 }}
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                    />
                )}
                {!inputVisible && (
                    <Tag
                        onClick={this.showInput}
                        style={{ background: '#fff', borderStyle: 'dashed' }}
                    >
                        <Icon type="plus" /> 添加极限词
                    </Tag>
                )}
            </Dialog>
        );
    }
}

DialogShopLogin.propTypes = {
    onSuccess: PropTypes.func,
    afterClose: PropTypes.func,
    getContainer: PropTypes.func,
};

module.exports = {
    open: (props) => {
        Dialog.OpenDialog({}, <DialogShopLogin {...props} />);
    }
};