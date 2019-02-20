/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import thunk from 'redux-thunk';
import {createStore, applyMiddleware, compose} from 'redux';
import {combineReducers} from "redux";
import Options from './actions/options';
import Session from './actions/session';
import Messages from './actions/messages';
import Drawing from './actions/drawing';

var rootReducer = combineReducers({
    session: Session.reducer,
    options: Options.reducer,
    messages: Messages.reducer,
    drawing: Drawing.reducer,
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
