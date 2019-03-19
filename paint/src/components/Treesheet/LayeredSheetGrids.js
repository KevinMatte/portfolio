/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React from 'react';
import PropTypes from 'prop-types'

import {getGridCellStyle, getValueByPath} from "../../general/Utils";
import Cell from "./Cell";

import './Treesheet.css'
import Drawing from "../../redux/actions/drawing";
import TempValues from "../../redux/actions/tempValues";
import {connect} from "react-redux";


function LayeredSheetGrids(props) {
    let {setTempValueByPath, name, selectedRow} = props;

    let setSheetPropValue = (field, value) => setTempValueByPath(`${name}/${field}`, value);

    let setEditValue = value => setSheetPropValue('editValue', value);

    let saveEditValue = (cellRow, cellCol) => {
        let {treesheetModel, editValue} = props;

        let row = treesheetModel.openRows[cellRow];
        let sheet = treesheetModel.sheetsByName[row.sheetName];
        let columnPath = sheet.type.columns[cellCol].path;
        columnPath = Array.isArray(columnPath) ? columnPath : [columnPath];
        let path = [...row.path, ...columnPath];
        props.setValueByPath(path, editValue);
        row.values[cellCol] = editValue;
    };

    let handleCellHover = (sheetName) => {
        if (selectedRow === null) {
            setSheetPropValue('selectedSheetName', sheetName);
        }
    };

    let handleCellSelect = (sheetName, cellRow, cellCol) =>
    {
        let {selectedRow, selectedCol, treesheetModel} = props;
        if (cellRow !== selectedRow || selectedCol !== cellCol) {
            if (selectedRow !== null && selectedCol != null) {
                saveEditValue(selectedRow, selectedCol);
            }
            if (cellRow != null && cellCol != null) {
                let row = treesheetModel.openRows[cellRow];
                let value = row.values[cellCol];
                setEditValue(value);
                setSheetPropValue('selectedSheetName', sheetName);
                setSheetPropValue('selectedRow', cellRow);
                setSheetPropValue('selectedCol', cellCol);

                let sheet = treesheetModel.sheetsByName[row.sheetName];
                let columnPath = sheet.type.columns[cellCol].path;
                columnPath = Array.isArray(columnPath) ? columnPath : [columnPath];
                let path = [...row.path, ...columnPath];
                setSheetPropValue('selectedPath', path);
            }
        }
    };

    let renderSheets = () =>
    {
        let {treesheetModel, selectedSheetName, selectedRow,
            selectedCol, editValue, gridSpacingWidth, indentPixels, rowHeight} = props;

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
                        <button onClick={() => toggleOpen(row)}>{symbol}</button>
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
                        setValue={value => setEditValue(value)}
                    />;
                } else {
                    cell = <Cell value={value}/>;
                }
                cells.push((
                    <div
                        key={++iCell}
                        style={getGridCellStyle(cellRow + 1, iCol++)}
                        className={cellClasses}
                        onMouseOver={() => handleCellHover(sheetName)}
                        onMouseUp={() => handleCellSelect(sheetName, cellRow, cellCol)}
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
                dest.push(`${gridSpacingWidth}px`, col.width);
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
    };

    let toggleOpen = (row) => {
        row.isOpen = !row.isOpen;
        props.treesheetModel.updateSpreadsheetOpenRows();
        handleCellSelect(null, null, null);
        dropSelection();
    };

    let dropSelection = () => {
        setSheetPropValue('updated', props.updated + 1);
        setSheetPropValue('selectedSheetName', null);
        setSheetPropValue('selectedRow', null);
        setSheetPropValue('selectedCol', null);
        setSheetPropValue('selectedPath', null);
    };

    return (
        <div className="max_size overflowAuto">
            <div
                className="SpreadsheetOverlay"
            >
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
)(LayeredSheetGrids)
