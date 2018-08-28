import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { message } from 'antd'; 
import PropTypes from 'prop-types';

import { Layout, SecondLeftmenu, Loading } from '~/app/components';
import * as ShopActions from '~/app/actions/shop';
import Menu from './menu';
import { Url } from '~/public/utils';

import Import from '../Import';
import Lexicon from '../Lexicon';
import Zombie from '../Zombie';
import Punish from '../Punish';

class Detail extends Component {
    constructor(props) {
        super(props);

        if (!props.shop.current) {
            this.getData();
        }
    }

    getData() {
        const { location, actions, history } = this.props;
        const id = Url.getUrlParam(location.search, 'id');
        if (!id) {
            history.push('/shop');
            return;
        }
        
        MServer.get(`/account/${id}.json`).then(res => {
            if (res) {
                actions.setCurrent(res);
            } else {
                message.error('未查询到店铺信息');
                history.push('/shop');
            }
        }).catch(e => message.error(e.message));
    }

    render() {
        const { shop } = this.props;

        return (
            <Layout>
                <SecondLeftmenu menu={Menu} user={shop.current} backUrl="/shop" params={{ id: shop.current && shop.current._id }} />
                <Layout.Content>
                    <Loading.Content loading={!shop.current} text="正在加载店铺数据...">
                        <Switch>
                            <Route exact path="/shop/detail/import" component={Import} />
                            <Route exact path="/shop/detail/lexicon" component={Lexicon} />
                            <Route exact path="/shop/detail/zombie" component={Zombie} />
                            <Route exact path="/shop/detail/punish" component={Punish} />
                        </Switch>
                    </Loading.Content>
                </Layout.Content>
            </Layout>
        );
    }
}

Detail.propTypes = {
    shop: PropTypes.object,
    location: PropTypes.object,
    actions: PropTypes.object,
    history: PropTypes.object
};

function mapStateToProps(state) {
    return {
        shop: state.shop
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Object.assign(
            ShopActions
        ), dispatch)
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Detail));