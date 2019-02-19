/**
 * Normally the contents of this file are placed in three different files, one for the functions for props,
 * one for the action types and one for the reducers.
 *
 * For this program, at least, it makes more sense to me to group them together into a class.
 * Easier for imports and extending the code, I believe.
 */

import {apiPost, ID_TOKEN_KEY} from "../../general/Utils";
import Messages from './messages';

export default class Session {

    static initialState = {
        sessionId: sessionStorage.getItem(ID_TOKEN_KEY),
        permissions: [],
        title: "Kevin Matte's Portfolio",
    };


    static SESSION_REGISTER = "SESSION_REGISTER";

    static register(email, user, password) {
        return dispatch => {
            dispatch(Messages.removeByField('register/'));
            return apiPost('register', {email, user, password}).then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.setItem(ID_TOKEN_KEY, result);
                    dispatch({
                        type: Session.SESSION_REGISTER,
                        session: {
                            sessionId: result,
                        }
                    });
                } else {
                    dispatch(Messages.add(status, result));
                }
            });
        }
    }

    static registerReducer(session, action) {
        return {
            ...session,
            ...action.session
        };
    }

    static SESSION_LOGIN = "SESSION_LOGIN";

    static login(user, password) {
        return dispatch => {
            dispatch(Messages.removeByField("login/"));
            return apiPost('login', {user: user, password}).then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.setItem(ID_TOKEN_KEY, result);
                    dispatch({
                        type: Session.SESSION_LOGIN,
                        session: {
                            sessionId: result,
                        }
                    });
                } else {
                    dispatch(Messages.add(status, result));
                }
            });
        }
    }

    static loginReducer(session, action) {
        return {
            ...session,
            ...action.session
        };
    }

    static SESSION_LOGOUT = "SESSION_LOGOUT";

    static logout() {
        return dispatch => {
            return apiPost('logout').then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.removeItem(ID_TOKEN_KEY);
                    dispatch({
                        type: Session.SESSION_LOGOUT,
                    });
                } else {
                    sessionStorage.removeItem(ID_TOKEN_KEY);
                    dispatch({
                        type: Session.SESSION_LOGOUT,
                    });
                    dispatch(Messages.add(status, result));
                }
            });

        }
    }

    static logoutReducer(/* session, action */) {
        return {...Session.initialState, sessionId: null};
    }

    static reducer(session = Session.initialState, action) {
        switch (action.type) {
            case Session.SESSION_LOGIN:
                return Session.loginReducer(session, action);

            case Session.SESSION_REGISTER:
                return Session.registerReducer(session, action);

            case Session.SESSION_LOGOUT:
                return Session.logoutReducer(session, action);

            default:
                return session;
        }

    }
}

