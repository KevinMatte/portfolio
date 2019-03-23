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
    let controller = Controller.getController(Controller, props, hooks);

    HelpText.setupController(controller, "helpValue");
    return (
        <div>
            <MaterialButton {...controller.targetProps}>
                {controller.targetProps.children}
            </MaterialButton>
            <HelpText {...controller.helpProps} />
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
