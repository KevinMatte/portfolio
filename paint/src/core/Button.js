import {useState} from "react";
import React from "react";

import MaterialButton from "@material-ui/core/Button";

import HelpText from './HelpText';
import {BaseModel} from "./BaseModel";

export class Model extends BaseModel {
}

export function Button(props) {
    let hooks = {
      helpValue: useState(null),
    };
    let model = new Model(props, hooks);

    let {targetProps, helpProps} = HelpText.getProps(model, "helpValue");
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
