/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

export default class Drawing {
    static ADD_GRAPH = "ADD_GRAPH";

    static initialState = {
        types: {
            drawing: {
                columns: [
                    {label: 'Name', width: '150px', field: 'name'},
                    {label: 'Type', width: '150px', field: 'type'},
                ]
            },
            graph: {
                columns: [
                    {label: 'Name', width: '160px', field: 'name'},
                    {label: 'Type', width: '160px', field: 'type'},
                ]
            },
            vector3: {
                columns: [
                    {label: 'Name', width: '170px', field: 'name'},
                    {label: 'Type', width: '170px', field: 'type'},
                    {label: 'X', width: '170px', field: ['axis', 0]},
                    {label: 'Y', width: '170px', field: ['axis', 1]},
                    {label: 'Z', width: '170px', field: ['axis', 2]},
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
                        table: 'graphg',
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

    static addGraph() {
        return {
            type: Drawing.ADD_GRAPH,
        };
    }

    static addGraphReducer(drawing, action) {
        return {
            ...drawing,
            graphs: [...drawing.graphs, action.graph],
        };
    }

    static reducer(drawing = Drawing.initialState, action) {
        switch (action.type) {
            case Drawing.ADD_GRAPH:
                return Drawing.addGraphReducer();

            default:
                return drawing;
        }

    }
}
