/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {useState} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import {connect} from "react-redux";


import {getValueByPath} from "../../general/utils";
import RowModel from "./rowModel";
import LayeredSheetGrids from './layeredSheetGrids';
import RowHeaders from './rowHeaders';
import ColumnHeaders from './columnHeaders';
import TopLeftCorner from './topLeftCorner';
import TreeControls from './sheetToolbar';

import './treesheet.css'
import {BaseController} from "../../core/baseController";
import TreeModel from "../../redux/treeModel";

export class Controller extends BaseController {
    constructor(props, hooks) {
        super(props, hooks);
        this.topDivId = "TopDiv";
    }

    handleScroll = (event) => {
        let bodyDiv = event.target;

        let topDiv = bodyDiv;
        for (; topDiv && topDiv !== document; topDiv = topDiv.parentNode) {
            if (topDiv.id === this.topDivId)
                break;
        }
        if (topDiv !== document) {
            let headersDivs, headersDiv;
            let {scrollTop, scrollLeft} = bodyDiv;

            headersDivs = topDiv.getElementsByClassName("rowHeaders");
            if (headersDivs.length > 0) {
                headersDiv = headersDivs[0];
                headersDiv.scrollTop = scrollTop;
            }

            headersDivs = topDiv.getElementsByClassName("columnHeaders");
            if (headersDivs.length > 0) {
                headersDiv = headersDivs[0];
                headersDiv.scrollLeft = scrollLeft;
            }
        }
    };
}

export function Treesheet(props) {
    let hooks = {
        rowModel: useState(() => new RowModel(props))
    };
    let controller = new Controller(props, hooks);
    let rowModel = controller.getValue("rowModel");


    let renderTreesheet = (rowHeaderProps, colHeaderProps) => {
        return <div className="flexVStretched flexVDisplay borderBottom">

            {/*<!-- Headers for Columns --> */}
            <div className="flexFixed flexHDisplay">
                <TopLeftCorner className="flexFixed" {...rowHeaderProps}/>
                <ColumnHeaders className="flexHStretched" {...colHeaderProps}/>
            </div>

            <div className="flexVStretched flexHDisplay">
                {/*<!-- Headers for rows --> */}
                <RowHeaders className="flexFixed" {...rowHeaderProps}/>

                {/*<!-- Edit/Body of Treesheet --> */}
                <div
                    className="flexHStretched SpreadsheetScrollArea"
                    onScroll={(event) => controller.handleScroll(event)}
                >
                    <LayeredSheetGrids {...colHeaderProps}/>
                </div>
            </div>
        </div>;
    };

    let renderTreeControls = () => {
        return <div
            className="flexFixed">
            <TreeControls
                name={props.name}
                rowModel={rowModel}
            />
        </div>;
    };

    let {headerColumnWidth, rowHeight, indentPixels, gridSpacingWidth, name} = props;
    let commonProps = {name, rowHeight, gridSpacingWidth, rowModel};
    let rowHeaderProps = {...commonProps, headerColumnWidth};
    let colHeaderProps = {...commonProps, indentPixels};

    return (
        <div id={controller.topDivId} className="flexVDisplay max_size overflowHidden">
            {renderTreesheet(rowHeaderProps, colHeaderProps)}
            {renderTreeControls()}
        </div>
    );
}

Treesheet.defaultProps = {
    updated: 0,
    headerColumnWidth: 150,
    rowHeight: 50,
    indentPixels: 30,
    gridSpacingWidth: 5,
};

Treesheet.propTypes = {
    types: PropTypes.object.isRequired,
    dataTree: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    updated: PropTypes.number,
    headerColumnWidth: PropTypes.number,
    rowHeight: PropTypes.number,
    indentPixels: PropTypes.number,
    gridSpacingWidth: PropTypes.number,
};

const mapStateToProps = (state, ownProps) => {
    return {
        types: state.treeModel.types,
        dataTree: state.treeModel.models,
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
    }
};

const mapDispatchToProps = {
    duplicatePath: TreeModel.duplicatePath,
    deletePath: TreeModel.duplicatePath,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Treesheet)
