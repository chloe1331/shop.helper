import React, { Component } from 'react';
import { message } from 'antd';
import PropTypes from 'prop-types';

import Loading from '../loading';
import Listener from './listener';
import { taobao } from '-/config';

export default class CreateShop extends Component {
    constructor(props) {
        super(props);

        this.homeUrl = `${taobao.url.login}?redirectURL=${taobao.url.shop}`;
        this.state = {
            loading: true
        };

        this.userInfo = props.user || {};
    }

    componentDidMount() {
        const { history, onSuccess } = this.props;

        this.webview.addEventListener('did-start-loading', () => {
            if (!this.state.loading) this.setState({ loading: true });
        });

        this.webview.addEventListener('did-stop-loading', () => {
            this.setState({ loading: false });
            if (this.webview.src == this.homeUrl) {
                this.webview.insertCSS('body{overflow:hidden;}.content-layout,#header .logo,.footer{max-width:100vw;}' +
                    '#header,.login-newbg,.footer,.login-adlink{display:none!important;}' +
                    '.login-box-warp{top: calc(50% - 175px);left:calc(50% - 175px);}'
                );

                this.webview.executeJavaScript(`(${String(Listener)})()`);
                this.webview.addEventListener('ipc-message', (event) => {
                    Object.assign(this.userInfo, event.channel);
                });

                this.webview.send('listen', this.userInfo);
            }
        });

        this.webview.addEventListener('did-get-response-details', (event) => {
            if (event.newURL == taobao.url.shop) {
                const session = this.webview.getWebContents().session;
                session.cookies.get({
                    domain: taobao.domain.main
                }, (error, cookies) => {
                    MServer.post('/account/save.json', {
                        cookies,
                        userInfo: {
                            username: this.userInfo.username,
                            password: this.userInfo.password,
                            login: true
                        }
                    }).then((res) => {
                        if (onSuccess) {
                            onSuccess(res.data);
                        } else {
                            history.push('/shop');
                        }
                    }).catch(e => message.error(e.message));
                });
            }
        });

        this.webview.addEventListener('console-message', e => {
            console.warn('webview: ' + e.message);
        });
    }

    onChangeUserInfo(data) {
        this.setState({
            userInfo: JSON.parse(data)
        });
    }

    render() {
        const { loading } = this.state;

        return (
            <Loading.Content loading={loading} text="" hidden={true}>
                <webview
                    src={this.homeUrl}
                    ref={(e) => this.webview = e}
                    preload="./assets/js/listener.js"
                ></webview>
            </Loading.Content>
        );
    }
}

CreateShop.propTypes = {
    history: PropTypes.object,
    user: PropTypes.object,
    onSuccess: PropTypes.func
};