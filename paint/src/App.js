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
import UserSessionState from "./redux/userSessionState";
import OptionsState from "./redux/optionsState";
import MessagesState from './redux/messagesState';
import {renderText} from "./general/utils";
import Treesheet from "./components/Treesheet";
import LogoSplash from "./components/LogoSplash";

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
                paddingTop: "4px",
                paddingBottom: "4px",
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

export class App extends Component {

    constructor(props) {
        super(props);

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
                        <div style={{flexGrow: 1}}/>
                        <Typography variant="body1" color="inherit">
                            {title}
                        </Typography>
                        <div style={{flexGrow: 1}}/>
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
                horizontal: 'left',
            }}

            open={Boolean(sessionMenuAnchor)}
            onClose={this.handleSessionMenuClose}
        >
            {isLoggedIn &&
            <MenuItem onClick={this.handleSessionLogout}>
                <Link to="/paint/">Logout</Link>
            </MenuItem>
            }
            {!isLoggedIn &&
            <MenuItem onClick={this.handleSessionMenuClose}>
                <Link to="/paint/login">Login</Link>
            </MenuItem>
            }
            {!isLoggedIn &&
            <MenuItem onClick={this.handleSessionMenuClose}>
                <Link to="/paint/register">Register</Link>
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
            <MenuItem onClick={() => this.handleAppMenuClose("Main App")}>
                <Link to="/paint/main">Main App</Link>
            </MenuItem>
            }
            {isLoggedIn &&
            <MenuItem onClick={() => this.handleAppMenuClose("Treesheet")}>
                <Link to="/paint/treesheet">Treesheet</Link>
            </MenuItem>
            }
            {isLoggedIn &&
            <MenuItem onClick={() => this.handleAppMenuClose("LogoSplash")}>
                <Link to="/paint/logosplash">Logo Splash</Link>
            </MenuItem>
            }
            {isLoggedIn &&
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
            }
            {isAdvancedMode &&
            <MenuItem onClick={() => this.handleAppMenuClose()}>
                <Link to="/paint/about">Advanced About :=)</Link>
            </MenuItem>
            }
            <MenuItem onClick={() => this.handleAppMenuClose()}>
                <Link to="/paint/about">About</Link>
            </MenuItem>
        </Menu>;
    }

    main = () => {
        return (
            <div className="doIndent max_size" style={{overflow: "auto"}}>
                <h1>Main App</h1>
                <p>You can view the redux state with Redux DevTools extension for Chrome.</p>
                <p>Only the advanced mode and session state are present.</p>
                <p>React Redux is being used for data, selection, session, etc. Very little ReactJS state.
                    Open up the Redux extension in developer tools to observe it.</p>

                <h1>Sample Programs</h1>
                <p>Select something from the top-left hamburger/menu icon:</p>
                <ul>
                    <li><Link to="/paint/treesheet">
                        <button>Treesheet</button>
                    </Link>: Overlays CSS3 grids for a non-grid, but tree-like display. You can:
                        <ul>
                            <li>Open & Collapse rows.</li>
                            <li>See row & column header selection and content change as the mouse
                                hovers over the body area.
                            </li>
                            <li>Click a value and change it.</li>
                            <li>Select a row in the row headers and from the bottom tool bar:
                                <ul>
                                    <li>Copy the selected row and all it's indented child rows.</li>
                                    <li>Delete the selected row and all it's indented child rows.</li>
                                </ul>
                            </li>
                        </ul>
                        <p>Notes:</p>
                        <ul>
                            <li>The data is stored in React-Redux and a refresh will restore the contents.</li>
                        </ul>
                    </li>
                    <li><Link to="/paint/logosplash">
                        <button>LogoSplash</button>
                    </Link>: Plays with WebGL.
                    </li>
                </ul>
            </div>
        );
    };

    logoSplash = (props) => {
        return (
            <MuiThemeProvider theme={muiTheme}>
                <LogoSplash {...props} className="max_size" name="logosplash"/>
            </MuiThemeProvider>
        );
    };

    treeSheet = (props) => {
        return (
            <MuiThemeProvider theme={muiTheme}>
                <Treesheet {...props} className="max_size" name="treesheet"/>
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
                    <Route path="/paint/main" component={this.main}/>
                    <Route path="/paint/treesheet" component={this.treeSheet}/>
                    <Route path="/paint/logosplash" component={this.logoSplash}/>
                    <Route path="/paint/about" render={() => (
                        <div>
                            <h1>About</h1>
                            {this.constructor.aboutDescription()}
                        </div>
                    )}/>
                    <Route path="/paint/login" render={() => (<Redirect to="/paint/"/>)}/>
                    <Route path="/paint/register" render={() => (<Redirect to="/paint/"/>)}/>
                    <Route exact path="/paint/" component={this.main}/>
                    <Route component={this.handleRouteNoMatch}/>
                </Switch>
            );
        } else {
            return (
                <Switch>
                    <Route path="/paint/login" component={this.login}/>
                    <Route path="/paint/register" component={this.register}/>
                    <Route exact path="/paint/" render={this.renderPleaseLogin}/>
                    <Route path="/" render={() => (<Redirect to="/paint/"/>)}/>
                </Switch>
            );
        }
    }

    renderPleaseLogin = () => {
        return (
            <div className="doIndent overflowAuto max_size">
                <h1>Please log in.</h1>
                <p>The login is easy, the username and password are already entered. Just click login.</p>

                {this.constructor.aboutDescription()}
                <p><Link to="/paint/login">
                    <button>Login</button>
                </Link></p>
            </div>
        );
    };

    static linkCode(path) {
        let pathUrl = `https://github.com/KevinMatte/portfolio/tree/master/${path}`
        return (
            <a target="code" className="anchor" href={pathUrl}>{path}</a>
        );
    }

    static aboutDescription() {
        return (
            <div>
                <p>Use the session menu in the top right corner.</p>
                <p>This is a demo to show some of my abilities. The code is okay, but no tests and few comments.
                    I'm keeping the code readable.</p>
                <p>The UI consists of:</p>
                <ul>
                    <li>React JS</li>
                    <li>React Redux: You can use the Chrome redux tool to view state.</li>
                    <li>Jest Unit/Integration Tests</li>
                    <li>Tree of data: Demonstration of a complex one-page app layout with:
                        <ul>
                            <li>Multiple overlapping grids for the different tree node contents.</li>
                            <li>Row & Column headers that scroll and align with scrolling of main data area.</li>
                            <li>Editing capability.</li>
                        </ul>
                    </li>
                    <li>Apache server / WSGI / Flask / Python backend</li>
                    <li>Web Services with authentication.</li>
                    <li>MySQL database</li>
                </ul>
                <p>I believe I've done a few interesting things in the code:</p>
                <ul>
                    <li>See README.md {this.linkCode("paint/src/redux")} for my design of simplifying coding redux.</li>
                </ul>
            </div>
        );
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
                            <div className="flexVStretched">
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
    sessionLogout: UserSessionState.logout,
    toggleAdvancedMode: OptionsState.toggleAdvancedMode,
    messageRemove: MessagesState.remove,
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


