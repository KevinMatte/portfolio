/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React from "react";
import {PropTypes} from "prop-types";

import TextField from "@material-ui/core/TextField";
import {BaseController} from "../../core/baseController";

export class Controller extends BaseController {
    handleChangeEvent = (event) => {
        this.props.setValue(event.target.value);
    };
}

export function Cell(props) {
    let controller = new Controller(props);
    let {value, doEdit, dataTestId} = props;

    if (doEdit) {
        return (
            <TextField data-testid={dataTestId} value={value} onChange={controller.handleChangeEvent}>
            </TextField>
        )
    } else {
        return <span data-testid={dataTestId}>{value}</span>;
    }
}

Cell.defaultProps = {
    doEdit: false,
    dataTestId: "Cell",
};

Cell.propTypes = {
    doEdit: PropTypes.bool,
    value: PropTypes.any.isRequired,
    setValue: PropTypes.func,
};

export default Cell;



