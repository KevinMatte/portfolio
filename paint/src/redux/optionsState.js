/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {ReduxState} from "./reduxState";

export default class OptionsState extends ReduxState {
    constructor(initialState={advancedMode: false}) {
        super(initialState);
    }

    static TOGGLE_ADVANCED_MODE = "TOGGLE_ADVANCED_MODE";

    // noinspection JSUnusedGlobalSymbols
    static toggleAdvancedMode() {
        return {
            type: this.TOGGLE_ADVANCED_MODE,
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static toggleAdvancedModeReducer(options, /* action */) {
        return {
            ...options,
            advancedMode: !options.advancedMode,
        };
    }
}
