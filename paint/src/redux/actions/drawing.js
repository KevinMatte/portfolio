/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {duplicateStateValueByPath, deleteStateValueByPath, setStateValueByPath} from "../../general/Utils";

export default class Drawing {
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
        drawings: [
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
            type: Drawing.SET_VALUE_BY_PATH,
            path: Array.isArray(path) ? path : [path],
            value
        };
    }

    static setValueByPathReducer(state, action) {
        let {path, value} = action;

        return {
            ...state,
            drawings: setStateValueByPath(state.drawings, path, value),
        };
    }

    static DELETE_PATH = "DELETE_PATH";

    static deletePath(path, value, newField=null) {
        return {
            type: Drawing.DELETE_PATH,
            path: Array.isArray(path) ? path : [path],
            value,
            newField,
        };
    }
    static deletePathReducer(state, action) {
        let {path, value, newField} = action;

        return {
            ...state,
            drawings: deleteStateValueByPath(state.drawings, path, value, newField),
        };
    }

    static DUPLICATE_PATH = "DUPLICATE_PATH";

    static duplicatePath(path, value, newField=null) {
        return {
            type: Drawing.DUPLICATE_PATH,
            path: Array.isArray(path) ? path : [path],
            value,
            newField,
        };
    }
    static duplicatePathReducer(state, action) {
        let {path, value, newField} = action;

        return {
            ...state,
            drawings: duplicateStateValueByPath(state.drawings, path, value, newField),
        };
    }

    static reducer(drawing = Drawing.initialState, action) {
        switch (action.type) {
            case Drawing.SET_VALUE_BY_PATH:
                return Drawing.setValueByPathReducer(drawing, action);

            case Drawing.DUPLICATE_PATH:
                return Drawing.duplicatePathReducer(drawing, action);

            case Drawing.DELETE_PATH:
                return Drawing.deletePathReducer(drawing, action);

            default:
                return drawing;
        }

    }
}
