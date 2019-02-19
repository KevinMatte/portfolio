import React, {Component} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Session from "../redux/actions/session";
import Messages from "../redux/actions/messages";

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            email: "",
            password: "",
            password2: "",
            password2Message: null,
        };
    }

    handleSubmit = () => {
        if (this.state.password !== this.state.password2)
            this.setState({password2Message: "Passwords don't match"});
        else {
            this.setState({password2Message: null});
            this.props.sessionRegister(this.state.email, this.state.username, this.state.password);
        }
    };

    handleTextChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    };

    render() {
        let {emailMessage, userIdMessage, passwordMessage} = this.props;
        let password2Message = this.state.password2Message
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
                        value={this.state.email}
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
                    <TextField
                        id="match-password-input"
                        name="password2"
                        label="Confirm Password"
                        type="password"
                        autoComplete="current-password"
                        margin="normal"
                        onChange={event => this.handleTextChange(event)}
                        value={this.state.password2}
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
}

Register.propTypes = {
    sessionRegister: PropTypes.func.isRequired,
    userIdMessage: PropTypes.string,
    emailMessage: PropTypes.string,
    passwordMessage: PropTypes.string,
};

const mapStateToProps = (state /*, ownProps*/) => {
    return {
        emailMessage: Messages.getMessage(state.messages.messageByField['register/email']),
        userIdMessage: Messages.getMessage(state.messages.messageByField['register/userid']),
        passwordMessage: Messages.getMessage(state.messages.messageByField['register/password']),
    }
};

const mapDispatchToProps = {
    sessionRegister: Session.register,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Register)
