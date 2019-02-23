import {Component} from "react";
import React from "react";

import {connect} from "react-redux";

import Toolbar from '@material-ui/core/Toolbar'
import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';

import {getValueByPath} from "../general/Utils";
import Drawing from "../redux/actions/drawing";
import TempValues from "../redux/actions/tempValues";

class TreeControls extends Component {

    handleDuplicate = () => {
        let rowPath = [...this.props.selectedPath];
        rowPath.pop();
        this.props.duplicatePath(rowPath);
        let selectedRow = this.props.spreadsheet.duplicateRow(this.props.selectedRow);
        this.setTempValueByPath('selectedRow', selectedRow);
        this.setTempValueByPath('updated', this.props.updated + 1);
    }

    setTempValueByPath = (field, value) => this.props.setTempValueByPath(`${this.props.name}/${field}`, value);

    render() {
        let {selectedPath} = this.props;
        let rowPath = "";
        if (selectedPath) {
            rowPath = [...selectedPath];
            rowPath.pop();
            rowPath = `path ${rowPath.join("/")}`
        }
        let hasSelection = !!selectedPath;
        return (
            <Toolbar>
                {hasSelection &&
                <Button color="primary" variant="contained" onClick={this.handleDuplicate}>
                    Duplicate
                </Button>
                }
                &nbsp;
                <Typography>
                    {rowPath}
                </Typography>
            </Toolbar>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        selectedPath: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedPath`, null),
        updated: getValueByPath(state.tempValues.values, `${ownProps.name}/updated`, 0),
        selectedRow: getValueByPath(state.tempValues.values, `${ownProps.name}/selectedRow`, null),
    }
};

const mapDispatchToProps = {
    duplicatePath: Drawing.duplicatePath,
    setTempValueByPath: TempValues.setValueByPath,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TreeControls)


