import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import fetchMock from 'fetch-mock'
import UserSessionState from "./userSessionState";
import MessagesState from "./messagesState";
import {combineReducers} from "redux";
import {ID_TOKEN_KEY} from "../general/utils";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


afterEach(() => {
    fetchMock.restore();
});

it('register', () => {

    fetchMock.postOnce('/paint/api/register', {
        body: {status: "success", result: "a session id"},
        headers: {'content-type': 'application/json'}
    });

    const expectedActions = [
        {type: MessagesState.MESSAGES_REMOVE_BY_FIELD, field: "register/"},
        {type: UserSessionState.USER_SESSION_REGISTER, session: {sessionId: "a session id"}}
    ];

    const rootReducer = combineReducers({
        session: new UserSessionState().reducer,
        messages: new MessagesState().reducer,
    });
    const store = mockStore(rootReducer);

    return store.dispatch(UserSessionState.register('email@gmail.com', 'user name', 'a password')).then(() => {
        // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
        expect(sessionStorage.getItem(ID_TOKEN_KEY)).toBe("a session id");
    });
});

it('login', () => {
    fetchMock.postOnce('/paint/api/login', {
        body: {status: "success", result: "a session id2"},
        headers: {'content-type': 'application/json'}
    });

    const expectedActions = [
        {type: MessagesState.MESSAGES_REMOVE_BY_FIELD, field: "login/"},
        {type: UserSessionState.USER_SESSION_LOGIN, session: {sessionId: "a session id2"}}
    ];

    const rootReducer = combineReducers({
        session: new UserSessionState().reducer,
        messages: new MessagesState().reducer,
    });
    const store = mockStore(rootReducer);

    return store.dispatch(UserSessionState.login('user name', 'a password')).then(() => {
        // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
        expect(sessionStorage.getItem(ID_TOKEN_KEY)).toBe("a session id2");
    });
});

it('logout', () => {
    fetchMock.postOnce('/paint/api/logout', {
        body: {status: "success"},
        headers: {'content-type': 'application/json'}
    });

    const expectedActions = [
        {type: UserSessionState.USER_SESSION_LOGOUT}
    ];

    const rootReducer = combineReducers({
        session: new UserSessionState().reducer,
        messages: new MessagesState().reducer,
    });
    const store = mockStore(rootReducer);

    return store.dispatch(UserSessionState.logout('user name', 'a password')).then(() => {
        // return of async actions
        expect(store.getActions()).toEqual(expectedActions);
        expect(sessionStorage.getItem(ID_TOKEN_KEY)).toBe(null);
    });
});
