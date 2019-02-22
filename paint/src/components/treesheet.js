/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import {connect} from "react-redux";

import {getGridCellStyle, getValueByPath} from "../general/Utils";
import TreesheetModel from "../model/treesheet";
import DataSheet from './datasheet';

import './treesheet.css'

class Treesheet extends Component {

    constructor(props) {
        super(props);

        this.topDivId = "TopDiv";

        this.indentPixels = 30;
        this.headerColumnWidth = 150;
        this.rowHeight = 50;
        this.gridWidth = "5px";


        this.state = {
            spreadsheet: this.createSpreadsheet(props),
        }
    }

    createSpreadsheet = (props) => new TreesheetModel(props.name, props.types, props.dataTree);

    static getDerivedStateFromProps(nextProps, prevState) {
        let spreadsheet;
        if (!prevState.hasOwnProperty("spreadsheet") || prevState.spreadsheet.name !== nextProps.name)
            spreadsheet = this.createSpreadsheet(nextProps);
        else
            spreadsheet = prevState.spreadsheet;
        return {spreadsheet}
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
            gridTemplateColumns: `${this.headerColumnWidth}px`,
            gridTemplateRows: `${this.rowHeight}px`,
        };

        return (
            <div style={sheetStyle} className="Spreadsheet">
                <div className="SpreadsheetRowHeader" style={getGridCellStyle(1, 1)}>{sheet.typeName}</div>
            </div>);
    }

    renderColumnHeaders() {
        // Render grid header
        let {spreadsheet} = this.state;
        let {selectedSheetName, selectedCol} = this.props;
        let sheet = spreadsheet.sheetsByName[selectedSheetName || spreadsheet.sheetNames[0]];

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

        let indentWidth = `${this.gridWidth} ${sheet.path.length * this.indentPixels}px`;
        let widths = sheet.type.columns.reduce((dest, col) => {
            dest.push(this.gridWidth, col.width);
            return dest;
        }, []);
        let sheetStyle = {
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

        let {spreadsheet} = this.state;
        let {selectedRow} = this.props;
        let sheetStyle = {
            gridTemplateColumns: `${this.headerColumnWidth}px`,
            gridTemplateRows: `repeat(${spreadsheet.openRows.length}, ${this.rowHeight}px)`,
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
            <div style={sheetStyle} className="Spreadsheet max_size">
                {cells}
            </div>);
    }

    render() {
        return (
            <div
                id={this.topDivId}
                className="flexVDisplay flexHStretched max_size overflowHidden"

            >

                <div className="flexVStretched flexVDisplay">
                    <div className="flexFixed flexHDisplay">
                        <div className="flexFixed">
                            {this.renderColRowHeader()}
                        </div>
                        <div className="flexHStretched columnHeaders">
                            {this.renderColumnHeaders()}
                        </div>
                    </div>
                    <div className="flexVStretched flexHDisplay">
                        <div className="flexFixed rowHeaders">
                            {this.renderRowHeaders()}
                        </div>
                        <div className="flexHStretched overflowAuto">
                            <div
                                className="SpreadsheetScrollArea max_size"
                                style={{
                                    overflow: "auto",
                                }}
                                onScroll={(event) => this.handleScroll(event)}
                            >
                                <DataSheet
                                    name={this.props.name}
                                    spreadsheet={this.state.spreadsheet}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="flexFixed">
                    <button onClick={() => console.log("kevin")}>+</button>
                    Controls TBD.
                </div>
            </div>
        );
    }

}

Treesheet.defaultProps = {
    updated: 0,
};

Treesheet.propTypes = {
    types: PropTypes.object.isRequired,
    dataTree: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    updated: PropTypes.number,
    selectedSheetName: PropTypes.string,
    selectedRow: PropTypes.number,
    selectedCol: PropTypes.number,
};

const mapStateToProps = (state, ownProps) => {
    return {
        types: state.drawing.types,
        dataTree: state.drawing.drawings,
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
        selectedSheetName: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedSheetName`, null),
        selectedRow: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedRow`, null),
        selectedCol: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedCol`, null),
    }
};

const mapDispatchToProps = {
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Treesheet)
