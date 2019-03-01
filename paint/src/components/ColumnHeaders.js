import {Component} from "react";
import {getGridCellStyle, getValueByPath} from "../general/Utils";
import React from "react";
import {connect} from "react-redux";

class ColumnHeaders extends Component {

    render() {
        // Render grid header
        let {selectedSheetName, selectedCol, treesheetModel} = this.props;
        let sheet = treesheetModel.sheetsByName[selectedSheetName || treesheetModel.sheetNames[0]];

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

        let indentWidth = `${this.props.gridSpacingWidth}px ${sheet.path.length * this.props.indentPixels}px`;
        let widths = sheet.type.columns.reduce((dest, col) => {
            dest.push(`${this.props.gridSpacingWidth}px`, col.width);
            return dest;
        }, []);
        let sheetStyle = {
            gridTemplateColumns: `${indentWidth} ` + widths.join(" "),
            gridTemplateRows: `${this.props.rowHeight}px`,
        };

        return (
            <div className="max_size overflowHidden columnHeaders">
                <div style={sheetStyle} className="Spreadsheet">
                    {cells}
                </div>
            </div>);
    }

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


