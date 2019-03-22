/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {useState} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import Session from "../redux/session";
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Messages from "../redux/messages";
import {BaseController} from "../core/BaseController";

export class Controller extends BaseController {
    handleSubmit = () => {
        let {username, password} = this.getValues();
        this.props.sessionLogin(username, password);
    };
}

export function Login(props) {
    const hooks = {
        username: useState("guest"),
        password: useState("guest"),
    };
    let controller = new Controller(props, hooks);
    let {username, password} = controller.getValues();

    let {userIdMessage, passwordMessage} = props;
    return (
        <div className="flexVDisplay doIndent">
            <div className="flexFixed">
                <TextField
                    required
                    name="username"
                    id="standard-required"
                    label="User name"
                    margin="normal"
                    onChange={event => controller.handleTextChange(event)}
                    value={username}
                    helperText={userIdMessage}
                    error={!!userIdMessage}
                />
            </div>
            <div className="flexFixed">
                <TextField
                    id="standard-password-input"
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    onChange={event => controller.handleTextChange(event)}
                    value={password}
                    helperText={passwordMessage}
                    error={!!passwordMessage}
                />
            </div>
            <div className="flexFixed">
                <Button color="primary" variant="contained" onClick={controller.handleSubmit}>
                    Login
                </Button>
            </div>
        </div>
    );
}

Login.propTypes = {
    sessionLogin: PropTypes.func.isRequired,
};

const mapStateToProps = (state /*, ownProps*/) => {
    return {
        userIdMessage: Messages.getMessage(state.messages.messageByField['login/userid']),
        passwordMessage: Messages.getMessage(state.messages.messageByField['login/password']),
    }
};

const mapDispatchToProps = {
    sessionLogin: Session.login,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Login)
