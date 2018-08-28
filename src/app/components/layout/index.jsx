import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './style.less';

export default class Layout extends Component {
    render() {
        const { className } = this.props;
        const _className = className ? `layout ${className}` : 'layout';

        return (
            <div {...Object.assign({}, this.props, { className: _className })}></div>
        );
    }
}

Layout.propTypes = {
    className: PropTypes.string
};

class Content extends Component {
    render() {
        const { className } = this.props;
        const _className = className ? `layout-content ${className}` : 'layout-content';

        return (
            <div {...Object.assign({}, this.props, { className: _className })}></div>
        );
    }
}

Content.propTypes = {
    className: PropTypes.string
};

class Header extends Component {
    render() {
        const { className } = this.props;
        const _className = className ? `layout-header ${className}` : 'layout-header';

        return (
            <div {...Object.assign({}, this.props, { className: _className })}></div>
        );
    }
}

Header.propTypes = {
    className: PropTypes.string
};

class Page extends Component {
    render() {
        const { className } = this.props;
        const _className = className ? `layout-page ${className}` : 'layout-page';

        return (
            <div {...Object.assign({}, this.props, { className: _className })}></div>
        );
    }
}

Page.propTypes = {
    className: PropTypes.string
};

class Sider extends Component {
    render() {
        const { className } = this.props;
        const _className = className ? `layout-sider ${className}` : 'layout-sider';

        return (
            <div {...Object.assign({}, this.props, { className: _className })}></div>
        );
    }
}

Sider.propTypes = {
    className: PropTypes.string
};

Layout.Content = Content;
Layout.Header = Header;
Layout.Page = Page;
Layout.Sider = Sider;