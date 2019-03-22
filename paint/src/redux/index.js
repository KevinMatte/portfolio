/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import thunk from 'redux-thunk';
import {createStore, applyMiddleware, compose} from 'redux';
import {combineReducers} from "redux";
import Options from './options';
import TempValues from './tempValues'
import Session from './session';
import Messages from './messages';
import TreeModel from './treeModel';

var rootReducer = combineReducers({
    session: new Session().reducer,
    options: new Options().reducer,
    tempValues: new TempValues().reducer,
    messages: new Messages().reducer,
    treeModel: new TreeModel().reducer,
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
