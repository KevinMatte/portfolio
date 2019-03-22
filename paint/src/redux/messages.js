/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {filterObject} from "../general/utils";
import {ReduxState} from "./reduxState";

export default class Messages extends ReduxState {
    constructor(initialState={
        list: [],
        messageId: 0,
        messageByField: {}
    }) {
        super(Messages, initialState);
    }

    static SESSION_MESSAGE = "SESSION_MESSAGE";

    static _add(dispatch, status, message, field = undefined) {

        if (typeof (message) !== 'string') {
            if (Array.isArray(message)) {
                message.forEach(submessage => Messages._add(dispatch, status, submessage));
            } else if (message.hasOwnProperty('message')) {
                let messageField = message.hasOwnProperty('field') ? message.field : undefined;
                let messageStatus = message.hasOwnProperty('status') ? message.status : undefined;
                Messages._add(dispatch, messageStatus, message.message, messageField);
            } else {
                return dispatch({
                    type: Messages.SESSION_MESSAGE,
                    message,
                    field,
                    status,
                });
            }
        } else {
            return dispatch({
                type: Messages.SESSION_MESSAGE,
                message,
                field,
                status,
            });
        }
    }

    static add = (status, message) => dispatch => {
        Messages._add(dispatch, status, message);
    };

    static getMessage = (message) => message ? message.message : null;

    static addReducer(messages, action) {
        let messageId = messages.messageId + 1;
        let {status, message, field} = action;
        let newMessage = {
            messageId,
            message,
            field,
            status,
        };
        let messageByField = messages.messageByField;
        if (field) {
            if (message)
                messageByField = {...messageByField, [field]: newMessage};
            else {
                messageByField = {...messageByField};
                delete messageByField[field];
            }
        }

        return {
            ...messages,
            messageId,
            list: Array.of(...messages.list, newMessage),
            messageByField,
        }
    }

    static MESSAGE_REMOVE_BY_FIELD = "MESSAGE_REMOVE_BY_FIELD";

    static removeByField(field) {
        return {
            type: Messages.MESSAGE_REMOVE_BY_FIELD,
            field,
        };
    }

    static removeByFieldReducer(messages, action) {
        let predicate;
        if (action.field.endsWith('/'))
            predicate = message => !message.field || !message.field.startsWith(action.field);
        else
            predicate = message => !message.field || message.field !== action.field;

        return {
            ...messages,
            list: messages.list.filter(predicate),
            messageByField: filterObject(messages.messageByField, predicate),
        };
    }

    static MESSAGE_REMOVE = "MESSAGE_REMOVE";

    static remove(messageId) {
        return {
            type: Messages.MESSAGE_REMOVE,
            messageId,
        };
    }

    static removeReducer(messages, action) {
        let predicate = message => message.messageId !== action.messageId;
        return {
            ...messages,
            list: messages.list.filter(predicate),
            messageByField: filterObject(messages.messageByField, predicate),
        };
    }

    static MESSAGE_TAKE = "MESSAGE_TAKE";

    static take(field) {
        return {
            type: Messages.MESSAGE_TAKE,
            field,
        };
    }

    static takeReducer(messages, action) {
        let predicate;
        if (action.field.endsWith('/'))
            predicate = message => !message.field || !message.field.startsWith(action.messageKey);
        else
            predicate = message => !message.field || message.field !== action.messageKey;

        return {
            ...messages,
            list: messages.list.filter(predicate),
        };
    }
}
