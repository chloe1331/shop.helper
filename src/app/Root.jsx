import './style.less';

import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { HashRouter as Router } from 'react-router-dom';
import PropTypes from 'prop-types';

import App from './App';

export default class Root extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { store } = this.props;

        return (
            <Provider store={store}><Router><App /></Router></Provider>
        );
    }
}

Root.propTypes = {
    store: PropTypes.object
};