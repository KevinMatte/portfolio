/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import Drawing from "./redux/actions/drawing";

class Treesheet extends Component {

    constructor(props) {
        super(props);

        this.topDivId = "TopDiv";
        this.sheetStyle = {
            display: "grid",
            gridGap: "0px",
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

        Object.keys(obj).every(key => {
            let value = obj[key];
            if (Array.isArray(value)) {
                this.createRows(props, spreadsheet, value, indent + 1);
            } else if (value.hasOwnProperty('table')) {
                this.createRows(props, spreadsheet, [value], indent + 1);
            }
            return key;
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
        this.createRows(this.props, spreadsheet, this.props.drawings);

        let allSheetsStyle = {
            gridTemplateColumns: `repeat(${spreadsheet.numColumns}, 150px)`,
            gridTemplateRows: `repeat(${spreadsheet.rows.length + 1}, ${this.rowHeight}px)`,
        };

        spreadsheet.sheetNames.every((sheetName => {
            let sheet = spreadsheet.sheetsByName[sheetName];
            sheet.style = Object.assign({}, allSheetsStyle, this.sheetStyle);
            return sheet;
        }));

        return spreadsheet;
    }

    render() {
        return (
            <div className="flexVDisplay max_size">
                <div
                    id={this.topDivId}
                    className="flexVStretched"
                    style={{position: "relative"}}
                >
                    {this.state.spreadsheet.sheetNames.map(sheetName => {
                        return this.renderSheet(sheetName);
                    })}
                </div>
                <div className="flexFixed">Controls</div>
            </div>
        );
    }

    renderSheet(sheetName) {
        let {selectedSheet, selectedRow, selectedCol} = this.state;

        let iCell = 0;
        let spreadsheet = this.state.spreadsheet;
        let sheet = spreadsheet.sheetsByName[sheetName];

        let cells = [];

        // Render column header labels
        let isSelectedSheet = sheetName === selectedSheet || (!selectedSheet && spreadsheet.sheetNames[0] === sheetName);
        if (isSelectedSheet) {
            // 1st column
            let style = Object.assign({}, this.rowHeaderStyle, {gridRow: 1, gridColumn: 1});
            cells.push((
                <div key={++iCell} style={style}>
                    {sheet.typeName}
                </div>
            ));

            // column labels
            let iCol = 5;
            sheet.type.columns.every((column, cellCol) => {
                let style = {...this.columnHeaderStyle, gridRow: 1, gridColumn: iCol++};
                iCol++; // Grid
                return cells.push((
                    <div key={++iCell} style={style} className={cellCol === selectedCol ? "selectedHeader" : ""}>
                        {column.label}
                    </div>
                ));
            });
        }

        let iRow = 1;
        spreadsheet.rows.every((row, cellRow) => {
            iRow++;
            if (row.sheetName === sheetName) {
                let style = {...this.rowHeaderStyle, gridRow: iRow, gridColumn: 1};
                cells.push((
                    <div key={++iCell} style={style} className={cellRow === selectedRow ? "selectedHeader" : ""}>
                        {sheet.typeName}
                    </div>
                ));

                let iCol = 4;
                row.columns.every((column, cellCol) => {
                    let hasSelectedCol = selectedCol !== null
                        && sheetName === selectedSheet
                        && (selectedCol === cellCol || selectedCol+1 === cellCol);
                    if (hasSelectedCol) {
                        cells.push((
                        <div
                            key={++iCell}
                            style={{gridRow: iRow, gridColumn: iCol}}
                            className="selectedGrid"
                        >
                        </div>));
                    }
                    iCol++; // Skip grid

                    let style = {...this.valueStyle, gridRow: iRow, gridColumn: iCol++};
                    let cellClasses = (cellRow === selectedRow && selectedCol === cellCol) ?
                        "Cell selectedCell" : "Cell yellowOnHover";
                    return cells.push((
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
                });
            }
            return cells;
        });

        // Render grid div
        let widths = sheet.type.columns.reduce((dest, col) => {
            dest.push(this.gridWidth, col.width);
            return dest;
        }, []);
        let indentWidth = sheet.indent > 0 ? `${this.gridWidth} ${sheet.indent * this.indentPixels}px` : '0px 0px';
        let sheetStyle = {...sheet.style};
        sheetStyle.gridTemplateColumns = `${this.headerColumnWidth}px ${indentWidth} ` + widths.join(" ");
        return <div id={sheetName} key={sheetName} style={sheetStyle} className="Spreadsheet">
            {cells}
        </div>;
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
