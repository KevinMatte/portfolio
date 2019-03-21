import {getGridCellStyle, getValueByPath} from "../../general/Utils";
import React from "react";
import {connect} from "react-redux";

// export class Model { }

export function TopLeftCorner(props) {

    // Render grid header
    let treesheetModel = props.treesheetModel;
    let sheetName = props.selectedSheetName || treesheetModel.sheetNames[0];
    let sheet = treesheetModel.sheetsByName[sheetName];
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


