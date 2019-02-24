import {Component} from "react";
import React from "react";

import MaterialButton from "@material-ui/core/Button";

import HelpText from './HelpText';

class Button extends Component {

    state = {};

    render() {
        let {props, helpProps} = HelpText.getProps(this, "jack");
        return (
            <div>
                <MaterialButton {...props}>
                    {props.children}
                </MaterialButton>
                <HelpText {...helpProps} />
            </div>
        );
    }
}

Button.defaultProps = {
    helpText: null,
};

Button.propTypes = {
    ...HelpText.addedPropTypes,
};

export default Button;
