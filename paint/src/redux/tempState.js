/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {ReduxState} from "./reduxState";

export default class TempState extends ReduxState {
    constructor(initialState={values: {}}) {
        super("TempState", initialState);
    }

    static SET_VALUE_BY_PATH = "SET_VALUE_BY_PATH";

    // noinspection JSUnusedGlobalSymbols
    static setValueByPath = (path, value) => {
        return {
            type: TempState.SET_VALUE_BY_PATH,
            path,
            value,
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static setValueByPathReducer = (editValue, action) => {
        let {path, value} = action;
        return {
            ...editValue,
            values: this.setStateValueByPath(editValue.values, path, value),
        };
    }
}
