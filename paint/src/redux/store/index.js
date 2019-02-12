import thunk from 'redux-thunk';
import {createStore, applyMiddleware} from 'redux';
import rootReducer from '../reducers'

const middleWare = [
    thunk,
];

const store = createStore(rootReducer, {}, applyMiddleware(...middleWare));

export default store;
