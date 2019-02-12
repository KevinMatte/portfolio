import {SESSION_LOGIN, SESSION_LOGOUT} from "../actions";
import {initialState} from "../initialState";

export default function(session=initialState.session, action) {
    switch (action.type) {
        case SESSION_LOGIN:
            return {
                ...session,
                ...action.session
            };

        case SESSION_LOGOUT:
            return initialState.session;

        default:
            return session;
    }

}