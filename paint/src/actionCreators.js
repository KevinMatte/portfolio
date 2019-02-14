import {SESSION_LOGIN, SESSION_LOGOUT, SESSION_MESSAGE, ADVANCED_MODE_TOGGLE} from './redux/actions'
import {apiPost, ID_TOKEN_KEY} from "./general/Utils";

export function sessionLogin(username, password) {
    return dispatch => {
        return apiPost('api/login', {username, password}).then(({status, result}) => {
            if (status === "success") {
                    sessionStorage.setItem(ID_TOKEN_KEY, result.auth_token);
                    dispatch({
                        type: SESSION_LOGIN,
                        session: {
                            sessionId: 1,
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

export function sessionLogout() {
    return dispatch => {
        return apiPost('api/logout')
            .then((response) => {
                if (!response.ok) {
                    dispatch({
                        type: SESSION_MESSAGE,
                        message: response.statusText,
                    });
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === "success") {
                    sessionStorage.removeItem(ID_TOKEN_KEY);
                    dispatch({
                        type: SESSION_LOGOUT,
                    });
                } else {
                    dispatch({
                        type: SESSION_MESSAGE,
                        message: data.message,
                    });
                }
            });

    }
}

export function toggleAdvancedMode() {
    return {
        type: ADVANCED_MODE_TOGGLE,
    };
}

