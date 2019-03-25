/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {getGridCellStyle, getValueByPath} from "../../general/utils";
import React from "react";
import {connect} from "react-redux";

// export class Controller { }

export function TopLeftCorner(props) {

    // Render grid header
    let rowModel = props.rowModel;
    let sheetName = props.selectedSheetName || rowModel.sheetNames[0];
    let sheet = rowModel.sheetsByName[sheetName];
    let sheetStyle = {
        gridTemplateColumns: `${props.headerColumnWidth}px`,
        gridTemplateRows: `${props.rowHeight}px`,
    };

    return (
        <div style={sheetStyle} className="Spreadsheet">
            <div className="SpreadsheetRowHeader" style={getGridCellStyle(1, 1)}>{sheet.typeName}</div>
        </div>);
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedSheetName: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedSheetName`, null),
        selectedRow: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedRow`, null),
        selectedCol: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedCol`, null),
    }
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TopLeftCorner)


