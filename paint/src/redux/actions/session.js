/**
 * Normally the contents of this file are placed in three different files, one for the functions for props,
 * one for the action types and one for the reducers.
 *
 * For this program, at least, it makes more sense to me to group them together into a class.
 * Easier for imports and extending the code, I believe.
 */

import {apiPost, ID_TOKEN_KEY} from "../../general/Utils";

export default class Session {

    static SESSION_REGISTER = "SESSION_REGISTER";
    static SESSION_LOGIN = "SESSION_LOGIN";
    static SESSION_LOGOUT = "SESSION_LOGOUT";
    static SESSION_MESSAGE = "SESSION_MESSAGE";
    static SESSION_MESSAGE_REMOVE = "SESSION_MESSAGE_REMOVE";

    static initialState =  {
        sessionId: sessionStorage.getItem(ID_TOKEN_KEY),
        permissions: [],
        title: "Kevin Matte's Portfolio",
        messages: [],
        messageId: 0,
    };



    static register(user, password) {
        return dispatch => {
            return apiPost('register', {user: user, password}).then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.setItem(ID_TOKEN_KEY, result);
                    dispatch({
                        type: Session.SESSION_REGISTER,
                        session: {
                            sessionId: result,
                        }
                    });
                } else {
                    dispatch(Session.message('failed', result));
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

    static login(user, password) {
        return dispatch => {
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
                    dispatch(Session.message('failed', result));
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
                    dispatch(Session.message('failed', result));
                }
            });

        }
    }

    static logoutReducer(/* session, action */) {
        return {...Session.initialState, sessionId: null};
    }

    static message(status, message) {
        return {
            type: Session.SESSION_MESSAGE,
            message,
            status,
        };
    }

    static messageReducer(session, action) {
        let messageId = session.messageId + 1;
        let newMessage = {
            messageId: messageId,
            message: action.message,
            status: action.status
        };
        return {
            ...session,
            messageId,
            messages: Array.of(...session.messages, newMessage)
        }
    }

    /*
    static messageRemove(messageId) {
        return {
            type: Session.SESSION_MESSAGE_REMOVE,
            messageId,
        };
    }
    */

    static messageRemoveReducer(session, action) {
        return {
            ...session,
            messages: session.messages.filter(message => message.messageId !== action.messageId)
        };
    }

    static reducer(session = Session.initialState, action) {
        switch (action.type) {
            case Session.SESSION_LOGIN:
                return Session.loginReducer(session, action);

            case Session.SESSION_REGISTER:
                return Session.registerReducer(session, action);

            case Session.SESSION_LOGOUT:
                return Session.logoutReducer(session, action);

            case Session.SESSION_MESSAGE:
                return Session.messageReducer(session, action);

            case Session.SESSION_MESSAGE_REMOVE:
                return Session.messageRemoveReducer(session, action);

            default:
                return session;
        }

    }
}

