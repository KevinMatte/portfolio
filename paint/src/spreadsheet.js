/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import Drawing from "./redux/actions/drawing";

class Spreadsheet extends Component {

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
            hoverType: null,
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
        if (!spreadsheet.sheetsByName.hasOwnProperty(typeName)) {
            spreadsheet.sheetsByName[typeName] = {
                typeName,
                type,
            };
            spreadsheet.typeNames.push(typeName);
        }
        spreadsheet.rows.push({
            typeName,
            columns,
            indent,
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
            typeNames: [],
            rows: [],
            numColumns: 0,
            columns: [],
        };
        this.createRows(this.props, spreadsheet, this.props.drawings);

        let allSheetsStyle = {
            gridTemplateColumns: `repeat(${spreadsheet.numColumns}, 150px)`,
            gridTemplateRows: `repeat(${spreadsheet.rows.length + spreadsheet.typeNames.length}, ${this.rowHeight}px)`,
        };

        spreadsheet.typeNames.every((typeName => {
            let sheet = spreadsheet.sheetsByName[typeName];
            sheet.style = Object.assign({}, allSheetsStyle, this.sheetStyle);
            return sheet;
        }));

        return spreadsheet;
    }

    render() {
        let iSheet = 0;

        return (
            <div className="flexVDisplay max_size">
                <div
                    id={this.topDivId}
                    className="flexVStretched"
                    style={{position: "relative"}}
                >
                    {this.state.spreadsheet.typeNames.map(typeName => {
                        return this.renderSheet(iSheet, typeName);
                    })}
                </div>
                <div className="flexFixed">Controls</div>
            </div>
        );
    }

    handleHover = (typeName) => this.setState({hoverType: typeName});

    renderSheet(iSheet, typeName) {
        let iCell = 0;
        let spreadsheet = this.state.spreadsheet;
        let sheet = spreadsheet.sheetsByName[typeName];
        let sheetStyle = {...sheet.style};

        let cells = [];

        let iCol = 0;
        let {hoverType} = this.state;
        let showHeader = typeName === hoverType || (!hoverType && iSheet === 0);
        if (showHeader) {
            let style = Object.assign({}, this.rowHeaderStyle, {gridRow: 1, gridColumn: ++iCol});
            cells.push((
                <div key={++iCell} style={style}>
                    {typeName}
                </div>
            ));
            ++iCol; // Grid
        }

        let widths = sheet.type.columns.reduce((dest, col) => {
            dest.push(this.gridWidth, col.width);
            return dest;
        }, []);
        sheetStyle.gridTemplateColumns = `${this.headerColumnWidth}px ` + widths.join(" ");

        // Render header
        if (showHeader) {
            sheet.type.columns.every((column) => {
                let style = {...this.columnHeaderStyle, gridRow: 1, gridColumn: ++iCol};
                ++iCol; // Grid
                return cells.push((
                    <div key={++iCell} style={style}>
                        {column.label}
                    </div>
                ));
            });
        }

        let iRow = 1;
        spreadsheet.rows.every(row => {
            let iCol = 0;
            iRow++;
            if (row.typeName === typeName) {
                let style = {...this.rowHeaderStyle, gridRow: iRow, gridColumn: ++iCol};
                cells.push((
                    <div key={++iCell} style={style}>
                        {typeName}
                    </div>
                ));
                ++iCol; // Skip grid

                row.columns.every((column) => {
                    let style = {...this.valueStyle, gridRow: iRow, gridColumn: ++iCol};
                    iCol++; // Skip grid
                    return cells.push((
                        <div
                            key={++iCell}
                            style={style}
                            className="Cell yellowOnHover"
                            onMouseOver={() => this.handleHover(typeName)}
                        >
                            {column}
                        </div>
                    ));
                });
            }
            return cells;
        });

        return <div id={typeName} key={typeName} style={sheetStyle} className="Spreadsheet">
            {cells}
        </div>;
    }
}

Spreadsheet.propTypes = {
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
)(Spreadsheet)
