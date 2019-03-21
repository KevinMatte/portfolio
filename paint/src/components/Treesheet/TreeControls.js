import React from "react";

import {connect} from "react-redux";

import Toolbar from '@material-ui/core/Toolbar'
// import Button from "@material-ui/core/Button";
import Typography from '@material-ui/core/Typography';

import Button from "../../core/Button";
import {getValueByPath} from "../../general/Utils";
import Drawing from "../../redux/drawing";
import TempValues from "../../redux/tempValues";
import {BaseModel} from "../../core/BaseModel";

export class Model extends BaseModel {
    handleDuplicate = () => {
        let rowPath = [...this.props.selectedPath];
        rowPath.pop();
        this.props.duplicatePath(rowPath);
        let selectedRow = this.props.treesheetModel.duplicateRow(this.props.selectedRow);
        this.setTempValueByPath('selectedRow', selectedRow);
        this.setTempValueByPath('updated', this.props.updated + 1);
    };

    handleDelete = () => {
        let rowPath = [...this.props.selectedPath];
        rowPath.pop();
        this.props.deletePath(rowPath);
        let selectedRow = this.props.treesheetModel.deleteRow(this.props.selectedRow);
        this.setTempValueByPath('selectedRow', selectedRow);
        this.setTempValueByPath('updated', this.props.updated + 1);
    };

    setTempValueByPath = (field, value) => this.props.setTempValueByPath(`${this.props.name}/${field}`, value);

}
export function TreeControls(props) {
    let model = new Model(props);


    let {selectedPath} = props;
    let message = "";
    if (selectedPath) {
        if (props.selectedCol !== null) {
            message = [...selectedPath];
            message.pop();
        } else
            message = selectedPath;
        message = `path ${message.join("/")}`
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
                onClick={model.handleDuplicate}
                corner="TR"
                helpText="Duplicates the selected row, and it's children (indent) if any."
            >
                Duplicate
            </Button>
            }
            {hasSelection &&
            <Button
                variant="contained"
                onClick={model.handleDelete}
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
    duplicatePath: Drawing.duplicatePath,
    deletePath: Drawing.deletePath,
    setTempValueByPath: TempValues.setValueByPath,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TreeControls)


