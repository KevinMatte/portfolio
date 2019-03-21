/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

export default class Options {
    static ADVANCED_MODE_TOGGLE = "ADVANCED_MODE_TOGGLE";

    static initialState = {
        advancedMode: false
    };

    static toggleAdvancedMode() {
        return {
            type: Options.ADVANCED_MODE_TOGGLE,
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
            case Options.ADVANCED_MODE_TOGGLE:
                return Options.toggleAdvancedModeReducer(options, action);

            default:
                return options;
        }

    }
}
