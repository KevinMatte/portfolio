/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/**
 * Used in Treesheet to display edit area.
 *
 * Layers a set of div's styled with grids.
 * Each grid has the layout for different child descendency levels of the tree.
 */


import React from 'react';
import PropTypes from 'prop-types'

import {getGridCellStyle, getValueByPath} from "../../general/Utils";
import Cell from "./Cell";

import './Treesheet.css'
import Drawing from "../../redux/drawing";
import TempValues from "../../redux/tempValues";
import {connect} from "react-redux";
import {BaseModel} from "../../core/BaseModel";

export class Model extends BaseModel {
    setSheetPropValue = (field, value) => this.props.setTempValueByPath(`${this.props.name}/${field}`, value);

    // Model to simplify paths to setTempValueByPath calls.
    setEditValue = value => this.setSheetPropValue('editValue', value);

    // Determine row and path of cell.
    getRowAndPath = (cellRow, cellCol) => {
        let {rowModel} = this.props;

        let row = rowModel.openRows[cellRow];
        let sheet = rowModel.sheetsByName[row.sheetName];
        let columnPath = sheet.type.columns[cellCol].path;
        columnPath = Array.isArray(columnPath) ? columnPath : [columnPath];
        let path = [...row.path, ...columnPath];

        return {row, path};
    };

    // Saves the current value of the selected cell.
    saveEditValue = (cellRow, cellCol) => {
        let {editValue, setValueByPath} = this.props;

        // Update external and internal values.
        let {row, path} = this.getRowAndPath(cellRow, cellCol);
        setValueByPath(path, editValue);
        row.values[cellCol] = editValue;
    };

    // Show sheet by cell's hover if there's no selection.
    handleCellHover = (sheetName) => {
        if (this.props.selectedRow === null) {
            this.setSheetPropValue('selectedSheetName', sheetName);
        }
    };

    // Updates selection, cell and saves any changed value.
    handleCellSelect = (sheetName, cellRow, cellCol) => {
        let {selectedRow, selectedCol} = this.props;
        if (cellRow !== selectedRow || selectedCol !== cellCol) {
            if (selectedRow !== null && selectedCol != null) {
                this.saveEditValue(selectedRow, selectedCol);
            }
            if (cellRow != null && cellCol != null) {
                let {row, path} = this.getRowAndPath(cellRow, cellCol);
                let value = row.values[cellCol];
                this.setEditValue(value);
                this.setSheetPropValue('selectedSheetName', sheetName);
                this.setSheetPropValue('selectedRow', cellRow);
                this.setSheetPropValue('selectedCol', cellCol);
                this.setSheetPropValue('selectedPath', path);
            }
        }
    };

    // +/- <button/>  click handler for opening/closing a row's sub-row contents.
    toggleOpen = (row) => {
        let {rowModel} = this.props;

        row.isOpen = !row.isOpen;
        rowModel.updateSpreadsheetOpenRows();
        this.handleCellSelect(null, null, null);
        this.dropSelection();
    };

    // Clears currently selected row.
    dropSelection = () => {
        let {updated} = this.props;
        this.setSheetPropValue('updated', updated + 1);
        this.setSheetPropValue('selectedSheetName', null);
        this.setSheetPropValue('selectedRow', null);
        this.setSheetPropValue('selectedCol', null);
        this.setSheetPropValue('selectedPath', null);
    };
}

export function LayeredSheetGrids(props) {
    let model = new Model(props);

    // Returns an object keyed by sheet name with arrays of <Cell/>'s properly styled for their CSS grid.
    // Includes:
    //   <button/>'s for opening and collapsing rows.
    //   <div/>'s with shading to display selection.
    function renderCellsBySheet() {
        const dataCellCol = 4; // Leftmost data cell grid column. Skips: spacing, indent, spacing.
        let {rowModel, selectedSheetName, selectedRow, selectedCol, editValue} = props;

        // cellsBySheet contains an array of cells with arrays keyed by sheet name.
        let cellsBySheet = {};
        rowModel.sheetNames.forEach(name => cellsBySheet[name] = []);

        let iCell = 0;
        rowModel.openRows.every((row, cellRow) => {
            let sheetName = row.sheetName;
            let cells = cellsBySheet[row.sheetName];

            // Add <button/>'s for opening and collapsing rows.
            if (row.hasOwnProperty('isOpen')) {
                let symbol = row.isOpen ? "-" : "+";
                cells.push((
                    <div
                        className="middleText"
                        key={++iCell}
                        style={getGridCellStyle(cellRow + 1, 2)}

                    >
                        <button data-testid={row.path} onClick={() => model.toggleOpen(row)}>{symbol}</button>
                    </div>));
            }


            // Add <div/>'s with shading to display selection.
            if (selectedCol !== null && sheetName === selectedSheetName) {
                let i = 2 * selectedCol + dataCellCol;
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

            // Add <Cell/>'s for values
            let iCol = dataCellCol; // Skip first grid.
            row.values.every((value, cellCol) => {

                let isSelected = (cellRow === selectedRow && selectedCol === cellCol);
                let cellClasses = "ValueCell Cell middleText";
                let cell;
                let dataTestId = `${row.path}:${cellCol}`;
                if (isSelected) {
                    cell = <Cell
                        dataTestId={dataTestId}
                        doEdit={isSelected}
                        value={editValue}
                        setValue={value => model.setEditValue(value)}
                    />;
                } else {
                    cell = <Cell dataTestId={dataTestId} value={value}/>;
                }
                cells.push((
                    <div
                        key={++iCell}
                        style={getGridCellStyle(cellRow + 1, iCol)}
                        className={cellClasses}
                        onMouseOver={() => model.handleCellHover(sheetName)}
                        onMouseUp={() => model.handleCellSelect(sheetName, cellRow, cellCol)}
                    >
                        {cell}
                    </div>
                ));
                iCol += 2;
                return true;
            });
            return true;
        });

        // Return only non-empty cell arrays (keyed by sheet name).
        let filteredCellsBySheet = {};
        Object.entries(cellsBySheet).forEach(([n, v]) => {
            if (v.length > 0) filteredCellsBySheet[n] = v
        });
        return filteredCellsBySheet;
    }

    // Returns an array of <div/>'s with CSS grids each for displaying a indent level of the tree.
    function renderSheets() {
        let {rowModel, gridSpacingWidth, indentPixels, rowHeight} = props;
        let cellsBySheet = renderCellsBySheet();

        return Object.entries(cellsBySheet).map(([sheetName, sheetCells]) => {

            let sheet = rowModel.sheetsByName[sheetName];

            // Setup column placements with grid spacing
            let spacing = `${gridSpacingWidth}px`;
            let widths = sheet.type.columns.map(col => `${col.width}`).join(` ${spacing} `);
            let indentWidth = sheet.path.length * indentPixels;

            // Render grid div
            return (
                <div
                    id={sheetName} key={sheetName}
                    className="Spreadsheet max_size"
                    style={{
                        ...getGridCellStyle(1, 1),
                        gridTemplateRows: `repeat(${rowModel.openRows.length}, ${rowHeight}px)`,
                        gridTemplateColumns: `${spacing} ${indentWidth}px ${spacing} ${widths} ${spacing}`,
                    }}
                >
                    {sheetCells}
                </div>);
        });
    };

    return (
        <div className="max_size overflowAuto">
            <div className="SpreadsheetOverlay">
                {renderSheets()}
            </div>
        </div>
    );
}

LayeredSheetGrids.defaultProps = {
    rowHeight: 50,
    indentPixels: 30,
    gridSpacingWidth: 5,
};

LayeredSheetGrids.propTypes = {
    name: PropTypes.string.isRequired,
    rowModel: PropTypes.object.isRequired,
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
)(LayeredSheetGrids)
