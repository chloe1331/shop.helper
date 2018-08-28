import React, { Component } from 'react';
import { Icon, Form, Input, Checkbox, Button } from 'antd';

import './style.less';

export default class Login extends Component {
    render() {
        return (
            <div className="shop-login-content">
                <div className="shop-login-content-icon">
                    <Icon type="store" />
                    店铺助手
                </div>
                <div className="shop-login-content-form">
                    <Form>
                        <Input
                            prefix={<Icon type="user" />}
                            placeholder="账号"
                        />
                        <Input
                            prefix={<Icon type="lock" />}
                            placeholder="密码"
                            type="password"
                        />
                        <Checkbox>记住密码</Checkbox>

                        <Button>登录</Button>
                    </Form>
                </div>
            </div>
        );
    }
}