import React from "react";
import PropTypes from 'prop-types';
import Popover from '@material-ui/core/Popover';
import {withStyles} from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import {BaseController} from "./baseController";

const styles = theme => ({
    popover: {
        pointerEvents: 'none',
    },
    paper: {
        padding: theme.spacing.unit,
    },
});

export class Controller extends BaseController {
    static handleMouse(targetModel, stateName, event) {
        switch (event.type) {
            case "mouseenter":
                targetModel.setValue(stateName, event.currentTarget);
                break;
            case "mouseleave":
                targetModel.setValue(stateName, null);
                break;
            default:
                break;
        }
    }
}

export function HelpText(props) {

    const {classes} = props;
    const {anchorEl} = props;
    const open = Boolean(anchorEl);

    let {corner, helpText, anchorOrigin, transformOrigin} = props;

    if (corner) {
        anchorOrigin = {
            vertical: corner[0] === "T" ? 'top' : 'bottom',
            horizontal: corner[1] === "L" ? 'left' : 'right',
        };
        if (corner.length === 2)
            transformOrigin = {
                vertical: corner[0] === "T" ? 'bottom' : 'top',
                horizontal: corner[1] === "L" ? 'right' : 'left',
            };
        else
            transformOrigin = {
                vertical: corner[2] === "T" ? 'top' : 'bottom',
                horizontal: corner[3] === "L" ? 'left' : 'right',
            };

    } else {
        anchorOrigin = anchorOrigin || {
            vertical: 'bottom',
            horizontal: 'left',
        };

        transformOrigin = transformOrigin || {
            vertical: 'top',
            horizontal: 'left',
        };
    }

    const hasHelpText = helpText != null;
    return (
        <div>
            {hasHelpText &&
            <Popover
                id="mouse-over-popover"
                className={classes.popover}
                classes={{
                    paper: classes.paper,
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={anchorOrigin}
                transformOrigin={transformOrigin}
                disableRestoreFocus
            >
                <Typography className={classes.typography}>
                    {helpText}
                </Typography>
            </Popover>
            }
        </div>
    );
}

HelpText.addedPropTypes = {
    corner: PropTypes.string, // Places help pop-up. "NW" puts it on top. "SENW" puts it under SE corner to the right.
    name: PropTypes.string, // Name + "Elm" is used in the component's state.
    helpText: PropTypes.string, // Help text to display.
};

HelpText.getProps = (targetModel, stateName) => {
    let targetProps = {
        ...targetModel.props,
        onMouseEnter: event => Controller.handleMouse(targetModel, stateName, event),
        onMouseLeave: event => Controller.handleMouse(targetModel, stateName, event),
    };
    let {corner, helpText} = targetModel.props;
    targetProps.name = stateName;
    let anchorEl = targetModel.getValue(stateName);
    delete targetProps.helpText;
    delete targetProps.corner;
    return {targetProps, helpProps: {anchorEl, corner, helpText}};
};


HelpText.defaultProps = {
    helpText: null,
};

HelpText.propTypes = {
    classes: PropTypes.object.isRequired,
    ...HelpText.addedPropTypes,
};

export default withStyles(styles)(HelpText);
