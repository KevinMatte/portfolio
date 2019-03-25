/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {ReduxState} from "./reduxState";

export default class TreeState extends ReduxState {

    constructor(initialState = {
        types: {},
        models: [],
    }) {
        super("TreeState", initialState);
    }

    static SET_VALUE_BY_PATH = "SET_VALUE_BY_PATH";

    static setValueByPath = (path, value) => {
        return {
            type: TreeState.SET_VALUE_BY_PATH,
            path: Array.isArray(path) ? path : [path],
            value
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static setValueByPathReducer = (state, action) => {
        let {path, value} = action;

        return {
            ...state,
            models: this.setStateValueByPath(state.models, path, value),
        };
    }

    static SET_DRAWINGS = "SET_DRAWINGS";

    static setDrawings = (models) => {
        return {
            type: TreeState.SET_DRAWINGS,
            models
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static setDrawingsReducer = (state, action) => {
        return {
            ...state,
            models: action.models,
        };
    }

    static SET_TYPES = "SET_TYPES";

    static setTypes = (types) => {
        return {
            type: TreeState.SET_TYPES,
            types
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static setTypesReducer = (state, action) => {
        return {
            ...state,
            types: action.types,
        };
    }

    static DELETE_PATH = "DELETE_PATH";

    static deletePath = (path, value, newField = null) => {
        return {
            type: TreeState.DELETE_PATH,
            path: Array.isArray(path) ? path : [path],
            value,
            newField,
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static deletePathReducer = (state, action) => {
        let {path, value, newField} = action;

        return {
            ...state,
            models: this.deleteStateValueByPath(state.models, path, value, newField),
        };
    }

    static DUPLICATE_PATH = "DUPLICATE_PATH";

    static duplicatePath = (path, newField = null) => {
        return {
            type: TreeState.DUPLICATE_PATH,
            path: Array.isArray(path) ? path : [path],
            newField,
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static duplicatePathReducer = (state, action) => {
        let {path, newField} = action;

        return {
            ...state,
            models: this.duplicateStateValueByPath(state.models, path, newField),
        };
    }
}

