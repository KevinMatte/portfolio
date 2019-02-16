import React, {Component} from 'react';
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import {sessionRegister} from "./actionCreators";
import {connect} from "react-redux";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";

class Register extends Component {
    constructor(props) {
        super(props);

        this.state = {
            username: "",
            password: "",
            password2: "",
        };
    }

    handleSubmit = () => {
        this.props.sessionRegister(this.state.username, this.state.password);
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
                    <TextField
                        id="match-password-input"
                        name="password2"
                        label="Confirm Password"
                        type="password"
                        autoComplete="current-password"
                        margin="normal"
                        onChange={event => this.handleTextChange(event)}
                        value={this.state.password2}
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
};

const mapDispatchToProps = {sessionRegister};

export default connect(
    null,
    mapDispatchToProps
)(Register)
