import {
    combineReducers
} from 'redux';

import shop from './shop';
import goods from './goods';

export default combineReducers({
    shop,
    goods
});
