import RowModel from "./rowModel";
import TreeModel from "../../redux/treeModel";
import {applyMiddleware, combineReducers, compose, createStore} from "redux";
import thunk from "redux-thunk";
import TempValues from "../../redux/tempValues";

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
let models = [
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

var treeModel = new TreeModel({types, models});
var rootReducer = combineReducers({
    treeModel: treeModel.reducer,
    tempValues: new TempValues().reducer,
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
    let state = store.getState();

    let props = treeModel.getMapDispatchToProps(store);
    props = {...props, name, types: state.treeModel.types, dataTree: state.treeModel.models};
    let model = new RowModel(props);
    expect(model.openRows).toMatchSnapshot();
    expect(model.dataTree).toMatchSnapshot();

    let oldRowsLength = model.openRows.length;
    let oldGraphsLength = state.treeModel.models[0].graphs.length;

    model.duplicateRow(1);
    expect(model.openRows.length).toBe(oldRowsLength + 3);
    state = store.getState();
    expect(state.treeModel.models[0].graphs.length).toBe(oldGraphsLength + 1);

    model.toggleOpen(model.rows[1]);
    expect(model.openRows.length).toBe(oldRowsLength + 1);

    // Do toggles.
    model.toggleOpen(model.rows[1]);
    expect(model.openRows.length).toBe(oldRowsLength + 3);
    model.toggleOpen(model.rows[0]);
    expect(model.openRows.length).toBe(1);
    model.toggleOpen(model.rows[0]);
    expect(model.openRows.length).toBe(oldRowsLength + 3);

    model.deleteRow(1);
    expect(model.openRows.length).toBe(oldRowsLength);
    state = store.getState();
    expect(state.treeModel.models[0].graphs.length).toBe(oldGraphsLength);
});