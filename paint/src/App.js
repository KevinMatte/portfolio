/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
import {BrowserRouter, Link, Route, Switch, Redirect} from 'react-router-dom';
import {connect} from 'react-redux'
// noinspection ES6CheckImport
import PropTypes from 'prop-types';
import 'typeface-roboto'
import lightBlue from '@material-ui/core/colors/lightBlue';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Delete from '@material-ui/icons/Delete';
import AppBar from '@material-ui/core/AppBar';
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import SwitchComponent from "@material-ui/core/Switch";
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import CssBaseline from '@material-ui/core/CssBaseline';
import {createStyles, withStyles, createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';

import './styles.css'
import './App.css';
import Register from "./session/register";
import Login from './session/login';
import Session from "./redux/actions/session";
import Options from "./redux/actions/options";
import Messages from './redux/actions/messages';
import {renderText} from "./general/Utils";
import Main from "./spreadsheet";

/*
const styles = theme => ({
  root: {
    ...theme.typography.button,
    backgroundColor: theme.palette.common.white,
    padding: theme.spacing.unit,
  },
});
*/

const styles = createStyles({
    root: {
        flexGrow: 1,
    },
    grow: {
        flexGrow: 1,
    },
    menuButton: {
        marginLeft: -12,
        marginRight: 20,
    },
});


const muiTheme = createMuiTheme({
    palette: {
        secondary: lightBlue,
    },
    typography: {
        useNextVariants: true,
        button: {
            textTransform: 'none',
            disableRipple: true,
        },
    },
    overrides: {
        MuiButton: {
            root: {
                borderRadius: 3,
                border: 1,
                height: 36,
                boxShadow: '0 3px 5px 2px lightgrey',
                textTransform: 'capitalize',
            },
        },
        MuiIconButton: {
            root: {
                height: "24px",
                paddingTop: "0px",
                paddingBottom: "0px",
            }
        },
        MuiListItem: {
            default: {
                paddingTop: "0px",
                paddingBottom: "0px",
            }
        },
        MuiMenuItem: {
            root: {
                paddingTop: "8px",
                paddingBottom: "8px",
            }
        },
        MuiTab: {
            root: {
                backgroundColor: 'lightgrey',
                borderRadius: '15px 15px 0 0',
                margin: '5px 5px 0 0',
            },
            "&$selected": {
                backgroundColor: 'lightblue',
            }
        },
    }
});

class App extends Component {

    constructor(props, context) {
        super(props, context);

        // noinspection ES6ModulesDependencies, JSUnresolvedVariable
        let isProduction = process.env.NODE_ENV === "production";
        this.state = {
            appMenuAnchor: null,
            sessionMenuAnchor: null,
            loggedIn: false,
            isProduction: isProduction,
        };
    }


    handleAppMenuOpen = event => {
        this.setState({appMenuAnchor: event.currentTarget});
    };

    handleAppMenuClose = (menuLabel) => {
        let state = {appMenuAnchor: null};
        if (menuLabel)
            state.menuLabel = menuLabel;
        this.setState(state);
    };

    handleSessionMenuOpen = event => {
        this.setState({sessionMenuAnchor: event.currentTarget});
    };

    handleSessionMenuClose = () => {
        this.setState({sessionMenuAnchor: null});
    };

    handleSessionLogout = () => {
        this.setState({sessionMenuAnchor: null});
        this.props.sessionLogout();
    };

    handleRouteNoMatch = ({location}) => {
        return (
            <div>
                <h3>No URL path match for <code>{location.pathname}</code></h3>
            </div>
        );
    };

    renderAppBar() {
        const {appMenuAnchor, sessionMenuAnchor} = this.state;
        let title = this.props.session.title;
        const {classes} = this.props;

        return (
            <MuiThemeProvider theme={muiTheme}>
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            color="inherit"
                            aria-label="Menu"
                            aria-owns={appMenuAnchor ? 'left-menu' : null}
                            aria-haspopup="true"
                            onClick={this.handleAppMenuOpen}
                        >
                            <MenuIcon/>
                        </IconButton>
                        {this.renderAppMenu()}
                        <Typography variant="body1" color="inherit" className={classes.grow}>
                            {title}
                        </Typography>
                        <IconButton
                            aria-owns={sessionMenuAnchor ? 'right-menu' : null}
                            aria-haspopup="true"
                            onClick={this.handleSessionMenuOpen}
                            color="inherit"
                        >
                            <AccountCircle/>
                        </IconButton>
                        {this.renderSessionMenu()}
                    </Toolbar>
                </AppBar>
            </MuiThemeProvider>
        );
    }

    renderSessionMenu() {
        const {sessionMenuAnchor} = this.state;
        let isLoggedIn = this.props.session.sessionId !== null;
        return <Menu
            id="right-menu"
            anchorEl={sessionMenuAnchor}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={Boolean(sessionMenuAnchor)}
            onClose={this.handleSessionMenuClose}
        >
            {isLoggedIn &&
            <MenuItem onClick={this.handleSessionLogout}>
                <Link to="/paint/">
                    Logout
                </Link>
            </MenuItem>
            }
            {!isLoggedIn &&
            <MenuItem onClick={this.handleSessionMenuClose}>
                <Link to="/paint/login">
                    Login
                </Link>
            </MenuItem>
            }
            {!isLoggedIn &&
            <MenuItem onClick={this.handleSessionMenuClose}>
                <Link to="/paint/register">
                    Register
                </Link>
            </MenuItem>
            }
        </Menu>;
    }

    renderAppMenu() {
        const {appMenuAnchor} = this.state;
        let isAdvancedMode = this.props.options.advancedMode;
        let isLoggedIn = this.props.session.sessionId !== null;
        return <Menu
            id="left-menu"
            anchorEl={appMenuAnchor}
            open={Boolean(appMenuAnchor)}
            onClose={() => this.handleAppMenuClose(null)}
        >
            {isLoggedIn &&
            <div>
                <MenuItem onClick={() => this.handleAppMenuClose("Main App")}>
                    <Link to="/paint/main">
                        Main App
                    </Link>
                </MenuItem>
                <MenuItem onClick={() => this.handleAppMenuClose("Circles")}>
                    <Link to="/paint/circles">
                        Circles
                    </Link>
                </MenuItem>
                <MenuItem>
                    <FormControlLabel
                        label="Advanced Mode"
                        name="advancedMode"
                        control={<SwitchComponent
                            onChange={this.props.toggleAdvancedMode}
                            checked={this.props.options.advancedMode}
                        />
                        }
                    />
                </MenuItem>
            </div>
            }
            {isAdvancedMode &&
            <MenuItem onClick={() => this.handleAppMenuClose()}>
                <Link to="/paint/about">
                    Advanced About :=)
                </Link>
            </MenuItem>
            }
            <MenuItem onClick={() => this.handleAppMenuClose()}>
                <Link to="/paint/about">
                    About
                </Link>
            </MenuItem>
        </Menu>;
    }

    mainApp = (props) => {
        return (
            <MuiThemeProvider theme={muiTheme}>
                <Main {...props} className="max_size"/>
            </MuiThemeProvider>
        );
    };

    login = (props) => {
        return (
            <MuiThemeProvider theme={muiTheme}>
                <Login {...props} className="max_size"/>
            </MuiThemeProvider>
        );
    };

    register = (props) => {
        return (
            <MuiThemeProvider theme={muiTheme}>
                <Register {...props} className="max_size"/>
            </MuiThemeProvider>
        );
    };

    renderSwitch() {
        let isLoggedIn = this.props.session.sessionId !== null;

        if (isLoggedIn) {
            return (
                <Switch>
                    <Route path="/paint/main" render={() => (
                        <div>
                            <h1>Main App</h1>
                            <p>You can view the redux state with Redux DevTools extension for Chrome.</p>
                            <p>Only the advanced mode and session state are present.</p>
                        </div>
                    )}/>
                    <Route path="/paint/circles" render={() => (
                        <h1>Circles</h1>
                    )}/>
                    <Route path="/paint/about" render={() => (
                        <h1>About</h1>
                    )}/>
                    <Route path="/paint/login" render={() => (<Redirect to="/paint/"/>)}/>
                    <Route path="/paint/register" render={() => (<Redirect to="/paint/"/>)}/>
                    <Route exact path="/paint/" component={this.mainApp}/>
                    <Route component={this.handleRouteNoMatch}/>
                </Switch>
            );
        } else {
            return (
                <Switch>
                    <Route path="/paint/login" component={this.login}/>
                    <Route path="/paint/register" component={this.register}/>
                    <Route path="/paint/" render={() => (
                        <div>
                            <h1>Please log in.</h1>
                            <p>Use the session menu in the top left corner.</p>
                            <p>So far this is only showing ReactJS/Material-UI and React-Redux.</p>
                            <p>Today's plan: Connect database. Design React spreadsheet.</p>
                            <li>I've wanted to do this for a long time, just for fun!</li>
                        </div>
                    )}/>
                </Switch>
            );
        }
    }

    renderMessages() {
        return (
            <div>
                {this.props.messages.length > 0 &&
                <div style={{borderBottomStyle: "double"}}>
                    {this.props.messages.filter(message => !message.field).map((message) => {
                        return (
                            <div key={message.messageId} className="flexHDisplay">
                                <div className="flexHStretched middleText">
                                    <span>{renderText(message.message)}</span>
                                </div>
                                <div className="flexFixed">
                                    <IconButton
                                        color="inherit"
                                        onClick={() => this.props.messageRemove(message.messageId)}
                                    >
                                        <Delete/>
                                    </IconButton>
                                </div>
                            </div>
                        );
                    })}
                </div>
                }
            </div>
        )
    }


    render() {
        return (
            <BrowserRouter>
                <div className="max_size">
                    <React.Fragment>
                        <CssBaseline/>
                        <div className="max_size  flexVDisplay">
                            <div className="flexFixed">
                                {this.renderAppBar()}
                            </div>
                            <div>
                                {this.renderMessages()}
                            </div>
                            <div className="flexVStretched flexVDisplay doIndent">
                                {this.renderSwitch()}
                            </div>
                        </div>
                    </React.Fragment>
                </div>
            </BrowserRouter>
        );
    }
}

App.propTypes = {
    options: PropTypes.object.isRequired,
    session: PropTypes.object.isRequired,
    messages: PropTypes.array,
    sessionId: PropTypes.string,
    messageRemove: PropTypes.func.isRequired,
    toggleAdvancedMode: PropTypes.func.isRequired,
    sessionLogout: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
    sessionLogout: Session.logout,
    toggleAdvancedMode: Options.toggleAdvancedMode,
    messageRemove: Messages.remove,
};
const mapStateToProps = (state /*, ownProps*/) => {
    return {
        options: state.options,
        session: state.session,
        sessionId: state.session.sessionId,
        messages: state.messages.list,
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(App))


