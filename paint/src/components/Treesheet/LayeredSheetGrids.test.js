// Cell.react.test.js
import React from 'react';
import {render, fireEvent, cleanup, waitForElement} from 'react-testing-library';
import 'jest-dom/extend-expect'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import LayeredSheetGrids from './LayeredSheetGrids';
import TreesheetModel from "../../model/TreeModel";
import Drawing from "../../redux/actions/drawing";
// import renderer from 'react-test-renderer';

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

describe('async actions', () => {
    afterEach(() => {
        fetchMock.restore()
    });

    test('LayeredSheetGrids: Basic', () => {
        let tree, value;

        let name = "treesheet";
        let rowHeight = 50;
        let indentPixels = 30;
        let gridSpacingWidth = 5;
        let types = Drawing.initialState.types;
        let dataTree = Drawing.initialState.drawings;
        let treesheetModel = new TreesheetModel(name, types, dataTree);
        let commonProps = {name, rowHeight, gridSpacingWidth, treesheetModel};
        let colHeaderProps = {...commonProps, indentPixels};

        const {container, getByTestId, asFragment} = render(
            <LayeredSheetGrids {...colHeaderProps}/>
        );

        tree = asFragment();
        expect(tree).toMatchSnapshot();

    });
});

