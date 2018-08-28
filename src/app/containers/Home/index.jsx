import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Header, RightTask } from '~/app/components';
import Shop from '../Shop';
import Main from '../Main';

const { ipcRenderer } = require('electron');

export default class Home extends Component{
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
    }

    componentDidMount() {
        ipcRenderer.send('LOGINED');
    }
    
    handleTrigger(visible) {
        this.setState({
            visible
        });
    }

    render() {
        const { visible } = this.state;

        return (
            <div>
                <Header
                    onTrigger={() => this.handleTrigger(!visible)}
                />
                <Switch>
                    <Route path="/shop/detail" component={Shop.Detail} />
                    <Route component={Main} />
                </Switch>
                <RightTask visible={visible} onTrigger={() => this.handleTrigger(!visible)} />
            </div>
        );
    }
}