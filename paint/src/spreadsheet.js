import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import Drawing from "./redux/actions/drawing";

class Spreadsheet extends Component {

    constructor(props) {
        super(props);

        this.state = {
            spreadsheet: this.createSpreadsheet(props),
        }
    }

    componentWillReceiveProps(nextProps, nextContext) {
        this.setState({
            spreadsheet: this.createSpreadsheet(nextProps),
        })
    }

    createRow(props, spreadsheet, obj) {

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
        spreadsheet.types[typeName] = true;
        spreadsheet.rows.push({
            typeName,
            columns,
        });

        Object.keys(obj).every(key => {
            let value = obj[key];
            if (Array.isArray(value)) {
                this.createRows(props, spreadsheet, value);
            } else if (value.hasOwnProperty('table')) {
                this.createRows(props, spreadsheet, [value]);
            }
            return key;
        });
    }

    createRows(props, spreadsheet, aList) {
        aList.every(obj => {
            this.createRow(props, spreadsheet, obj);
            return obj;
        });
    }

    createSpreadsheet(props) {
        let spreadsheet = {
            types: {},
            rows: [],
            numColumns: 0,
        };
        this.createRows(this.props, spreadsheet, this.props.drawings);
        return spreadsheet;
    }

    render() {
        let cellStyle = {
            border: "2px solid rgb(233,171,88)",
            borderRadius: "5px",
            backgroundColor: "rgba(233,171,88,.125)",
            padding: "1em",
            color: "#d9480f",
        };
        let {spreadsheet} = this.state;

        let spreadsheetStyle = {
            display: "grid",
            gridTemplateColumns: `repeat(${spreadsheet.numColumns}, 150px)`,
            gridGap: "10px",
            gridTemplateRows: `repeat(${spreadsheet.rows.length}, 50px)`,
        };
        let iCell = 0;
        let iRow = 0;

        return (
            <div className="flexVDisplay max_size">
                <div className="flexVStretched" style={{display: "grid"}}>
                    <div style={spreadsheetStyle}>
                        {this.state.spreadsheet.rows.reduce((rows, row) => {
                            let iCol = 0;
                            iRow++;
                            row.columns.every((column) => {
                                let style = Object.assign({}, cellStyle, {gridRow: iRow, gridColumn: ++iCol});
                                return rows.push((
                                    <div key={++iCell} style={style}>
                                        {column}
                                    </div>
                                ));
                            });
                            return rows;
                        }, [])}
                    </div>
                </div>
                <div className="flexFixed">Controls</div>
            </div>
        );
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
