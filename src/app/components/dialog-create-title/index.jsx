import React, { Component } from 'react';
import { Input, Button, message } from 'antd';
import PropTypes from 'prop-types';

import Dialog from '../dialog';

import './style.less';

class DialogCreateTitle extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: true,
            sum: null,
            main: props.main || null,
            sub: props.sub || null,
            submit: false,
            brand: false,
            custom: null
        };

        const handles = ['handleSubmit', 'handleRemoveBrand', 'handleRemoveLimit', 'handleRemoveRepeat', 'handleRemoveCustom'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    handleRemoveBrand() {
        const { sid, user } = this.props;
        const { main, sub } = this.state;
        this.setState({ brand: true });

        MServer.get('/cate/next.json', {
            sid,
            uid: user._id
        }).then(res => {
            let list = [];
            let sum = 0;
            if (res[0] && res[0].data) {
                res[0].data.forEach(item => {
                    if (item.data) {
                        list = list.concat(item.data.map(it => it && it.name && it.name.replace(/(^\s*)|(\s*$)/g, '')));
                    }
                });
            }
            if (main) {
                let _main = main.split('\n').filter(item => item && item.replace(/(^\s*)|(\s*$)/g, ''));
                _main = _main.filter(item => {
                    if (list.includes(item)) sum++;
                    return !list.includes(item);
                });
                this.setState({
                    main: _main.join('\n')
                });
            }
            if (sub) {
                let _sub = sub.split('\n').filter(item => item && item.replace(/(^\s*)|(\s*$)/g, ''));
                _sub = _sub.filter(item => {
                    if (list.includes(item)) sum++;
                    return !list.includes(item);
                });
                this.setState({
                    sub: _sub.join('\n')
                });
            }
            message.success(`成功去除${sum}个品牌词`);
            this.setState({ brand: false });
        }).catch(e => {
            this.setState({ brand: false });
            message.error(e.message);
        });
    }

    handleRemoveLimit() {
        const { main, sub } = this.state;
        MServer.get('/limit/list.json').then(res => {
            const list = res.data.map(item => item.name);
            let sum = 0;
            if (main) {
                let _main = main.split('\n').filter(item => item && item.replace(/(^\s*)|(\s*$)/g, ''));
                _main = _main.filter(item => {
                    if (list.includes(item)) sum++;
                    return !list.includes(item);
                });
                this.setState({
                    main: _main.join('\n')
                });
            }
            if (sub) {
                let _sub = sub.split('\n').filter(item => item && item.replace(/(^\s*)|(\s*$)/g, ''));
                _sub = _sub.filter(item => {
                    if (list.includes(item)) sum++;
                    return !list.includes(item);
                });
                this.setState({
                    sub: _sub.join('\n')
                });
            }
            message.success(`成功去除${sum}个极限词`);
        });
    }

    handleRemoveRepeat() {
        const { main, sub } = this.state;
        let _main = [];
        let _sub = [];
        let sum = 0;
        if (main) {
            const __main = main.split('\n').filter(item => item && item.replace(/(^\s*)|(\s*$)/g, ''));
            __main.forEach(item => {
                if (!_main.includes(item)) {
                    _main.push(item);
                } else {
                    sum++;
                }
            });
            this.setState({
                main: _main.join('\n')
            });
        }
        if (sub) {
            const __sub = sub.split('\n').filter(item => item && item.replace(/(^\s*)|(\s*$)/g, ''));
            __sub.forEach(item => {
                if (!_main.includes(item) && !_sub.includes(item)) {
                    _sub.push(item);
                } else {
                    sum++;
                }
            });
            this.setState({
                sub: _sub.join('\n')
            });
        }

        message.success(`成功去除${sum}个重复词`);
    }

    handleSubmit() {
        const { sum, main, sub } = this.state;
        const { user, sid, onSuccess } = this.props;

        if (!sum) {
            message.error('请先输入组合数量');
            return;
        }
        if (!main) {
            message.error('请先输入主词根');
            return;
        }
        if (!sub) {
            message.error('请先输入副词根');
            return;
        }
        
        this.setState({ submit: true });
        MServer.post('/lexicon/save.json', {
            uid: user._id,
            sid,
            sum,
            main,
            sub
        }).then(() => {
            onSuccess && onSuccess();
            this.setState({ visible: false });
        }).catch(e => {
            this.setState({ submit: false });
            message.error(e.message);
        });
    }

    handleRemoveCustom() {
        const { custom, main, sub } = this.state;
        let sum = 0;

        let mainArr = main ? main.split('\n').filter(item => item && item.replace(/(^\s*)|(\s*$)/g, '')) : [];
        let subArr = sub ? sub.split('\n').filter(item => item && item.replace(/(^\s*)|(\s*$)/g, '')) : [];
        const customArr = custom ? custom.split('\n').filter(item => item && item.replace(/(^\s*)|(\s*$)/g, '')) : [];

        if (customArr.length) {
            mainArr = mainArr.filter(item => {
                const has = customArr.includes(item);
                if (has) sum++;
                return !has;
            });
            subArr = subArr.filter(item => {
                const has = customArr.includes(item);
                if (has) sum++;
                return !has;
            });
            this.setState({
                main: mainArr.join('\n'),
                sub: subArr.join('\n')
            });
        }

        message.success(`成功去除${sum}个自定义词`);
    }

    render() {
        const { afterClose, getContainer } = this.props;
        const { visible, submit, main, sub, brand, custom } = this.state;

        return (
            <Dialog
                title="组合标题"
                footer={[
                    <Button key="cancel" onClick={() => this.setState({ visible: false })}>取消</Button>,
                    <Button loading={submit} key="submit" type="primary" onClick={this.handleSubmit}>开始组词</Button>,
                ]}
                width={650}
                afterClose={afterClose}
                getContainer={getContainer}
                visible={visible}
                onCancel={() => this.setState({ visible: false })}
                className="dialog-create-title"
            >
                <div className="form-item">
                    组合数量：
                    <Input onChange={e => this.setState({ sum: e.target.value })} />
                    <Button onClick={this.handleRemoveCustom}>去除自定义词</Button>
                    <Button onClick={this.handleRemoveRepeat}>去重</Button>
                    <Button onClick={this.handleRemoveBrand} loading={brand}>去除品牌</Button>
                    <Button onClick={this.handleRemoveLimit}>去除极限词</Button>
                </div>
                <div className="textarea-content">
                    <div className="textarea-content-item">
                        主词根
                        <Input.TextArea value={main} autosize={{ minRows: 16, maxRows: 16 }} onChange={e => this.setState({ main: e.target.value })} />
                    </div>
                    <div className="textarea-content-item">
                        副词根
                        <Input.TextArea value={sub} autosize={{ minRows: 16, maxRows: 16 }} onChange={e => this.setState({ sub: e.target.value })} />
                    </div>
                    <div className="textarea-content-item">
                        自定义词
                        <Input.TextArea value={custom} autosize={{ minRows: 16, maxRows: 16 }} onChange={e => this.setState({ custom: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        );
    }
}

DialogCreateTitle.propTypes = {
    user: PropTypes.object,
    onSuccess: PropTypes.func,
    afterClose: PropTypes.func,
    getContainer: PropTypes.func,
    sid: PropTypes.string,
    main: PropTypes.string,
    sub: PropTypes.string
};

module.exports = {
    open: (props) => {
        Dialog.OpenDialog({}, <DialogCreateTitle {...props} />);
    }
};