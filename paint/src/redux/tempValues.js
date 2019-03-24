/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {ReduxState} from "./reduxState";

export default class TempValues extends ReduxState {
    constructor(initialState={values: {}}) {
        super(initialState);
    }

    static SET_VALUE_BY_PATH = "SET_VALUE_BY_PATH";

    // noinspection JSUnusedGlobalSymbols
    static setValueByPath(path, value) {
        return {
            type: TempValues.SET_VALUE_BY_PATH,
            path,
            value,
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static setValueByPathReducer(editValue, action) {
        let {path, value} = action;
        return {
            ...editValue,
            values: this.setStateValueByPath(editValue.values, path, value),
        };
    }
}
