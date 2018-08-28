import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message } from 'antd';
import PropTypes from 'prop-types';

import { DialogShopLogin } from '~/app/components';
import Login from './containers/Login';
import Home from './containers/Home';
import * as ShopActions from '~/app/actions/shop';

const { ipcRenderer } = require('electron');

class App extends Component {
    constructor(props) {
        super(props);
        ipcRenderer.send('api:ipc');

        ipcRenderer.on('will:login', (ev, args) => {
            if (args.user) {
                console.log('user:::', args.user);
                DialogShopLogin.open({
                    user: args.user,
                    history: props.history,
                    onSuccess: (data) => {
                        console.log(data);
                        if (data) props.actions.setCurrent(data);
                        message.success('登录成功，请重试操作');
                    }
                });
            }
        });
    }

    componentDidMount() {
        const { history } = this.props;
        // history.push('/shop');
    }

    componentWillUnmount() {
        ipcRenderer.removeAllListeners('will:login');
    }

    render() {
        return (
            <Switch>
                <Route exact path="/login" component={Login} />
                <Route component={Home} />
            </Switch>
        );
    }
}

App.propTypes = {
    history: PropTypes.object,
    actions: PropTypes.object
};

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(Object.assign(
            ShopActions
        ), dispatch)
    };
}

export default withRouter(connect(null, mapDispatchToProps)(App));