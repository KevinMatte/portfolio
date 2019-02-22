/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import Drawing from "./redux/actions/drawing";
import {getValueByPath} from "./general/Utils";
import Cell from "./Cell";
import TempValues from "./redux/actions/tempValues";


class Treesheet extends Component {

    constructor(props) {
        super(props);

        this.topDivId = "TopDiv";
        this.gridStyle = {
            display: "grid",
            gridGap: "0px",
        };
        this.pointerEvents = {
            pointerEvents: "none",
        };

        this.cellStyle = {
            padding: "1em",
            pointerEvents: "auto",
        };
        this.headerStyle = {
            ...this.cellStyle,
            border: "1px solid black",
            backgroundColor: "lightgrey",
            padding: "1em",
            color: "#3F3AD9",
        };

        this.columnHeaderStyle = {
            ...this.headerStyle,
            textAlign: "center",
        };
        this.rowHeaderStyle = {
            ...this.headerStyle,
            textAlign: "right",
        };
        this.valueStyle = {
            ...this.cellStyle,
            border: "1px solid lightgrey",
            backgroundColor: "white",
        };
        this.indentPixels = 30;
        this.headerColumnWidth = 150;
        this.rowHeight = 50;
        this.gridWidth = "5px";


        this.state = {
            selectedSheetName: null,
            selectedRow: null,
            selectedCol: null,
            spreadsheet: Treesheet.createSpreadsheet(props),
            updated: 0,
        }
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let spreadsheet = !!prevState.spreadsheet ? prevState.spreadsheet : Treesheet.createSpreadsheet(nextProps);
        return {spreadsheet }
    }

    static createRow(props, spreadsheet, obj, path) {

        let typeName = obj['type'];
        if (!typeName || !props.types.hasOwnProperty(typeName))
            typeName = obj['table'];
        let type = props.types[typeName];
        if (!type)
            return;

        let sheetName = `${typeName}_${path.length}`;

        let values = type.columns.map(column => {
            return getValueByPath(obj, column.path);
        });
        spreadsheet.numColumns = Math.max(spreadsheet.numColumns, type.columns.length);
        if (!spreadsheet.sheetsByName.hasOwnProperty(sheetName)) {
            spreadsheet.sheetsByName[sheetName] = {
                typeName,
                sheetName,
                path,
                type,
            };
            spreadsheet.sheetNames.push(sheetName);
        }
        let row = {
            typeName,
            sheetName,
            values,
            path,
        };
        spreadsheet.rows.push(row);

        if (type.hasOwnProperty('fields')) {
            type.fields.every((key) => {
                Treesheet.createRows(props, spreadsheet, [obj[key]], [...path, key]);
                row.isOpen = true;
                return true;
            })
        }

        if (type.hasOwnProperty('arrays')) {
            type.arrays.every((key) => {
                Treesheet.createRows(props, spreadsheet, obj[key], [...path, key]);
                row.isOpen = true;
                return true;
            })
        }
    }

    static createRows(props, spreadsheet, aList, path = []) {
        aList.every((obj, iObj) => {
            Treesheet.createRow(props, spreadsheet, obj, [...path, iObj]);
            return obj;
        });
    }

    static createSpreadsheet(props) {

        let spreadsheet = {
            sheetsByName: {},
            sheetNames: [],
            rows: [],
            numColumns: 0,
            columns: [],
        };

        Treesheet.createRows(props, spreadsheet, props.dataTree);
        Treesheet.updateSpreadsheetOpenRows(spreadsheet);

        return spreadsheet;
    }

    static updateSpreadsheetOpenRows(spreadsheet) {
        let openIndent = -1;
        spreadsheet.openRows = spreadsheet.rows.filter((row) => {
            let indent = row.path.length;
            if (openIndent != -1 && indent > openIndent)
                return false;
            if (indent === openIndent)
                openIndent = -1;
            if (!row.isOpen)
                openIndent = indent;
            return true;
        });
    }

    handleScroll = (event) => {
        let bodyDiv = event.target;

        let topDiv = bodyDiv;
        for (; topDiv && topDiv !== document; topDiv = topDiv.parentNode) {
            if (topDiv.id === this.topDivId)
                break;
        }
        if (topDiv !== document) {
            let {scrollTop, scrollLeft} = bodyDiv;
            let rowHeadersDivs = topDiv.getElementsByClassName("rowHeaders");
            if (rowHeadersDivs)
                rowHeadersDivs[0].scrollTop = scrollTop;
            let columnHeadersDivs = topDiv.getElementsByClassName("columnHeaders");
            if (columnHeadersDivs)
                columnHeadersDivs[0].scrollLeft = scrollLeft;
        }
    };


    renderColRowHeader() {
        // Render grid header
        let spreadsheet = this.state.spreadsheet;
        let sheetName = this.state.selectedSheetName || spreadsheet.sheetNames[0];
        let sheet = spreadsheet.sheetsByName[sheetName];
        let sheetStyle = {
            ...this.gridStyle,
            gridTemplateColumns: `${this.headerColumnWidth}px`,
            gridTemplateRows: `${this.rowHeight}px`,
        };

        let style = {
            ...this.rowHeaderStyle,
            gridArea: "1 / 1 / 1 / 1",
        };
        return (
            <div style={sheetStyle} className="Spreadsheet">
                <div style={style}>{sheet.typeName}</div>
            </div>);
    }

    renderColumnHeaders() {
        // Render grid header
        let {spreadsheet, selectedSheetName, selectedCol} = this.state;
        let sheet = spreadsheet.sheetsByName[selectedSheetName || spreadsheet.sheetNames[0]];

        let cells = [];
        let iCell = 0;
        let iCol = 4;
        sheet.type.columns.every((column, iColumn) => {
            let style = {...this.columnHeaderStyle, gridRow: "1 / 1", gridColumn: iCol++};
            iCol++; // Grid
            cells.push((
                <div key={++iCell} style={style} className={iColumn === selectedCol ? "selectedHeader" : ""}>
                    {column.label}
                </div>
            ));
            return true;
        });

        let indentWidth = `${this.gridWidth} ${sheet.path.length * this.indentPixels}px`;
        let widths = sheet.type.columns.reduce((dest, col) => {
            dest.push(this.gridWidth, col.width);
            return dest;
        }, []);
        let sheetStyle = {
            ...this.gridStyle,
            gridTemplateColumns: `${indentWidth} ` + widths.join(" "),
            gridTemplateRows: `${this.rowHeight}px`,
        };

        return (
            <div style={sheetStyle} className="Spreadsheet">
                {cells}
            </div>);
    }

    renderRowHeaders() {
        // Render grid div

        let {selectedRow, spreadsheet} = this.state;
        let sheetStyle = {
            ...this.gridStyle,
            gridTemplateColumns: `${this.headerColumnWidth}px`,
            gridTemplateRows: `repeat(${spreadsheet.rows.length}, ${this.rowHeight}px)`,
        };
        let cells = [];
        let iCell = 0;
        spreadsheet.openRows.every((row, cellRow) => {
            let sheet = spreadsheet.sheetsByName[row.sheetName];
            let style = {...this.rowHeaderStyle, gridRow: `${cellRow + 1} / ${cellRow + 1}`, gridColumn: 1};
            cells.push((
                <div key={++iCell} style={style} className={cellRow === selectedRow ? "selectedHeader" : ""}>
                    {sheet.typeName}
                </div>
            ));
            return true;
        });

        return (
            <div style={sheetStyle} className="Spreadsheet">
                {cells}
            </div>);
    }

    render() {
        return (
            <div
                id={this.topDivId}
                className="flexVDisplay flexHStretched max_size"

            >

                <div className="flexVStretched flexVDisplay" style={{overflow: "hidden"}}>
                    <div className="flexFixed flexHDisplay">
                        <div className="flexFixed">
                            {this.renderColRowHeader()}
                        </div>
                        <div className="flexHStretched columnHeaders" style={{overflow: "hidden"}}>
                            {this.renderColumnHeaders()}
                        </div>
                    </div>
                    <div className="flexVStretched flexHDisplay">
                        <div className="flexFixed rowHeaders" style={{overflow: "hidden"}}>
                            {this.renderRowHeaders()}
                        </div>
                        <div className="flexHStretched" style={{overflow: "auto"}}>
                            <div
                                className="max_size"
                                style={{
                                    ...this.gridStyle,
                                    gridTemplateRows: "1fr",
                                    gridTemplateColumns: "1fr",
                                    overflow: "auto",
                                }}
                                onScroll={(event) => this.handleScroll(event)}
                            >
                                {this.renderDataCells()}
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="flexFixed">
                    <button onClick={() => console.log("kevin")}>+</button>
                    ControlsControlsControlsControlsControlsControlsControlsControlsControlsControls
                </div>
            </div>
        );
    }

    toggleOpen = (row) => {
        row.isOpen = !row.isOpen;
        Treesheet.updateSpreadsheetOpenRows(this.state.spreadsheet);
        this.setState({updated: this.state.updated + 1});
    };

    renderDataCells() {
        let {spreadsheet, selectedSheetName, selectedRow, selectedCol} = this.state;

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
                        className="Cell middleText"
                        key={++iCell}
                        style={{
                            pointerEvents: "auto",
                            gridArea: `${cellRow + 1} / 2 / ${cellRow + 1} / 2`,
                        }}

                    >
                        <button onClick={() => this.toggleOpen(row)}>{symbol}</button>
                    </div>));

            }


            // Display borders on selected column.
            if (selectedCol !== null && sheetName === selectedSheetName) {
                let i = 2 * selectedCol + 4;
                let leftStyle = {gridArea: `${cellRow + 1} / ${i - 1} / ${cellRow + 1} / ${i - 1}`};
                cells.push((
                    <div
                        key={++iCell}
                        style={leftStyle}
                        className="selectedGrid"
                    >
                    </div>));
                let rightStyle = {gridArea: `${cellRow + 1} / ${i + 1} / ${cellRow + 1} / ${i + 1}`};
                cells.push((
                    <div
                        key={++iCell}
                        style={rightStyle}
                        className="selectedGrid"
                    >
                    </div>));
            }

            let iCol = 4; // Skip first grid.
            row.values.every((value, cellCol) => {

                let style = {...this.valueStyle, gridRow: `${cellRow + 1} / ${cellRow + 1}`, gridColumn: iCol++};
                iCol++;
                let isSelected = (cellRow === selectedRow && selectedCol === cellCol);
                let cellClasses = isSelected ? "Cell selectedCell" : "Cell yellowOnHover";
                let cell;
                if (isSelected) {
                    cell = <Cell
                        doEdit={isSelected}
                        value={this.props.editValue}
                        setValue={value => this.setEditValue(value)}
                    />;
                } else {
                    cell = <Cell value={value}/>;
                }
                cells.push((
                    <div
                        key={++iCell}
                        style={style}
                        className={cellClasses}
                        onMouseOver={() => this.handleCellHover(sheetName)}
                        onMouseUp={() => this.handleCellSelect(sheetName, cellRow, cellCol)}
                    >
                        {cell}
                    </div>
                ));
                return true;
            });
            return true;
        });

        return spreadsheet.sheetNames.filter(sheetName => cellsBySheet[sheetName].length > 0).map(sheetName => {
            let sheet = spreadsheet.sheetsByName[sheetName];
            // Render grid div
            let widths = sheet.type.columns.reduce((dest, col) => {
                dest.push(this.gridWidth, col.width);
                return dest;
            }, []).join(" ");
            let indentWidth = `${this.gridWidth} ${sheet.path.length * this.indentPixels}px`;

            return (
                <div id={sheetName} key={sheetName} className="Spreadsheet"
                     style={{
                         ...this.pointerEvents,
                         gridArea: "1 / 1 / 1 / 1",

                     }}
                >
                    <div
                        className="max_size"
                        style={{
                            ...this.gridStyle,
                            gridTemplateRows: `repeat(${spreadsheet.rows.length}, ${this.rowHeight}px)`,
                            gridTemplateColumns: `${indentWidth} ${widths} ${this.gridWidth}`,
                        }}
                    >
                        {cellsBySheet[sheetName]}
                    </div>
                </div>);
        });
    }

    setEditValue = value => this.props.setTempValueByPath(this.props.name, value);

    handleCellSelect(sheetName, cellRow, cellCol) {
        let {selectedRow, selectedCol} = this.state;
        if (cellRow !== selectedRow || selectedCol !== cellCol) {
            if (selectedRow != null) {
                this.saveEditValue(selectedRow, selectedCol);
            }
            if (cellRow != null) {
                let value = this.state.spreadsheet.rows[cellRow].values[cellCol];
                this.setEditValue(value);
                this.setState({selectedSheetName: sheetName, selectedRow: cellRow, selectedCol: cellCol});
            }
        }
    }

    saveEditValue(cellRow, cellCol) {
        let row = this.state.spreadsheet.rows[cellRow];
        let sheet = this.state.spreadsheet.sheetsByName[row.sheetName];
        let columnPath = sheet.type.columns[cellCol].path;
        columnPath = Array.isArray(columnPath) ? columnPath : [columnPath];
        let path = [...row.path, ...columnPath];
        this.props.setValueByPath(path, this.props.editValue);
    }

    handleCellHover(sheetName) {
        let {selectedRow} = this.state;
        if (selectedRow === null) {
            this.setState({selectedSheetName: sheetName});
        }
    }
}

Treesheet.propTypes = {
    editValue: PropTypes.any,
    types: PropTypes.object.isRequired,
    dataTree: PropTypes.array.isRequired,
    setValueByPath: PropTypes.func.isRequired,
    setTempValueByPath: PropTypes.func.isRequired,
    name: PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    return {
        types: state.drawing.types,
        dataTree: state.drawing.drawings,
        editValue: getValueByPath(state.tempValues.values, ownProps.name),
    }
};

const mapDispatchToProps = {
    setValueByPath: Drawing.setValueByPath,
    setTempValueByPath: TempValues.setValueByPath,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Treesheet)
