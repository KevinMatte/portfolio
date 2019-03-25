/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import thunk from 'redux-thunk';
import {createStore, applyMiddleware, compose} from 'redux';
import {combineReducers} from "redux";
import OptionsState from './optionsState';
import TempState from './tempState'
import UserSessionState from './userSessionState';
import MessagesState from './messagesState';
import TreeState from './treeState';

const rootReducer = combineReducers({
    session: new UserSessionState().reducer,
    options: new OptionsState().reducer,
    tempValues: new TempState().reducer,
    messages: new MessagesState().reducer,
    treeModel: new TreeState().reducer,
});


const middleWare = [
    thunk,
];

// noinspection JSUnresolvedVariable
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, {}, composeEnhancers(
    applyMiddleware(...middleWare)
));

export default store;
