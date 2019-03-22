import {getGridCellStyle, getValueByPath} from "../../general/utils";
import React from "react";
import {connect} from "react-redux";
import TempValues from "../../redux/tempValues";
import TreeModel from "../../redux/treeModel";
import {BaseController} from "../../core/baseController";

export class Controller extends BaseController {

    setTempValueByPath = (field, value) => this.props.setTempValueByPath(`${this.props.name}/${field}`, value);

    handleCellSelect = (sheetName, cellRow, cellCol) => {
        let row;
        console.log(`select ${sheetName} ${cellRow} ${cellCol}`)
        let {selectedRow, selectedCol, rowModel, editValue} = this.props;
        if (cellRow !== selectedRow || selectedCol !== cellCol) {
            if (selectedRow !== null && selectedCol != null) {
                row = rowModel.openRows[selectedRow];
                let sheet = rowModel.sheetsByName[row.sheetName];
                let columnPath = sheet.type.columns[selectedCol].path;
                columnPath = Array.isArray(columnPath) ? columnPath : [columnPath];
                let path = [...row.path, ...columnPath];
                this.props.setValueByPath(path, editValue);
                row.values[selectedCol] = editValue;
            }
            if (cellRow != null) {
                row = rowModel.openRows[cellRow];
                this.setTempValueByPath('selectedSheetName', sheetName);
                this.setTempValueByPath('selectedRow', cellRow);
                this.setTempValueByPath('selectedCol', cellCol);
                this.setTempValueByPath('selectedPath', row.path);
            }
            this.setTempValueByPath('updated', this.props.updated + 1);
        } else if (cellRow === selectedRow && selectedCol === cellCol && cellCol === null) {
            this.setTempValueByPath('updated', this.props.updated + 1);
            this.setTempValueByPath('selectedSheetName', null);
            this.setTempValueByPath('selectedRow', null);
            this.setTempValueByPath('selectedCol', null);
            this.setTempValueByPath('selectedPath', null);
        }
    }

}

export function RowHeaders(props)  {
    let controller = new Controller(props);

    // Render grid div

    let {selectedRow, rowModel} = props;
    let sheetStyle = {
        gridTemplateColumns: `${props.headerColumnWidth}px`,
        gridTemplateRows: `repeat(${rowModel.openRows.length}, ${props.rowHeight}px)`,
    };
    let cells = [];
    let iCell = 0;
    rowModel.openRows.every((row, cellRow) => {
        let sheet = rowModel.sheetsByName[row.sheetName];
        cells.push((
            <div
                key={++iCell}
                style={getGridCellStyle(cellRow + 1, 1)
                }
                onMouseUp={() => controller.handleCellSelect(row.sheetName, cellRow, null)}
                className={"SpreadsheetRowHeader " + (cellRow === selectedRow ? "selectedHeader" : "")}>
                {sheet.typeName}
            </div>
        ));
        return true;
    });

    return (
        <div className="overflowHidden rowHeaders">
            <div style={sheetStyle} className="Spreadsheet max_size">
                {cells}
            </div>
        </div>);
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedRow: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedRow`, null),
        selectedCol: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedCol`, null),
        editValue: getValueByPath(state.tempValues.values, `${ownProps.name}/editValue`, 0),
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
    }
};

const mapDispatchToProps = {
    setValueByPath: TreeModel.setValueByPath,
    setTempValueByPath: TempValues.setValueByPath,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RowHeaders)


