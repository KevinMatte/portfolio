// Cell.react.test.js
import React from 'react';
import {render, fireEvent, cleanup, waitForElement} from 'react-testing-library';
import 'jest-dom/extend-expect'
import {LayeredSheetGrids, Controller} from './layeredSheetGrids';
import RowModel from "./rowModel";
import TreeModel from "../../redux/treeModel";
import {setupDemo, types, dataTree} from "../../demo";

// automatically unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

// noinspection ES6ModulesDependencies
test('LayeredSheetGrids: Basic', () => {
    let tree, value;

    let name = "treesheet";
    let rowHeight = 50;
    let indentPixels = 30;
    let gridSpacingWidth = 5;

    let rowModel = new RowModel({name, types, dataTree});
    let commonProps = {name, rowHeight, gridSpacingWidth, rowModel};
    let colHeaderProps = {...commonProps, indentPixels};

    const {container, getByTestId, asFragment} = render(
        <LayeredSheetGrids {...colHeaderProps}/>
    );

    tree = asFragment();
    expect(tree).toMatchSnapshot();

});

