import thunk from 'redux-thunk';
import {createStore, applyMiddleware, compose} from 'redux';
import {combineReducers} from "redux";
import Options from '../actions/options';
import Session from '../actions/session';

var rootReducer = combineReducers({
    session: Session.reducer,
    options: Options.reducer,
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
