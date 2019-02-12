import { SESSION_LOGIN, SESSION_LOGOUT, ADVANCED_MODE_TOGGLE } from './redux/actions'

export function sessionLogin() {
    return {
        type: SESSION_LOGIN,
        session: {
            sessionId: 1,
        }
    };
}

export function sessionLogout() {
    return {
        type: SESSION_LOGOUT,
    };
}

export function toggleAdvancedMode() {
    return {
        type: ADVANCED_MODE_TOGGLE,
    };
}

