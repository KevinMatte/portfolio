/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {setStateValueByPath} from "./pathUtils";
import {ReduxState} from "./reduxState";

export default class TempValues extends ReduxState {
    constructor(initialState={values: {}}) {
        super(TempValues, initialState)
    }

    static SET_VALUE_BY_PATH = "SET_VALUE_BY_PATH";

    static setValueByPath(path, value) {
        return {
            type: TempValues.SET_VALUE_BY_PATH,
            path,
            value,
        };
    }

    static setValueByPathReducer(editValue, action) {
        let {path, value} = action;
        return {
            ...editValue,
            values: setStateValueByPath(editValue.values, path, value),
        };
    }
}
