/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {deleteStateValueByPath, duplicateStateValueByPath, setStateValueByPath} from "./pathUtils";
import {getActionMap} from "./utils";
import {ReduxState} from "./reduxState";

export default class TreeModel extends ReduxState {

    constructor(initialState = {
        types: {},
        models: [],
    }) {
        super(TreeModel, initialState);
    }

    static SET_VALUE_BY_PATH = "SET_VALUE_BY_PATH";

    static setValueByPath(path, value) {
        return {
            type: TreeModel.SET_VALUE_BY_PATH,
            path: Array.isArray(path) ? path : [path],
            value
        };
    }

    static setValueByPathReducer(state, action) {
        let {path, value} = action;

        return {
            ...state,
            models: setStateValueByPath(state.models, path, value),
        };
    }

    static SET_DRAWINGS = "SET_DRAWINGS";

    static setDrawings(models) {
        return {
            type: TreeModel.SET_DRAWINGS,
            models
        };
    }

    static setDrawingsReducer(state, action) {
        return {
            ...state,
            models: action.models,
        };
    }

    static SET_TYPES = "SET_TYPES";

    static setTypes(types) {
        return {
            type: TreeModel.SET_TYPES,
            types
        };
    }

    static setTypesReducer(state, action) {
        return {
            ...state,
            types: action.types,
        };
    }

    static DELETE_PATH = "DELETE_PATH";

    static deletePath(path, value, newField = null) {
        return {
            type: TreeModel.DELETE_PATH,
            path: Array.isArray(path) ? path : [path],
            value,
            newField,
        };
    }

    static deletePathReducer(state, action) {
        let {path, value, newField} = action;

        return {
            ...state,
            models: deleteStateValueByPath(state.models, path, value, newField),
        };
    }

    static DUPLICATE_PATH = "DUPLICATE_PATH";

    static duplicatePath(path, newField = null) {
        return {
            type: TreeModel.DUPLICATE_PATH,
            path: Array.isArray(path) ? path : [path],
            newField,
        };
    }

    static duplicatePathReducer(state, action) {
        let {path, newField} = action;

        return {
            ...state,
            models: duplicateStateValueByPath(state.models, path, newField),
        };
    }
}

