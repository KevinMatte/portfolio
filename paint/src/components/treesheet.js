/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import {connect} from "react-redux";


import {getValueByPath} from "../general/Utils";
import TreesheetModel from "../model/treeModel";
import DataSheet from './datasheet';
import RowHeaders from './rowheaders';
import ColumnHeaders from './columnheaders';
import TopLeftCorner from './topleftcorner';
import TreeControls from './TreeControls';

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
            spreadsheet: Treesheet.createSpreadsheet(props),
        }
    }

    static createSpreadsheet = (props) => new TreesheetModel(props.name, props.types, props.dataTree);

    static getDerivedStateFromProps(nextProps, prevState) {
        let spreadsheet;
        if (!prevState.hasOwnProperty("spreadsheet") || prevState.spreadsheet.name !== nextProps.name)
            spreadsheet = Treesheet.createSpreadsheet(nextProps);
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
            let r1, r2, headersDivs, headersDiv;
            let {scrollTop, scrollLeft} = bodyDiv;

            headersDivs = topDiv.getElementsByClassName("rowHeaders");
            if (headersDivs.length > 0) {
                headersDiv = headersDivs[0];
                headersDiv.scrollTop = scrollTop;
            }

            headersDivs = topDiv.getElementsByClassName("columnHeaders");
            if (headersDivs.length > 0) {
                headersDiv = headersDivs[0];
                headersDiv.scrollLeft = scrollLeft;
            }
        }
    };


    render() {
        return (
            <div
                id={this.topDivId}
                className="flexVDisplay flexHStretched max_size overflowHidden"

            >

                <div className="flexVStretched flexVDisplay">
                    <div className="flexFixed flexHDisplay">
                        <div className="flexFixed">
                            <TopLeftCorner
                                name={this.props.name}
                                spreadsheet={this.state.spreadsheet}
                                headerColumnWidth={this.headerColumnWidth}
                                rowHeight={50}
                            />
                        </div>
                        <div className="flexHStretched">
                            <ColumnHeaders
                                name={this.props.name}
                                spreadsheet={this.state.spreadsheet}
                                rowHeight={50}
                                indentPixels={30}
                                gridWidth="5px"
                            />
                        </div>
                    </div>
                    <div className="flexVStretched flexHDisplay">
                        <div className="flexFixed">
                            <RowHeaders
                                name={this.props.name}
                                spreadsheet={this.state.spreadsheet}
                                rowHeight={50}
                                headerColumnWidth={this.headerColumnWidth}
                            />
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
                                    rowHeight={50}
                                    indentPixels={30}
                                    gridWidth="5px"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="flexFixed">
                    <TreeControls
                        name={this.props.name}
                        spreadsheet={this.state.spreadsheet}
                    />
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
};

const mapStateToProps = (state, ownProps) => {
    return {
        types: state.drawing.types,
        dataTree: state.drawing.drawings,
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
    }
};

const mapDispatchToProps = {};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Treesheet)
