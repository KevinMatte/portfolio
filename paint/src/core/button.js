import {useState} from "react";
import React from "react";

import MaterialButton from "@material-ui/core/Button";

import HelpText from './helpText';
import {BaseController} from "./baseController";

export class Controller extends BaseController {
}

export function Button(props) {
    let hooks = {
      helpValue: useState(null),
    };
    let controller = new Controller(props, hooks);

    let {targetProps, helpProps} = HelpText.getProps(controller, "helpValue");
    return (
        <div>
            <MaterialButton {...targetProps}>
                {targetProps.children}
            </MaterialButton>
            <HelpText {...helpProps} />
        </div>
    );
}

Button.defaultProps = {
    helpText: null,
};

Button.propTypes = {
    ...HelpText.addedPropTypes,
};

export default Button;
