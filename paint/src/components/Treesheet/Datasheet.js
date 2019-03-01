/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
import PropTypes from 'prop-types'

import {getGridCellStyle, getValueByPath} from "../../general/Utils";
import Cell from "./Cell";

import './Treesheet.css'
import Drawing from "../../redux/actions/drawing";
import TempValues from "../../redux/actions/tempValues";
import {connect} from "react-redux";


class Datasheet extends Component {

    setTempValueByPath = (field, value) => this.props.setTempValueByPath(`${this.props.name}/${field}`, value);

    handleCellHover(sheetName) {
        let {selectedRow} = this.props;
        if (selectedRow === null) {
            this.setTempValueByPath('selectedSheetName', sheetName);
        }
    }

    handleCellSelect(sheetName, cellRow, cellCol) {
        let {selectedRow, selectedCol, treesheetModel} = this.props;
        if (cellRow !== selectedRow || selectedCol !== cellCol) {
            if (selectedRow !== null && selectedCol != null) {
                this.saveEditValue(selectedRow, selectedCol);
            }
            if (cellRow != null && cellCol != null) {
                let row = treesheetModel.openRows[cellRow];
                let value = row.values[cellCol];
                this.setEditValue(value);
                this.setTempValueByPath('selectedSheetName', sheetName);
                this.setTempValueByPath('selectedRow', cellRow);
                this.setTempValueByPath('selectedCol', cellCol);

                let sheet = treesheetModel.sheetsByName[row.sheetName];
                let columnPath = sheet.type.columns[cellCol].path;
                columnPath = Array.isArray(columnPath) ? columnPath : [columnPath];
                let path = [...row.path, ...columnPath];
                this.setTempValueByPath('selectedPath', path);
            }
        }
    }

    renderSheets() {
        let {treesheetModel, selectedSheetName, selectedRow, selectedCol, editValue, gridSpacingWidth, indentPixels, rowHeight} = this.props;

        let cellsBySheet = treesheetModel.sheetNames.reduce(
            (dst, sheetName) => {
                dst[sheetName] = [];
                return dst;
            },
            {}
        );

        let iCell = 0;

        treesheetModel.openRows.every((row, cellRow) => {
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

        return treesheetModel.sheetNames.filter(sheetName => cellsBySheet[sheetName].length > 0).map(sheetName => {
            let sheet = treesheetModel.sheetsByName[sheetName];
            // Render grid div
            let widths = sheet.type.columns.reduce((dest, col) => {
                dest.push(`${this.props.gridSpacingWidth}px`, col.width);
                return dest;
            }, []).join(" ");
            let indentWidth = `${gridSpacingWidth}px ${sheet.path.length * indentPixels}px`;

            return (
                <div
                    id={sheetName} key={sheetName}
                    className="Spreadsheet max_size"
                    style={{
                        ...getGridCellStyle(1, 1),
                        gridTemplateRows: `repeat(${treesheetModel.openRows.length}, ${rowHeight}px)`,
                        gridTemplateColumns: `${indentWidth} ${widths} ${gridSpacingWidth}px`,
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
        this.props.treesheetModel.updateSpreadsheetOpenRows();
        this.handleCellSelect(null, null, null);
        this.dropSelection();
    };

    dropSelection() {
        this.setTempValueByPath('updated', this.props.updated + 1);
        this.setTempValueByPath('selectedSheetName', null);
        this.setTempValueByPath('selectedRow', null);
        this.setTempValueByPath('selectedCol', null);
        this.setTempValueByPath('selectedPath', null);
    }

    saveEditValue(cellRow, cellCol) {
        let {treesheetModel, editValue} = this.props;

        let row = treesheetModel.openRows[cellRow];
        let sheet = treesheetModel.sheetsByName[row.sheetName];
        let columnPath = sheet.type.columns[cellCol].path;
        columnPath = Array.isArray(columnPath) ? columnPath : [columnPath];
        let path = [...row.path, ...columnPath];
        this.props.setValueByPath(path, editValue);
        row.values[cellCol] = editValue;
    }


}

Datasheet.defaultProps = {
    rowHeight: 50,
    indentPixels: 30,
    gridSpacingWidth: 5,
};

Datasheet.propTypes = {
    name: PropTypes.string.isRequired,
    treesheetModel: PropTypes.object.isRequired,
    rowHeight: PropTypes.number,
    indentPixels: PropTypes.number,
    gridSpacingWidth: PropTypes.number,
};

const mapStateToProps = (state, ownProps) => {
    return {
        types: state.drawing.types,
        dataTree: state.drawing.drawings,
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
        editValue: getValueByPath(state.tempValues.values, `${ownProps.name}/editValue`, null),
        selectedSheetName: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedSheetName`, null),
        selectedRow: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedRow`, null),
        selectedCol: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedCol`, null),
        selectedPath: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedPath`, null),
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
