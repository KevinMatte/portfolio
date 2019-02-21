import React, {Component} from "react";
import PropTypes from "prop-types";

import TextField from "@material-ui/core/TextField";

class Cell extends Component {

    handleChangeEvent = (event) => {
        this.props.setValue(event.target.value);
    };

    render() {
        let {value, doEdit} = this.props;

        if (doEdit) {
            return (
                <TextField value={value} onChange={event => this.handleChangeEvent(event)}>
                </TextField>
            )
        } else {
            return <span>{value}</span>;
        }

    }
}

Cell.defaultProps = {
    doEdit: false,
};

Cell.propTypes = {
    doEdit: PropTypes.bool,
    value: PropTypes.any.isRequired,
    setValue: PropTypes.func,
};

export default Cell;



