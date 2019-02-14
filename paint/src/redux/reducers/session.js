import {SESSION_LOGIN, SESSION_LOGOUT, SESSION_MESSAGE, SESSION_MESSAGE_REMOVE} from "../actions";
import {initialState} from "../initialState";

export default function (session = initialState.session, action) {
    switch (action.type) {
        case SESSION_LOGIN:
            return {
                ...session,
                ...action.session
            };

        case SESSION_LOGOUT:
            return initialState.session;

        case SESSION_MESSAGE:
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
            };

        case SESSION_MESSAGE_REMOVE:
            return {
                ...session,
                messages: session.messages.filter(message => message.messageId !== action.messageId)
            };

        default:
            return session;
    }

}