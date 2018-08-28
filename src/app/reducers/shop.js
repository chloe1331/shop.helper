import * as TYPES from '../store/types';

const initState = {
    current: null
};

export default function (state = initState, action) {
    switch (action.type) {
    case TYPES.SET_CURRENT_SHOP:
        return { ...state,
            ...{
                current: action.data
            }
        };
    default:
        return state;
    }
}
