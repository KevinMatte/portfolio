import {getGridCellStyle, getValueByPath} from "../../general/Utils";
import React from "react";
import {connect} from "react-redux";

// export class Controller { }

export function ColumnHeaders(props) {

    // Render grid header
    let {selectedSheetName, selectedCol, rowModel, indentPixels, gridSpacingWidth, rowHeight} = props;
    let sheet = rowModel.sheetsByName[selectedSheetName || rowModel.sheetNames[0]];

    let cells = [];
    let iCell = 0;
    let iCol = 4;
    sheet.type.columns.every((column, iColumn) => {
        cells.push((
            <div key={++iCell} style={getGridCellStyle(1, iCol++)}
                 className={"SpreadsheetColumnHeader " + (iColumn === selectedCol ? "selectedHeader" : "")}>
                {column.label}
            </div>
        ));
        iCol++; // Grid
        return true;
    });

    let indentWidth = `${gridSpacingWidth}px ${sheet.path.length * indentPixels}px`;
    let widths = sheet.type.columns.reduce((dest, col) => {
        dest.push(`${gridSpacingWidth}px`, col.width);
        return dest;
    }, []);
    let sheetStyle = {
        gridTemplateColumns: `${indentWidth} ` + widths.join(" "),
        gridTemplateRows: `${rowHeight}px`,
    };

    return (
        <div className="max_size overflowHidden columnHeaders">
            <div style={sheetStyle} className="Spreadsheet">
                {cells}
            </div>
        </div>);
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedSheetName: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedSheetName`, null),
        selectedRow: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedRow`, null),
        selectedCol: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedCol`, null),
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
    }
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ColumnHeaders)


