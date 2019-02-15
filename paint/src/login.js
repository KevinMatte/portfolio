import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {sessionLogin} from "./actionCreators";
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "kevin id",
            password: "my password"
        };
    }

    handleSessionLogin = () => {
        this.props.sessionLogin(this.state.username, this.state.password);
    };

    handleTextChange = (event) => {
        this.setState({[event.target.name]: event.target.value});
    };

    render() {
        return (
            <div className="flexVDisplay">
                <div className="flexFixed">
                    <TextField
                        required
                        name="username"
                        id="standard-required"
                        label="User name"
                        margin="normal"
                        onChange={event => this.handleTextChange(event)}
                        value={this.state.username}
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
                    />
                </div>
                <div className="flexFixed">
                    <Button color="primary" variant="contained" onClick={this.handleSessionLogin}>
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

const mapDispatchToProps = {sessionLogin};

export default connect(
    null,
    mapDispatchToProps
)(Login)
