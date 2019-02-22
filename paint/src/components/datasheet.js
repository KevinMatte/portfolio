/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';

import {getGridCellStyle, getValueByPath} from "../general/Utils";
import Cell from "../Cell";
import TreesheetModel from "../model/treesheet";

import './treesheet.css'
import Drawing from "../redux/actions/drawing";
import TempValues from "../redux/actions/tempValues";
import {connect} from "react-redux"; // km


class Datasheet extends Component {

    setTempValueByPath = (field, value) => this.props.setTempValueByPath(`${this.props.name}/${field}`, value);

    handleCellHover(sheetName) {
        let {selectedRow} = this.props;
        if (selectedRow === null) {
            this.setTempValueByPath('selectedSheetName', sheetName);
        }
    }

    handleCellSelect(sheetName, cellRow, cellCol) {
        let {selectedRow, selectedCol, spreadsheet} = this.props;
        if (cellRow !== selectedRow || selectedCol !== cellCol) {
            if (selectedRow !== null) {
                this.saveEditValue(selectedRow, selectedCol);
            }
            if (cellRow != null) {
                let value = spreadsheet.openRows[cellRow].values[cellCol];
                this.setEditValue(value);
                this.setTempValueByPath('selectedSheetName', sheetName);
                this.setTempValueByPath('selectedRow', cellRow);
                this.setTempValueByPath('selectedCol', cellCol);

            }
        }
    }

    renderSheets() {
        let {spreadsheet, selectedSheetName, selectedRow, selectedCol, editValue, gridWidth, indentPixels, rowHeight} = this.props;

        let cellsBySheet = spreadsheet.sheetNames.reduce(
            (dst, sheetName) => {
                dst[sheetName] = [];
                return dst;
            },
            {}
        );

        let iCell = 0;

        spreadsheet.openRows.every((row, cellRow) => {
            let sheetName = row.sheetName;
            let cells = cellsBySheet[row.sheetName];

            // Display open/close
            if (row.hasOwnProperty('isOpen')) {
                let symbol = row.isOpen ? "-" : "+";
                cells.push((
                    <div
                        className="middleText"
                        key={++iCell}
                        style={getGridCellStyle(cellRow + 1, 2)}

                    >
                        <button onClick={() => this.toggleOpen(row)}>{symbol}</button>
                    </div>));

            }


            // Display borders on selected column.
            if (selectedCol !== null && sheetName === selectedSheetName) {
                let i = 2 * selectedCol + 4;
                cells.push((
                    <div
                        key={++iCell}
                        style={getGridCellStyle(cellRow + 1, i - 1)}
                        className="selectedGrid"
                    >
                    </div>));
                cells.push((
                    <div
                        key={++iCell}
                        style={getGridCellStyle(cellRow + 1, i + 1)}
                        className="selectedGrid"
                    >
                    </div>));
            }

            let iCol = 4; // Skip first grid.
            row.values.every((value, cellCol) => {

                let isSelected = (cellRow === selectedRow && selectedCol === cellCol);
                let cellClasses = "ValueCell Cell middleText";
                let cell;
                if (isSelected) {
                    cell = <Cell
                        doEdit={isSelected}
                        value={editValue}
                        setValue={value => this.setEditValue(value)}
                    />;
                } else {
                    cell = <Cell value={value}/>;
                }
                cells.push((
                    <div
                        key={++iCell}
                        style={getGridCellStyle(cellRow + 1, iCol++)}
                        className={cellClasses}
                        onMouseOver={() => this.handleCellHover(sheetName)}
                        onMouseUp={() => this.handleCellSelect(sheetName, cellRow, cellCol)}
                    >
                        {cell}
                    </div>
                ));
                iCol++;
                return true;
            });
            return true;
        });

        return spreadsheet.sheetNames.filter(sheetName => cellsBySheet[sheetName].length > 0).map(sheetName => {
            let sheet = spreadsheet.sheetsByName[sheetName];
            // Render grid div
            let widths = sheet.type.columns.reduce((dest, col) => {
                dest.push(gridWidth, col.width);
                return dest;
            }, []).join(" ");
            let indentWidth = `${gridWidth} ${sheet.path.length * indentPixels}px`;

            return (
                <div
                    id={sheetName} key={sheetName}
                    className="Spreadsheet max_size"
                    style={{
                        ...getGridCellStyle(1, 1),
                        gridTemplateRows: `repeat(${spreadsheet.openRows.length}, ${rowHeight}px)`,
                        gridTemplateColumns: `${indentWidth} ${widths} ${gridWidth}`,
                    }}
                >
                    {cellsBySheet[sheetName]}
                </div>);
        });
    }

    render() {
        return (
            <div className="max_size overflowAuto">
                <div
                    className="SpreadsheetOverlay"
                >
                    {this.renderSheets()}
                </div>
            </div>
        );
    }

    setEditValue = value => this.setTempValueByPath('editValue', value);

    toggleOpen = (row) => {
        row.isOpen = !row.isOpen;
        this.props.spreadsheet.updateSpreadsheetOpenRows();
        this.handleCellSelect(null, null, null);
        this.setTempValueByPath('updated', this.props.updated + 1);
        this.setTempValueByPath('selectedSheetName', null);
        this.setTempValueByPath('selectedRow', null);
        this.setTempValueByPath('selectedCol', null);
    };

    saveEditValue(cellRow, cellCol) {
        let {spreadsheet, editValue} = this.props;

        let row = spreadsheet.openRows[cellRow];
        let sheet = spreadsheet.sheetsByName[row.sheetName];
        let columnPath = sheet.type.columns[cellCol].path;
        columnPath = Array.isArray(columnPath) ? columnPath : [columnPath];
        let path = [...row.path, ...columnPath];
        this.props.setValueByPath(path, editValue);
        row.values[cellCol] = editValue;
    }


}

const mapStateToProps = (state, ownProps) => {
    return {
        types: state.drawing.types,
        dataTree: state.drawing.drawings,
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
        editValue: getValueByPath(state.tempValues.values, `${ownProps.name}/editValue`, null),
        selectedSheetName: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedSheetName`, null),
        selectedRow: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedRow`, null),
        selectedCol: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedCol`, null),
    }
};

const mapDispatchToProps = {
    setValueByPath: Drawing.setValueByPath,
    setTempValueByPath: TempValues.setValueByPath,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Datasheet)
