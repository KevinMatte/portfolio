/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {setStateValueByPath} from "../general/Utils";

export default class TempValues {
    static SET_VALUE_BY_PATH = "SET_VALUE_BY_PATH";

    static initialState = {
        values: {},
    };

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

    static reducer(editValue = TempValues.initialState, action) {
        switch (action.type) {
            case TempValues.SET_VALUE_BY_PATH:
                return TempValues.setValueByPathReducer(editValue, action);

            default:
                return editValue;
        }

    }
}
