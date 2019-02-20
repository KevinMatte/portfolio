/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import Drawing from "./redux/actions/drawing";

class Treesheet extends Component {

    constructor(props) {
        super(props);

        this.topDivId = "TopDiv";
        this.gridStyle = {
            display: "grid",
            gridGap: "0px",
        };
        this.sheetStyle = {
            ...this.gridStyle,
            position: "absolute",
            pointerEvents: "none",
        };

        this.cellStyle = {
            padding: "1em",
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
            pointerEvents: "auto",
        };
        this.indentPixels = 30;
        this.headerColumnWidth = 150;
        this.rowHeight = 50;
        this.gridWidth = "5px";


        this.state = {
            selectedSheet: null,
            selectedRow: null,
            selectedCol: null,
            spreadsheet: this.createSpreadsheet(props),
        }
    }

    // noinspection JSUnusedLocalSymbols
    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            spreadsheet: this.createSpreadsheet(nextProps),
        })
    }

    createRow(props, spreadsheet, obj, indent = 0) {

        let typeName = obj['type'];
        if (!typeName || !props.types.hasOwnProperty(typeName))
            typeName = obj['table'];
        let type = props.types[typeName];
        if (!type)
            return;

        let sheetName = indent === 0 ? typeName : `${typeName}_${indent}`;

        let columns = type.columns.map(column => {
            let {field} = column;
            if (Array.isArray(field)) {
                return field.reduce((dst, name) => {
                    return dst[name]
                }, obj);
            } else {
                return obj[field];
            }
        });
        spreadsheet.numColumns = Math.max(spreadsheet.numColumns, type.columns.length);
        if (!spreadsheet.sheetsByName.hasOwnProperty(sheetName)) {
            spreadsheet.sheetsByName[sheetName] = {
                typeName,
                sheetName,
                indent,
                type,
            };
            spreadsheet.sheetNames.push(sheetName);
        }
        spreadsheet.rows.push({
            typeName,
            sheetName,
            columns,
        });

        Object.keys(obj).every((key) => {
            let value = obj[key];
            if (Array.isArray(value)) {
                this.createRows(props, spreadsheet, value, indent + 1);
            } else if (value.hasOwnProperty('table')) {
                this.createRows(props, spreadsheet, [value], indent + 1);
            }
            return true;
        });
    }

    createRows(props, spreadsheet, aList, indent = 0) {
        aList.every(obj => {
            this.createRow(props, spreadsheet, obj, indent);
            return obj;
        });
    }

    createSpreadsheet(props) {
        let spreadsheet = {
            sheetsByName: {},
            sheetNames: [],
            rows: [],
            numColumns: 0,
            columns: [],
        };
        this.createRows(props, spreadsheet, props.drawings);

        return spreadsheet;
    }

    verticalSync = () => {
        let topDiv = document.getElementById(this.topDivId);
        let pos = topDiv.getElementById("rowHeaders").scrollTop;
        document.getElementById("table-scroll-employees").scrollTop = pos;
    };

    horizontalSync = () => {
        let topDiv = document.getElementById(this.topDivId);
        let pos = topDiv.getElementById("columnHeaders").scrollLeft;
        document.getElementById("table-scroll-employees").scrollLeft = pos;
    };

    renderColRowHeader() {
        // Render grid header
        let spreadsheet = this.state.spreadsheet;
        let sheetName = this.state.selectedSheet || spreadsheet.sheetNames[0];
        let sheet = spreadsheet.sheetsByName[sheetName];
        let sheetStyle = {
            ...this.gridStyle,
            gridTemplateColumns: `${this.headerColumnWidth}px`,
            gridTemplateRows: `${this.rowHeight}px`,
        };

        let style = {
            ...this.rowHeaderStyle,
            gridRow: 1,
            gridColumn: 1,
        };
        return (
            <div id="columnHeaders" key={sheetName} style={sheetStyle} className="Spreadsheet">
                <div style={style}>{sheet.typeName}</div>
            </div>);
    }

    renderColumnHeaders() {
        // Render grid header
        let {spreadsheet, selectedSheet, selectedCol} = this.state;
        let sheet = spreadsheet.sheetsByName[selectedSheet || spreadsheet.sheetNames[0]];

        let cells = [];
        let iCell = 0;
        let iCol = 4;
        sheet.type.columns.every((column, cellCol) => {
            let style = {...this.columnHeaderStyle, gridRow: 1, gridColumn: iCol++};
            iCol++; // Grid
            cells.push((
                <div key={++iCell} style={style} className={cellCol === selectedCol ? "selectedHeader" : ""}>
                    {column.label}
                </div>
            ));
            return true;
        });

        let indentWidth = sheet.indent > 0 ? `${this.gridWidth} ${sheet.indent * this.indentPixels}px` : '0px 0px';
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
            <div id="columnHeaders" style={sheetStyle} className="Spreadsheet">
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
        spreadsheet.rows.every((row, cellRow) => {
            let sheet = spreadsheet.sheetsByName[row.sheetName];
            let style = {...this.rowHeaderStyle, gridRow: cellRow + 1, gridColumn: 1};
            cells.push((
                <div key={++iCell} style={style} className={cellRow === selectedRow ? "selectedHeader" : ""}>
                    {sheet.typeName}
                </div>
            ));
            return true;
        });

        return (
            <div id="rowHeaders" style={sheetStyle} className="Spreadsheet">
                {cells}
            </div>);
    }

    render() {
        return (
            <div
                id={this.topDivId}
                className="flexVDisplay max_size">
                <div className="flexVStretched" style={{
                    ...this.gridStyle,
                    gridTemplateColumns: `${this.headerColumnWidth}px 1fr`,
                    gridTemplateRows: `${this.rowHeight}px 1fr`,
                }}>
                    <div style={{gridRow: "1", gridCol: "1"}}>
                        {this.renderColRowHeader()}
                    </div>
                    <div style={{gridRow: "1", gridCol: "2"}}>
                        {this.renderColumnHeaders()}
                    </div>
                    <div style={{gridRow: "2", gridCol: "1"}}>
                        {this.renderRowHeaders()}
                    </div>
                    <div style={{gridRow: "2", gridCol: "2"}}>
                        {this.renderDataCells()}
                    </div>
                </div>
                <div className="flexFixed">Controls</div>
            </div>
        );
    }

    renderDataCells() {
        let {spreadsheet, selectedSheet, selectedRow, selectedCol} = this.state;

        let cellsBySheet = spreadsheet.sheetNames.reduce((dst, sheetName) => {
            dst[sheetName] = [];
            return dst;
        }, {});

        let iCell = 0;

        spreadsheet.rows.every((row, cellRow) => {
            let sheetName = row.sheetName;
            let cells = cellsBySheet[row.sheetName];
            let iCol = 3;
            row.columns.every((column, cellCol) => {
                let hasSelectedCol = selectedCol !== null
                    && sheetName === selectedSheet
                    && (selectedCol === cellCol || selectedCol + 1 === cellCol);
                if (hasSelectedCol) {
                    cells.push((
                        <div
                            key={++iCell}
                            style={{gridRow: cellRow + 1, gridColumn: iCol}}
                            className="selectedGrid"
                        >
                        </div>));
                }
                iCol++; // Skip grid

                let style = {...this.valueStyle, gridRow: cellRow + 1, gridColumn: iCol++};
                let cellClasses = (cellRow === selectedRow && selectedCol === cellCol) ?
                    "Cell selectedCell" : "Cell yellowOnHover";
                cells.push((
                    <div
                        key={++iCell}
                        style={style}
                        className={cellClasses}
                        onMouseOver={() => this.handleCellHover(sheetName)}
                        onMouseUp={() => this.handleCellSelect(sheetName, cellRow, cellCol)}
                    >
                        {column}
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
            }, []);
            let indentWidth = sheet.indent > 0 ? `${this.gridWidth} ${sheet.indent * this.indentPixels}px` : '0px 0px';
            let sheetStyle = {
                ...this.sheetStyle,
                gridTemplateRows: `repeat(${spreadsheet.rows.length}, ${this.rowHeight}px)`,
                gridTemplateColumns: `${indentWidth} ` + widths.join(" "),
            };

            return (
                <div id={sheetName} key={sheetName} style={sheetStyle} className="Spreadsheet">
                    {cellsBySheet[sheetName]}
                </div>);
        });
    }

    handleCellSelect(sheetName, cellRow, cellCol) {
        let {selectedRow, selectedCol} = this.state;
        if (cellRow != null && cellRow === selectedRow && selectedCol === cellCol)
            this.setState({selectedSheet: null, selectedRow: null, selectedCol: null});
        else
            this.setState({selectedSheet: sheetName, selectedRow: cellRow, selectedCol: cellCol});
    }

    handleCellHover(sheetName) {
        let {selectedRow} = this.state;
        if (selectedRow === null) {
            this.setState({selectedSheet: sheetName});
            console.log('hover');
        }
    }
}

Treesheet.propTypes = {
    types: PropTypes.object.isRequired,
    drawings: PropTypes.array.isRequired,
    addGraph: PropTypes.func.isRequired,
};

const mapStateToProps = (state /*, ownProps*/) => {
    return {
        types: state.drawing.types,
        drawings: state.drawing.drawings,
    }
};

const mapDispatchToProps = {
    addGraph: Drawing.addGraph,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Treesheet)
