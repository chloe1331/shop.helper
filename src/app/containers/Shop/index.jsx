import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter} from 'react-router-dom';
import { Button, message, Popconfirm } from 'antd';
import PropTypes from 'prop-types';

import { Layout, Loading, Avatar, Empty, DialogShopLogin } from '~/app/components';
import Create from './Create';
import Detail from './Detail';
import * as ShopActions from '~/app/actions/shop';

import './style.less';

class Shop extends Component {
    constructor(props) {
        super(props);

        this.state = {
            list: [],
            loading: true
        };

        const handles = ['handleCreate'];
        handles.forEach(item => {
            this[item] = this[item].bind(this);
        });
    }

    componentDidMount() {
        this.getList();
    }

    getList() {
        const { loading } = this.state;

        if (!loading) this.setState({ loading: true });
        
        MServer.get('/account/list.json').then(res => {
            this.setState({
                list: res.data,
                loading: false
            });
        }).catch(e => message.error(e.message));
    }

    handleCreate() {
        const { history } = this.props;

        history.push('/shop/create');
    }

    handleEnterShop(data) {
        const { history, actions } = this.props;

        actions.setCurrent(data);
        history.push(`/shop/detail/import?id=${data._id}`);
    }

    handleLogin(data) {
        const { history } = this.props;

        DialogShopLogin.open({
            user: data,
            history,
            onSuccess: () => {
                message.success('登录成功');
                this.getList();
            }
        });
    }

    handleDelete(id) {
        MServer.delete(`/account/${id}.json`).then(() => {
            this.getList();
        });
    }

    render() {
        const { list, loading } = this.state;

        return (
            <Layout.Page>
                <Layout.Header>
                    <Button icon="plus" type="primary" onClick={this.handleCreate}>添加店铺</Button>
                </Layout.Header>
                <Layout.Content>
                    <Loading.Content loading={loading} text="正在加载店铺列表...">
                        {
                            list.length ? (
                                <ul className="account-list">
                                    {
                                        list.map(item => (
                                            <li key={item._id}>
                                                <Avatar.Account
                                                    headImg={item.avatar}
                                                    title={item.shopName}
                                                    sub={[
                                                        <p key="score">信用等级：{item.score}</p>,
                                                        <p key="type">店铺类型：{item.type == 1 ? '淘宝C店' : '天猫'}</p>,
                                                        <p key="btns"><Popconfirm title="确认要删除这个店铺吗？" onConfirm={() => this.handleDelete(item._id)}><a>删除店铺</a></Popconfirm></p>
                                                    ]}
                                                />
                                                <div className="right">
                                                    <Button type="primary" size="small" onClick={() => this.handleEnterShop(item)}>进入店铺</Button>
                                                    <Button size="small" onClick={() => this.handleLogin(item)}>登录</Button>
                                                </div>
                                            </li>
                                        ))
                                    }
                                </ul>
                            ) : (
                                <Empty icon="shop" text={<span>店铺列表为空，请先 <a onClick={this.handleCreate}>添加</a> 店铺</span>} />
                            )
                        }
                    </Loading.Content>
                </Layout.Content>
            </Layout.Page>
        );
    }
}

Shop.propTypes = {
    history: PropTypes.object,
    actions: PropTypes.object
};

Shop.Create = Create;
Shop.Detail = Detail;

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Object.assign(
            ShopActions
        ), dispatch)
    };
}

export default withRouter(connect(null, mapDispatchToProps)(Shop));