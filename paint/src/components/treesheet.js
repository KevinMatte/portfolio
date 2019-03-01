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

        this.state = {
            treesheetModel: Treesheet.createTreesheetModel(props),
        }
    }

    static createTreesheetModel = (props) => new TreesheetModel(props.name, props.types, props.dataTree);

    static getDerivedStateFromProps(nextProps, prevState) {
        let treesheetModel;
        if (!prevState.hasOwnProperty("treesheetModel") || prevState.treesheetModel.name !== nextProps.name)
            treesheetModel = Treesheet.createTreesheetModel(nextProps);
        else
            treesheetModel = prevState.treesheetModel;
        return {treesheetModel}
    }

    handleScroll = (event) => {
        let bodyDiv = event.target;

        let topDiv = bodyDiv;
        for (; topDiv && topDiv !== document; topDiv = topDiv.parentNode) {
            if (topDiv.id === this.topDivId)
                break;
        }
        if (topDiv !== document) {
            let headersDivs, headersDiv;
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
        let {headerColumnWidth, rowHeight, indentPixels, gridSpacingWidth, name} = this.props;
        let commonProps = {name, rowHeight, gridSpacingWidth, treesheetModel: this.state.treesheetModel};
        let rowHeaderProps = {...commonProps, headerColumnWidth};
        let colHeaderProps = {...commonProps, indentPixels};

        return (
            <div id={this.topDivId} className="flexVDisplay max_size overflowHidden">

                <div className="flexVStretched flexVDisplay">

                    {/*<!-- Headers for Columns --> */}
                    <div className="flexFixed flexHDisplay">
                        <TopLeftCorner className="flexFixed" {...rowHeaderProps}/>
                        <ColumnHeaders className="flexHStretched" {...colHeaderProps}/>
                    </div>

                    <div className="flexVStretched flexHDisplay">
                        {/*<!-- Headers for rows --> */}
                        <RowHeaders className="flexFixed" {...rowHeaderProps}/>

                        {/*<!-- Edit/Body of Treesheet --> */}
                        <div
                            className="flexHStretched SpreadsheetScrollArea"
                            onScroll={(event) => this.handleScroll(event)}
                        >
                            <DataSheet {...colHeaderProps}/>
                        </div>
                    </div>
                </div>

                {/*<!-- Controls --> */}
                <div
                    className="flexFixed">
                    <TreeControls
                        name={this.props.name}
                        treesheetModel={this.state.treesheetModel}
                    />
                </div>

            </div>
        );
    }

}

Treesheet.defaultProps = {
    updated: 0,
    headerColumnWidth: 150,
    rowHeight: 50,
    indentPixels: 30,
    gridSpacingWidth: 5,
};

Treesheet.propTypes = {
    types: PropTypes.object.isRequired,
    dataTree: PropTypes.array.isRequired,
    name: PropTypes.string.isRequired,
    updated: PropTypes.number,
    headerColumnWidth: PropTypes.number,
    rowHeight: PropTypes.number,
    indentPixels: PropTypes.number,
    gridSpacingWidth: PropTypes.number,
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
