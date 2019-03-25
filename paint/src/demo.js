/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import store from "./redux";
import TreeState from "./redux/treeState";

export let types = {
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
};
export let dataTree = [
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
];

export function setupDemo() {
    store.dispatch(TreeState.setTypes(types));
    store.dispatch(TreeState.setDrawings(dataTree));
}
