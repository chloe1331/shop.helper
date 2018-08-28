import React, { Component } from 'react';
import { connect } from 'react-redux';
import { message, Input, Button, Icon, Table, Select } from 'antd';
import PropTypes from 'prop-types';

import { Loading, DialogCreateTitle, DialogSetLimit } from '~/app/components';

import './style.less';

class Lexicon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            init: false,
            config: null,
            second: null,
            sid: null,
            detail: null
        };
        const handles = ['initCate', 'handleCreateTitle', 'handleSetLimit'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    componentDidMount() {
        this.getCate();
    }

    getDetail() {
        const { shop } = this.props;
        const { sid } = this.state;

        MServer.get('/lexicon/detail.json', {
            uid: shop.current._id,
            sid
        }).then(res => {
            if (res.data && typeof res.data.titles === 'object') {
                res.data.titles = Object.keys(res.data.titles).map(item => res.data.titles[item]);
            }
            this.setState({
                detail: res.data
            });
        });
    }

    getCate() {
        MServer.get('/cate/config.json').then(res => {
            this.setState({ loading: false });
            if (res.error) {
                this.initCate();
            } else {
                this.setState({
                    config: res
                });
            }
        }).catch(e => message.error(e.message));
    }

    initCate() {
        const { shop } = this.props;
        if (shop.current) {
            this.setState({ init: true });
            MServer.post('/cate/init.json', {
                uid: shop.current._id
            }).then(res => {
                this.setState({
                    init: false,
                    config: res
                });
            }).catch(e => message.error(e.message));
        }
    }

    handleCreateTitle() {
        const { shop } = this.props;
        const { detail } = this.state;
        DialogCreateTitle.open({
            user: shop.current,
            sid: this.state.sid,
            main: detail && detail.main,
            sub: detail && detail.sub,
            onSuccess: () => {
                this.getDetail();
            }
        });
    }

    handleSetLimit() {
        DialogSetLimit.open();
    }

    handleSaveTitles() {
        const { detail }= this.state;

        MServer.post('/lexicon/saveTitles.json', {
            id: detail._id,
            titles: detail.titles
        }).catch(e => message.error(e.message));
    }

    render() {
        const { loading, init, config, second, sid, detail } = this.state;

        return (
            <Loading.Content loading={loading || init} text={init ? '正在初始化分类...' : '正在加载分类...'}>
                <div className="lexicon-content">
                    <div className="lexicon-content-hd">
                        <Button type="primary" onClick={this.initCate}>重新获取</Button>
                        <Button onClick={this.handleSetLimit}>设置极限词</Button>
                    </div>
                    {
                        config ? (
                            <div className="lexicon-content-bd">
                                <Select
                                    showSearch={true}
                                    placeholder="选择一级类目"
                                    filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                >
                                    {
                                        config.map(first => (
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
                                {
                                    second ? (
                                        <Select
                                            showSearch={true}
                                            placeholder="选择二级类目"
                                            onChange={(value) => {
                                                this.setState({ sid: value }, () => this.getDetail());
                                            }}
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
                                    ) : null
                                }
                                {
                                    sid ? <Button onClick={this.handleCreateTitle}>组合标题</Button> : null
                                }
                                {
                                    sid ? (
                                        <Table
                                            columns={[
                                                {
                                                    key: 'number',
                                                    dataIndex: 'number',
                                                    width: 60
                                                },
                                                {
                                                    key: 'title',
                                                    dataIndex: 'title',
                                                    title: '标题',
                                                    render: (text, record, index) => (
                                                        <Input
                                                            value={text}
                                                            onChange={e => {
                                                                const titles = detail.titles;
                                                                titles[index] = e.target.value;
                                                                detail.titles = titles;
                                                                this.setState({ detail }, () => this.handleSaveTitles());
                                                            }}
                                                        />
                                                    )
                                                },
                                                {
                                                    key: 'word',
                                                    dataIndex: 'word',
                                                    title: '字数',
                                                    width: 80
                                                }
                                            ]}
                                            pagination={false}
                                            dataSource={detail && detail.titles.map((item, index) => ({
                                                key: index,
                                                number: index + 1,
                                                title: item,
                                                word: item ? parseInt(item.replace(/[^\\u0000-\\u00ff]/g, 'aa').length / 2) : '-'
                                            })) || []}
                                        />
                                    ) : (
                                        <div className="cate-body empty-content">
                                            <Icon type="lexicon" />
                                            <span>请先选择分类</span>
                                        </div>
                                    )
                                }
                            </div>
                        ) : null
                    }
                </div>
            </Loading.Content>
        );
    }
}

Lexicon.propTypes = {
    shop: PropTypes.object
};

function mapStateToProps(state) {
    return {
        shop: state.shop
    };
}

export default connect(mapStateToProps)(Lexicon);