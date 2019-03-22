/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {useState} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import {connect} from "react-redux";


import {getValueByPath} from "../../general/Utils";
import RowModel from "./RowModel";
import LayeredSheetGrids from './LayeredSheetGrids';
import RowHeaders from './RowHeaders';
import ColumnHeaders from './ColumnHeaders';
import TopLeftCorner from './TopLeftCorner';
import TreeControls from './TreeControls';

import './Treesheet.css'
import {BaseController} from "../../core/BaseController";

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
        types: state.drawing.types,
        dataTree: state.drawing.drawings,
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
    }
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Treesheet)
