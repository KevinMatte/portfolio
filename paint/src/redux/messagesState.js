/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {filterObject} from "../general/utils";
import {ReduxState} from "./reduxState";

export default class MessagesState extends ReduxState {
    constructor(initialState={
        list: [],
        messageId: 0,
        messageByField: {}
    }) {
        super("MessagesState", initialState);
    }

    static _add(dispatch, status, message, field = undefined) {

        if (typeof (message) !== 'string') {
            if (Array.isArray(message)) {
                message.forEach(submessage => MessagesState._add(dispatch, status, submessage));
            } else if (message.hasOwnProperty('message')) {
                let messageField = message.hasOwnProperty('field') ? message.field : undefined;
                let messageStatus = message.hasOwnProperty('status') ? message.status : undefined;
                MessagesState._add(dispatch, messageStatus, message.message, messageField);
            } else {
                return dispatch({
                    type: MessagesState.MESSAGES_ADD,
                    message,
                    field,
                    status,
                });
            }
        } else {
            return dispatch({
                type: MessagesState.MESSAGES_ADD,
                message,
                field,
                status,
            });
        }
    }

    static MESSAGES_ADD = "MESSAGES_ADD";

    static add = (status, message) => dispatch => {
        this._add(dispatch, status, message);
    };

    static getMessage = (message) => message ? message.message : null;

    // noinspection JSUnusedGlobalSymbols
    static addReducer = (messages, action) => {
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

    static MESSAGES_REMOVE_BY_FIELD = "MESSAGES_REMOVE_BY_FIELD";

    // noinspection JSUnusedGlobalSymbols
    static removeByField = (field) => {
        return {
            type: MessagesState.MESSAGES_REMOVE_BY_FIELD,
            field,
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static removeByFieldReducer = (messages, action) => {
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

    static MESSAGES_REMOVE = "MESSAGES_REMOVE";

    // noinspection JSUnusedGlobalSymbols
    static remove = (messageId) => {
        return {
            type: MessagesState.MESSAGES_REMOVE,
            messageId,
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static removeReducer = (messages, action) => {
        let predicate = message => message.messageId !== action.messageId;
        return {
            ...messages,
            list: messages.list.filter(predicate),
            messageByField: filterObject(messages.messageByField, predicate),
        };
    }

    static MESSAGES_TAKE = "MESSAGES_TAKE";

    // noinspection JSUnusedGlobalSymbols
    static take = (field) => {
        return {
            type: MessagesState.MESSAGES_TAKE,
            field,
        };
    }

    // noinspection JSUnusedGlobalSymbols
    static takeReducer = (messages, action) => {
        let predicate;
        let {messageKey} = action;
        if (action.field.endsWith('/'))
            predicate = message => !message.field || !message.field.startsWith(messageKey);
        else
            predicate = message => !message.field || message.field !== messageKey;

        return {
            ...messages,
            list: messages.list.filter(predicate),
        };
    }
}
