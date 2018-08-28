import * as TYPES from '../store/types';

export function setCurrent(data) {
    return {
        type: TYPES.SET_CURRENT_SHOP,
        data
    };
}