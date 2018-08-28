import React from 'react';
import { render } from 'react-dom';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

import Root from '~/app/Root';
import configureStore from '~/app/store/config';

const store = configureStore();
// 用于弹框
window.Store = store;

render(<LocaleProvider locale={zh_CN}><Root store={store} /></LocaleProvider>, document.getElementById('root'));