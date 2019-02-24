import {Component} from "react";
import React from "react";
import PropTypes from 'prop-types';
import Popover from '@material-ui/core/Popover';
import {withStyles} from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    popover: {
        pointerEvents: 'none',
    },
    paper: {
        padding: theme.spacing.unit,
    },
});

class HelpText extends Component {

    static addedPropTypes = {
        corner: PropTypes.string, // Places help pop-up. "NW" puts it on top. "SENW" puts it under SE corner to the right.
        name: PropTypes.string, // Name + "Elm" is used in the component's state.
        helpText: PropTypes.string, // Help text to display.
    };

    static handleMouse(component, event) {
        let stateName = `${event.target.name}Elm`;
        switch (event.type) {
            case "mouseenter":
                component.setState({[stateName]: event.currentTarget});
                break;
            case "mouseleave":
                component.setState({[stateName]: null});
                break;
            default:
                console.log(`type=${event.type}`);
                break;
        }
    }


    static getProps(component, name = "helpTarget") {
        let props = {
            ...component.props,
            onMouseEnter: event => HelpText.handleMouse(component, event),
            onMouseLeave: event => HelpText.handleMouse(component, event),
        };
        let {corner, helpText, name2} = component.props;
        props.name = name || name2 || "helpText";
        let anchorEl = component.state[`${props.name}Elm`];
        delete props.helpText;
        delete props.corner;
        return {props, helpProps: {anchorEl, corner, helpText}};
    }

    render() {
        const {classes} = this.props;
        const {anchorEl} = this.props;
        const open = Boolean(anchorEl);

        let {corner, helpText, anchorOrigin, transformOrigin} = this.props;

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
                    onClose={this.handlePopoverClose}
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
}

HelpText.defaultProps = {
    helpText: null,
};

HelpText.propTypes = {
    classes: PropTypes.object.isRequired,
    ...HelpText.addedPropTypes,
};

export default withStyles(styles)(HelpText);
