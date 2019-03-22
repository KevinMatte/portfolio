/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {setStateValueByPath} from "./pathUtils";
import {deleteStateValueByPath, duplicateStateValueByPath} from "./pathUtils";

export default class TreeModel {
    static initialState = {
        types: {
            drawing: {
                columns: [
                    {label: 'Name', width: '150px', path: 'name'},
                    {label: 'Type', width: '150px', path: 'type'},
                ],
                arrays: ['graphs'],
                fields: [],
            },
            graph: {
                columns: [
                    {label: 'Name', width: '160px', path: 'name'},
                    {label: 'Type', width: '160px', path: 'type'},
                ],
                arrays: ['points'],
                fields: [],
            },
            vector3: {
                columns: [
                    {label: 'Name', width: '150px', path: 'name'},
                    {label: 'Type', width: '150px', path: 'type'},
                    {label: 'X', width: '150px', path: ['axis', 0]},
                    {label: 'Y', width: '150px', path: ['axis', 1]},
                    {label: 'Z', width: '150px', path: ['axis', 2]},
                ],
                array: [],
                fields: [],
            },
        },
        models: [
            {
                name: 'First drawing',
                type: 'drawing',
                table: 'drawing',
                drawingId: 1,
                graphs: [
                    {
                        name: 'line 1',
                        type: 'line',
                        table: 'graph',
                        points: [
                            {
                                type: 'point',
                                name: 'start',
                                table: 'vector3',
                                axis: [1, 2, 3],
                            },
                            {
                                type: 'point',
                                name: 'end',
                                table: 'vector3',
                                axis: [3, 2, 1],
                            },

                        ]
                    },
                    {
                        name: 'cube 1',
                        type: 'cube',
                        table: 'graph',
                        points: [
                            {
                                type: 'point',
                                name: 'vertex',
                                table: 'vector3',
                                axis: [11, 21, 31],
                            },
                            {
                                type: 'vector',
                                name: 'edge',
                                table: 'vector3',
                                axis: [0, 0, 5],
                            },

                        ]
                    },
                    {
                        name: 'box 1',
                        type: 'box',
                        table: 'graph',
                        points: [
                            {
                                table: 'vector3',
                                type: 'point',
                                name: 'vertex',
                                axis: [-11, 21, 31],
                            },
                            {
                                table: 'vector3',
                                type: 'vector',
                                name: 'x',
                                axis: [0, 0, 5],
                            },
                            {
                                table: 'vector3',
                                type: 'vector',
                                name: 'y',
                                axis: [0, 5, 0],
                            },
                            {
                                table: 'vector3',
                                type: 'vector',
                                name: 'z',
                                axis: [5, 0, 0],
                            },

                        ]
                    },
                ],
            },
        ],
    };

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

    static deletePath(path, value, newField=null) {
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

    static duplicatePath(path, newField=null) {
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

    static reducer(treeModel = TreeModel.initialState, action) {
        switch (action.type) {
            case TreeModel.SET_VALUE_BY_PATH:
                return TreeModel.setValueByPathReducer(treeModel, action);

            case TreeModel.DUPLICATE_PATH:
                return TreeModel.duplicatePathReducer(treeModel, action);

            case TreeModel.DELETE_PATH:
                return TreeModel.deletePathReducer(treeModel, action);

            case TreeModel.SET_DRAWINGS:
                return TreeModel.setDrawingsReducer(treeModel, action);

            case TreeModel.SET_TYPES:
                return TreeModel.setTypesReducer(treeModel, action);

            default:
                return treeModel;
        }

    }
}
