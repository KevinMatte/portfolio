import {combineReducers} from "redux";
import session from './session';
import options from './options';

export default combineReducers({
    session,
    options,
});
