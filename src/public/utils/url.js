const Api = {
    getUrl: (url, query, encode) => {
        const _q = [];
        if (query) {
            url += '?';
            Object.keys(query).map(function (key) {
                const val = encode ? encodeURIComponent(query[key]) : query[key];
                return _q.push(`${key}=${val}`);
            });
        }
        return url + _q.join('&');
    },

    getUrlParam: (url, name) => {
        if (!name) {
            return null;
        }
        url = url || location.search;
        name = name.replace(/(?=[\\^$*+?.():|{}])/, '\\');
        const reg = new RegExp('(?:[?&]|^)' + name + '=([^?&#]*)', 'i');
        const match = url.match(reg);
        return !match ? null : match[1];
    },

    getAllParams: (url) => {
        if (!url) {
            return null;
        }

        const _params = url.match(/[?|&][^=]*=[^&]*/ig);

        if (_params) {
            const params = {};

            _params.forEach(item => {
                const _match = item.match(/[?|&]([^=]*)=([^&]*)/);
                params[_match[1]] = _match[2];
            });

            return params;
        } else {
            return null;
        }
    },

    replaceUrlParam: (url, name, value) => {
        const res = Api.getAllUrlParam(url, name);
        const params = res ? Object.assign(res, {
            [name]: value
        }) : {
            [name]: value
        };

        return Api.joinParam(url, params);
    },

    removeUrlParam: (url, name) => {
        const params = Api.getAllUrlParam(url);
        if (params) delete params[name];

        return params ? Api.joinParam(url, params) : url;
    },

    joinParam: (url, params) => {
        if (!url) return null;
        const _url = url.split('?')[0];

        const _param = Object.keys(params).map(item => `${item}=${params[item]}`);

        return `${_url}?${_param.join('&')}`;
    }
};

module.exports = Api;