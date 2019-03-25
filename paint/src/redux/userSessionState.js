/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

/**
 * Normally the contents of this file are placed in three different files, one for the functions for props,
 * one for the action types and one for the reducers.
 *
 * For this program, at least, it makes more sense to me to group them together into a class.
 * Easier for imports and extending the code, I believe.
 */

import {apiPost, ID_TOKEN_KEY} from "../general/utils";
import MessagesState from './messagesState';
import {ReduxState} from "./reduxState";

export default class UserSessionState extends ReduxState {
    constructor(initialState = {
        sessionId: sessionStorage.getItem(ID_TOKEN_KEY),
        permissions: [],
        title: "Kevin Matte's Portfolio",
    }) {
        super("UserSessionState", initialState);
    }

    static USER_SESSION_REGISTER = "USER_SESSION_REGISTER";

    // noinspection JSUnusedGlobalSymbols
    static register = (email, user, password) => {
        return dispatch => {
            dispatch(MessagesState.removeByField('register/'));
            return apiPost('register', {email, user, password}).then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.setItem(ID_TOKEN_KEY, result);
                    dispatch({
                        type: UserSessionState.USER_SESSION_REGISTER,
                        session: {
                            sessionId: result,
                        }
                    });
                } else {
                    dispatch(MessagesState.add(status, result));
                }
            });
        }
    };

    // noinspection JSUnusedGlobalSymbols
    static registerReducer = (session, action) => {
        return {
            ...session,
            ...action.session
        };
    };

    static USER_SESSION_LOGIN = "USER_SESSION_LOGIN";

    // noinspection JSUnusedGlobalSymbols
    static login = (user, password) => {
        return dispatch => {
            dispatch(MessagesState.removeByField("login/"));
            return apiPost('login', {user: user, password}).then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.setItem(ID_TOKEN_KEY, result);
                    dispatch({
                        type: UserSessionState.USER_SESSION_LOGIN,
                        session: {
                            sessionId: result,
                        }
                    });
                } else {
                    dispatch(MessagesState.add(status, result));
                }
            });
        }
    };

    // noinspection JSUnusedGlobalSymbols
    static loginReducer = (session, action) => {
        return {
            ...session,
            ...action.session
        };
    };

    static USER_SESSION_LOGOUT = "USER_SESSION_LOGOUT";

    // noinspection JSUnusedGlobalSymbols
    static logout = () => {
        return dispatch => {
            return apiPost('logout').then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.removeItem(ID_TOKEN_KEY);
                    dispatch({
                        type: UserSessionState.USER_SESSION_LOGOUT,
                    });
                } else {
                    sessionStorage.removeItem(ID_TOKEN_KEY);
                    dispatch({
                        type: UserSessionState.USER_SESSION_LOGOUT,
                    });
                    dispatch(MessagesState.add(status, result));
                }
            });

        }
    };

    // noinspection JSUnusedGlobalSymbols
    static logoutReducer = (/* session, action */) => {
        return {...UserSessionState.initialState, sessionId: null};
    }
}

