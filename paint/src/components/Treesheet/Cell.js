import React from "react";
import PropTypes from "prop-types";

import TextField from "@material-ui/core/TextField";

function Cell(props) {
    let {value, setValue, doEdit, dataTestID} = props;

    let handleChangeEvent = (event) => {
        setValue(event.target.value);
    };

    if (doEdit) {
        return (
            <TextField data-testid={dataTestID} value={value} onChange={handleChangeEvent}>
            </TextField>
        )
    } else {
        return <span data-testid={dataTestID}>{value}</span>;
    }
}

Cell.defaultProps = {
    doEdit: false,
    dataTestID: "Cell",
};

Cell.propTypes = {
    doEdit: PropTypes.bool,
    value: PropTypes.any.isRequired,
    setValue: PropTypes.func,
};

export default Cell;



