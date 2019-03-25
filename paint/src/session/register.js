/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {useState} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import UserSessionState from "../redux/userSessionState";
import MessagesState from "../redux/messagesState";
import {BaseController} from "../core/baseController";

export class Controller extends BaseController {
    handleSubmit = () => {
        if (this.state.password !== this.state.password2)
            this.setValue("password2Message", "Passwords don't match");
        else {
            this.setValue("password2Message", null);
            this.props.sessionRegister(this.state.email, this.state.username, this.state.password);
        }
    };

    handleTextChange = (event) => {
        this.setValue(event.target.name, event.target.value);
    };
}

export function Register(props) {
    const hooks = {
        username: useState(""),
        email: useState(""),
        password: useState(""),
        password2: useState(""),
        password2Message: useState(null),
    };
    let controller = new Controller(props, hooks);
    let {username, email, password, password2, password2Message} = controller.getValues();

    let {emailMessage, userIdMessage, passwordMessage} = props;
    return (
        <div className="flexVDisplay">
            <div className="flexFixed">
                <TextField
                    required
                    name="email"
                    id="standard-email-required"
                    label="Email"
                    margin="normal"
                    onChange={event => this.handleTextChange(event)}
                    value={email}
                    helperText={emailMessage}
                    error={!!emailMessage}
                />
            </div>
            <div className="flexFixed">
                <TextField
                    required
                    name="username"
                    id="standard-required"
                    label="User name"
                    margin="normal"
                    onChange={event => this.handleTextChange(event)}
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
                    onChange={event => this.handleTextChange(event)}
                    value={password}
                    helperText={passwordMessage}
                    error={!!passwordMessage}
                />
            </div>
            <div className="flexFixed">
                <TextField
                    id="match-password-input"
                    name="password2"
                    label="Confirm Password"
                    type="password"
                    autoComplete="current-password"
                    margin="normal"
                    onChange={event => this.handleTextChange(event)}
                    value={password2}
                    helperText={password2Message}
                    error={!!password2Message}
                />
            </div>
            <div className="flexFixed">
                <Button color="primary" variant="contained" onClick={this.handleSubmit}>
                    Register
                </Button>
            </div>
        </div>
    );
}

Register.propTypes = {
    sessionRegister: PropTypes.func.isRequired,
    userIdMessage: PropTypes.string,
    emailMessage: PropTypes.string,
    passwordMessage: PropTypes.string,
};

const mapStateToProps = (state /*, ownProps*/) => {
    return {
        emailMessage: MessagesState.getMessage(state.messages.messageByField['register/email']),
        userIdMessage: MessagesState.getMessage(state.messages.messageByField['register/userid']),
        passwordMessage: MessagesState.getMessage(state.messages.messageByField['register/password']),
    }
};

const mapDispatchToProps = {
    sessionRegister: UserSessionState.register,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Register)
