/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import thunk from 'redux-thunk';
import {createStore, applyMiddleware, compose} from 'redux';
import {combineReducers} from "redux";
import Options from './options';
import TempValues from './tempValues'
import Session from './session';
import Messages from './messages';
import Drawing from './drawing';

var rootReducer = combineReducers({
    session: Session.reducer,
    options: Options.reducer,
    tempValues: TempValues.reducer,
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
