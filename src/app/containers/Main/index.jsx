import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import { Layout, Leftmenu } from '~/app/components';
import Shop from '../Shop';
import Team from '../Team';

export default class Home extends Component {
    render() {
        return (
            <Layout>
                <Leftmenu />
                <Layout.Content>
                    <Switch>
                        <Route exact path="/shop/create" component={Shop.Create} />
                        <Route exact path="/team" component={Team} />
                        <Route component={Shop} />
                    </Switch>
                </Layout.Content>
            </Layout>
        );
    }
}