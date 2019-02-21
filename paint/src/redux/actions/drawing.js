/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {getStateWithValueByPath} from "../../general/Utils";

export default class Drawing {
    static initialState = {
        types: {
            drawing: {
                columns: [
                    {label: 'Name', width: '150px', path: 'name'},
                    {label: 'Type', width: '150px', path: 'type'},
                ]
            },
            graph: {
                columns: [
                    {label: 'Name', width: '160px', path: 'name'},
                    {label: 'Type', width: '160px', path: 'type'},
                ]
            },
            vector3: {
                columns: [
                    {label: 'Name', width: '150px', path: 'name'},
                    {label: 'Type', width: '150px', path: 'type'},
                    {label: 'X', width: '150px', path: ['axis', 0]},
                    {label: 'Y', width: '150px', path: ['axis', 1]},
                    {label: 'Z', width: '150px', path: ['axis', 2]},
                ]
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

    static UPDATE_VALUE_BY_PATH = "UPDATE_VALUE_BY_PATH";

    static setValueByPath(path, value) {
        return {
            type: Drawing.UPDATE_VALUE_BY_PATH,
            path:  Array.isArray(path) ? path : [path],
            value
        };
    }

    static setValueByPathReducer(state, action) {
        let {path, value} = action;

        return {
          ...state,
          drawings: getStateWithValueByPath(state.drawings, path, value)
        };
    }

    static reducer(drawing = Drawing.initialState, action) {
        switch (action.type) {
            case Drawing.UPDATE_VALUE_BY_PATH:
                return Drawing.setValueByPathReducer(drawing, action);

            default:
                return drawing;
        }

    }
}
