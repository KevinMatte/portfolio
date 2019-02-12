import {ADVANCED_MODE_TOGGLE} from "../actions";
import {initialState} from "../initialState";

export default function(options=initialState.options, action) {
    switch (action.type) {
        case ADVANCED_MODE_TOGGLE:
            return {
                ...options,
                advancedMode: !options.advancedMode,
            };

        default:
            return options;
    }

}