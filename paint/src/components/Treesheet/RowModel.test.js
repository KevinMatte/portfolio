import RowModel from "./RowModel";
import Drawing from "../../redux/drawing";
import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import thunk from "redux-thunk";
import TempValues from "../../redux/tempValues";

var rootReducer = combineReducers({
    drawing: Drawing.reducer,
    tempValues: TempValues.reducer,
});

const middleWare = [
    thunk,
];

// noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, {}, composeEnhancers(
    applyMiddleware(...middleWare)
));

test('RowModel', () => {

    let name = "treesheet";

    let types = {
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
    let dataTree = [
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
            ],
        },
    ];

    store.dispatch(Drawing.setDrawings(dataTree));
    store.dispatch(Drawing.setTypes(types));
    let state = store.getState();

    let props = {name, types: state.drawing.types, dataTree: state.drawing.drawings};
    Object.getOwnPropertyNames(Drawing).forEach((k) => {
        if (typeof (Drawing[k]) === "function" && !k.endsWith("Reducer")) {
            props[k] = function () {
                store.dispatch(Drawing[k].apply(null, arguments));
            }
        }
    });
    let model = new RowModel(props);
    expect(model.openRows).toMatchSnapshot();
    expect(model.dataTree).toMatchSnapshot();
    let oldRowsLength = model.openRows.length;
    let oldGraphsLength = state.drawing.drawings[0].graphs.length;
    model.duplicateRow(0);
    expect(model.openRows.length).toBe(oldRowsLength + 4);
    state = store.getState();
    // expect(state.drawing.drawings[0].graphs.length).toBe(oldGraphsLength + 1);
    model.deleteRow(0);
    expect(model.openRows.length).toBe(oldRowsLength);
    // expect(state.drawing.drawings[0].graphs.length).toBe(oldGraphsLength);
});