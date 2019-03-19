import React, {Component} from "react";
import PropTypes from "prop-types";

import TextField from "@material-ui/core/TextField";

class Cell extends Component {

    handleChangeEvent = (event) => {
        this.props.setValue(event.target.value);
    };

    render() {
        let {value, doEdit, dataTestID} = this.props;

        if (doEdit) {
            return (
                <TextField data-testid={dataTestID} value={value} onChange={event => this.handleChangeEvent(event)}>
                </TextField>
            )
        } else {
            return <span data-testid={dataTestID}>{value}</span>;
        }

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



