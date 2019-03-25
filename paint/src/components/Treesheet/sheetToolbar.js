/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React from "react";

import {connect} from "react-redux";

import Toolbar from '@material-ui/core/Toolbar'
// import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';

import Button from "../../core/button";
import {getValueByPath} from "../../general/utils";
import TreeState from "../../redux/treeState";
import TempState from "../../redux/tempState";
import {BaseController} from "../../core/baseController";

export class Controller extends BaseController {
    handleDuplicate = () => {
        let rowPath = [...this.props.selectedPath];
        rowPath.pop();
        this.props.duplicatePath(rowPath);
        let selectedRow = this.props.rowModel.duplicateRow(this.props.selectedRow);
        this.setTempValueByPath('selectedRow', selectedRow);
        this.setTempValueByPath('updated', this.props.updated + 1);
    };

    handleDelete = () => {
        let rowPath = [...this.props.selectedPath];
        rowPath.pop();
        this.props.deletePath(rowPath);
        let selectedRow = this.props.rowModel.deleteRow(this.props.selectedRow);
        this.setTempValueByPath('selectedRow', selectedRow);
        this.setTempValueByPath('updated', this.props.updated + 1);
    };

    setTempValueByPath = (field, value) => this.props.setTempValueByPath(`${this.props.name}/${field}`, value);
}

export function sheetToolbar(props) {
    let controller = new Controller(props);


    let {selectedPath} = props;
    let message = "";
    if (selectedPath) {
        let path;
        if (props.selectedCol !== null) {
            path = [...selectedPath];
            path.pop();
        } else
            path = selectedPath;
        message = `path ${path.join("/")}`
    } else {
        message = "No selection."
    }
    let hasSelection = !!selectedPath;
    return (
        <Toolbar>
            <Button
                variant="contained"
                onClick={() => console.log("Help")}
                corner="TR"
                helpText="This is a help button."
            >
                Help
            </Button>
            {hasSelection &&
            <Button
                variant="contained"
                onClick={controller.handleDuplicate}
                corner="TR"
                helpText="Duplicates the selected row, and it's children (indent) if any."
            >
                Duplicate
            </Button>
            }
            {hasSelection &&
            <Button
                variant="contained"
                onClick={controller.handleDelete}
                corner="TR"
                helpText="Deletes the selected row, and it's children (indent) if any."
            >
                Delete
            </Button>
            }
            &nbsp;
            <Typography>
                {message}
            </Typography>
        </Toolbar>
    );
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedPath: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedPath`, null),
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
        selectedRow: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedRow`, null),
        selectedCol: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedCol`, null),
    }
};

const mapDispatchToProps = {
    duplicatePath: TreeState.duplicatePath,
    deletePath: TreeState.deletePath,
    setTempValueByPath: TempState.setValueByPath,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(sheetToolbar)


