/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import Session from "../redux/session";
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Messages from "../redux/messages";

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "guest",
            password: "guest"
        };
    }

    handleSubmit = () => {
        this.props.sessionLogin(this.state.username, this.state.password);
    };

    handleTextChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    };

    render() {
        let {userIdMessage, passwordMessage} = this.props;
        return (
            <div className="flexVDisplay doIndent">
                <div className="flexFixed">
                    <TextField
                        required
                        name="username"
                        id="standard-required"
                        label="User name"
                        margin="normal"
                        onChange={event => this.handleTextChange(event)}
                        value={this.state.username}
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
                        value={this.state.password}
                        helperText={passwordMessage}
                        error={!!passwordMessage}
                    />
                </div>
                <div className="flexFixed">
                    <Button color="primary" variant="contained" onClick={this.handleSubmit}>
                        Login
                    </Button>
                </div>
            </div>
        );
    }
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
