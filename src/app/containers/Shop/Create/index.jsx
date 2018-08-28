import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import { Layout, CreateShop } from '~/app/components';

class Create extends Component {
    render() {
        const { history } = this.props;
        return (
            <Layout><CreateShop history={history} /></Layout>
        );
    }
}

Create.propTypes = {
    history: PropTypes.object
};

export default withRouter(Create);