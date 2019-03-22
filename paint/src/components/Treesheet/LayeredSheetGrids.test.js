// Cell.react.test.js
import React from 'react';
import {render, fireEvent, cleanup, waitForElement} from 'react-testing-library';
import 'jest-dom/extend-expect'
import {LayeredSheetGrids, Model} from './LayeredSheetGrids';
import RowModel from "./RowModel";
import Drawing from "../../redux/drawing";

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

test('LayeredSheetGrids: Basic', () => {
    let tree, value;

    let name = "treesheet";
    let rowHeight = 50;
    let indentPixels = 30;
    let gridSpacingWidth = 5;
    let types = Drawing.initialState.types;
    let dataTree = Drawing.initialState.drawings;
    let rowModel = new RowModel({name, types, dataTree});
    let commonProps = {name, rowHeight, gridSpacingWidth, rowModel};
    let colHeaderProps = {...commonProps, indentPixels};

    const {container, getByTestId, asFragment} = render(
        <LayeredSheetGrids {...colHeaderProps}/>
    );

    tree = asFragment();
    expect(tree).toMatchSnapshot();

});

