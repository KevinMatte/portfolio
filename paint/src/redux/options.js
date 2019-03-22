/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {ReduxState} from "./reduxState";

export default class Options extends ReduxState {
    constructor(initialState={advancedMode: false}) {
        super(Options, initialState);
    }

    static ADVANCED_MODE_TOGGLE = "ADVANCED_MODE_TOGGLE";

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
}
