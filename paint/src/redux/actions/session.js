import {SESSION_LOGIN, SESSION_LOGOUT, SESSION_MESSAGE} from '../actions'
import {apiPost, ID_TOKEN_KEY} from "../../general/Utils";

export default class Session {

    static register(user, password) {
        return dispatch => {
            return apiPost('register', {user: user, password}).then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.setItem(ID_TOKEN_KEY, result['auth_token']);
                    dispatch({
                        type: SESSION_LOGIN,
                        session: {
                            sessionId: result['auth_token'],
                        }
                    });
                } else {
                    dispatch({
                        type: SESSION_MESSAGE,
                        message: result,
                        status: 'failed',
                    });
                }
            });
        }
    }

    static login(user, password) {
        return dispatch => {
            return apiPost('login', {user: user, password}).then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.setItem(ID_TOKEN_KEY, result['auth_token']);
                    dispatch({
                        type: SESSION_LOGIN,
                        session: {
                            sessionId: result['auth_token'],
                        }
                    });
                } else {
                    dispatch({
                        type: SESSION_MESSAGE,
                        message: result,
                        status: 'failed',
                    });
                }
            });
        }
    }

    static logout() {
        return dispatch => {
            return apiPost('logout').then(({status, result}) => {
                if (status === "success") {
                    sessionStorage.removeItem(ID_TOKEN_KEY);
                    dispatch({
                        type: SESSION_LOGOUT,
                    });
                } else {
                    sessionStorage.removeItem(ID_TOKEN_KEY);
                    dispatch({
                        type: SESSION_LOGOUT,
                    });
                    dispatch({
                        type: SESSION_MESSAGE,
                        message: result,
                        status: 'failed',
                    });
                }
            });

        }
    }
}

