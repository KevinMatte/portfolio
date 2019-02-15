import React, {Component} from 'react';
import './App.css';
import PropTypes from 'prop-types';
import {createStyles, withStyles} from '@material-ui/core/styles';
import Login from './login';

// import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import {BrowserRouter, Link, Route, Switch, Redirect} from 'react-router-dom';
// import { withStyles } from '@material-ui/core/styles';
import {connect} from 'react-redux'

import 'typeface-roboto'
import {createMuiTheme, MuiThemeProvider, /* withStyles */} from '@material-ui/core/styles';
import lightBlue from '@material-ui/core/colors/lightBlue';
// import Button from '@material-ui/core/Button';
// import CircularProgress from '@material-ui/core/CircularProgress';
// import Dialog from '@material-ui/core/Dialog';
// import DialogActions from '@material-ui/core/DialogActions';
// import DialogTitle from '@material-ui/core/DialogTitle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import SwitchComponent from "@material-ui/core/Switch";

// import {button_style, renderText} from './general/Utils';
import FormControlLabel from "@material-ui/core/FormControlLabel/FormControlLabel";
import {sessionLogout, toggleAdvancedMode} from "./actionCreators";


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

        // noinspection ES6ModulesDependencies
        // noinspection ES6ModulesDependencies
        // noinspection JSUnresolvedVariable
        this.state = {
            appMenuAnchor: null,
            sessionMenuAnchor: null,
            loggedIn: false,
            isProduction: process.env.NODE_ENV === "production",
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

    handleSessionLogin = () => {
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
        const {sessionMenuAnchor, appMenuAnchor} = this.state;
        let title = this.props.session.title;
        const sessionMenuOpen = Boolean(sessionMenuAnchor);
        const applicationMenuOpen = Boolean(appMenuAnchor);
        const {classes} = this.props;
        let sessionMenuItem;
        let isAdvancedMode = this.props.options.advancedMode;
        let isLoggedIn = this.props.session.sessionId !== null;
        if (isLoggedIn)
            sessionMenuItem = (
                <MenuItem onClick={this.handleSessionLogout}>
                    <Link to="/paint">
                        Logout
                    </Link>
                </MenuItem>);
        else
            sessionMenuItem = <MenuItem onClick={this.handleSessionLogin}>
                <Link to="/paint/login">
                    Login
                </Link>
            </MenuItem>;

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
                        {isLoggedIn && <Menu
                            id="left-menu"
                            anchorEl={appMenuAnchor}
                            open={applicationMenuOpen}
                            onClose={() => this.handleAppMenuClose(null)}
                        >
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
                        </Menu>}
                        <Typography variant="body1" color="inherit" className={classes.grow}>
                            {title}
                        </Typography>
                        <IconButton
                            aria-owns={sessionMenuOpen ? 'right-menu' : null}
                            aria-haspopup="true"
                            onClick={this.handleSessionMenuOpen}
                            color="inherit"
                        >
                            <AccountCircle/>
                        </IconButton>
                        <Menu
                            id="right-menu"
                            anchorEl={sessionMenuAnchor}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={sessionMenuOpen}
                            onClose={this.handleSessionMenuClose}
                        >
                            {sessionMenuItem}
                        </Menu>
                    </Toolbar>
                </AppBar>
            </MuiThemeProvider>
        );
    }

    mainApp = () => <h1>Main app stub</h1>;

    login = (props) => {
        return (
            <Login {...props} className="max_size"/>
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
                    <Route path="/paint/login" render={() => (<Redirect to="/paint"/>)}/>
                    <Route exact path="/paint/" component={this.mainApp}/>
                    <Route component={this.handleRouteNoMatch}/>
                </Switch>
            );
        } else {
            return (
                <Switch>
                    <Route path="/paint/login" component={this.login}/>
                    <Route path="/paint" render={() => (
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
                            <div className="flexVStretched flexVDisplay">
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
    sessionId: PropTypes.string,
    sessionLogout: PropTypes.func.isRequired,
    toggleAdvancedMode: PropTypes.func.isRequired
};

const mapDispatchToProps = {sessionLogout, toggleAdvancedMode};
const mapStateToProps = (state /*, ownProps*/) => {
    return {
        options: state.options,
        session: state.session,
        sessionId: state.session.sessionId,
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(App))


