import {Component} from "react";
import {getGridCellStyle, getValueByPath} from "../general/Utils";
import React from "react";
import {connect} from "react-redux";

class RowHeaders extends Component {

    render() {
        // Render grid div

        let {selectedRow, spreadsheet} = this.props;
        let sheetStyle = {
            gridTemplateColumns: `${this.props.headerColumnWidth}px`,
            gridTemplateRows: `repeat(${spreadsheet.openRows.length}, ${this.props.rowHeight}px)`,
        };
        let cells = [];
        let iCell = 0;
        spreadsheet.openRows.every((row, cellRow) => {
            let sheet = spreadsheet.sheetsByName[row.sheetName];
            cells.push((
                <div key={++iCell} style={getGridCellStyle(cellRow + 1, 1)}
                     className={"SpreadsheetRowHeader " + (cellRow === selectedRow ? "selectedHeader" : "")}>
                    {sheet.typeName}
                </div>
            ));
            return true;
        });

        return (
            <div className="max_size overflowHidden">
                <div style={sheetStyle} className="Spreadsheet max_size">
                    {cells}
                </div>
            </div>);
    }

}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedRow: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedRow`, null),
        selectedCol: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedCol`, null),
    }
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RowHeaders)


