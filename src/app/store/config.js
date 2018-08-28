import {
    createStore,
    applyMiddleware,
    compose
} from 'redux';
import thunk from 'redux-thunk';
import {
    createLogger
} from 'redux-logger';

import rootReducer from '../reducers';

let finalCreateStore;

if (process.env.NODE_ENV === 'production') {
    finalCreateStore = compose(
        applyMiddleware(thunk)
    )(createStore);
} else {
    finalCreateStore = compose(
        applyMiddleware(thunk, createLogger())
    )(createStore);
}


export default function configureStore(initialState) {
    return finalCreateStore(rootReducer, initialState);
}