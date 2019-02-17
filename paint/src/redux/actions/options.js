import {ADVANCED_MODE_TOGGLE} from "../actions";

export default class Options {
    static ADVANCED_MODE_TOGGLE = "ADVANCED_MODE_TOGGLE";

    static initialState = {
        advancedMode: false
    };

    static toggleAdvancedMode() {
        return {
            type: ADVANCED_MODE_TOGGLE,
        };
    }

    static toggleAdvancedModeReducer(options, /* action */) {
        return {
            ...options,
            advancedMode: !options.advancedMode,
        };
    }

    static reducer(options = Options.initialState, action) {
        switch (action.type) {
            case ADVANCED_MODE_TOGGLE:
                return Options.toggleAdvancedModeReducer();

            default:
                return options;
        }

    }
}