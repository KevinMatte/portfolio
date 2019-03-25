/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import {cloneObject} from "../general/utils";
import {ReduxState} from "./reduxState";

// noinspection ES6ModulesDependencies
test('setStateValueByPath(state, path, value)', () => {

    let result, expected;
    let state = { a: [1,2,3], b: { c:[4]}};
    let orgState = { a: [1,2,3], b: { c:[4]}};

    expected = cloneObject(state);
    result = ReduxState.setStateValueByPath(state, null, null);
    expect(result).not.toBe(state);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = cloneObject(state);
    expected.a[1] = 5;
    result = ReduxState.setStateValueByPath(state, "a/1", 5);
    expect(result).toEqual(expected);
    result = ReduxState.setStateValueByPath(state, ["a", 1], 5);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

});

// noinspection ES6ModulesDependencies
test('deleteStateValueByPath(state, path, value)', () => {

    let result, expected;
    let state = { a: [1,2,3], b: { c:[4]}};
    let orgState = { a: [1,2,3], b: { c:[4]}};

    expected = cloneObject(state);
    expected.a = [1, 3];
    result = ReduxState.deleteStateValueByPath(state, "a/1");
    expect(result).toEqual(expected);
    result = ReduxState.deleteStateValueByPath(state, ["a", 1]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = cloneObject(state);
    expected.b = {};
    result = ReduxState.deleteStateValueByPath(state, "b/c");
    expect(result).toEqual(expected);
    result = ReduxState.deleteStateValueByPath(state, ["b", "c"]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

});


// noinspection ES6ModulesDependencies
test('duplicateStateValueByPath(state, path, newField)', () => {

    let result, expected;
    let state = { a: [1,2,3], b: { c:[4]}};
    let orgState = { a: [1,2,3], b: { c:[4]}};

    expected = cloneObject(state);
    expected.b.d = cloneObject(expected.b.c);
    result = ReduxState.duplicateStateValueByPath(state, "b/c", "d");
    expect(result).toEqual(expected);
    result = ReduxState.duplicateStateValueByPath(state, ["b", "c"], "d");
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = cloneObject(state);
    expected.b.d = cloneObject(expected.b.c);
    result = ReduxState.duplicateStateValueByPath(state, "b/c", "d");
    expect(result).toEqual(expected);
    result = ReduxState.duplicateStateValueByPath(state, ["b", "c"], "d");
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = cloneObject(state);
    expected.a = [1, 2, 2, 3];
    result = ReduxState.duplicateStateValueByPath(state, "a/1");
    expect(result).toEqual(expected);
    result = ReduxState.duplicateStateValueByPath(state, ["a", 1]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = cloneObject(state);
    expected.a = [1, 1, 2, 3];
    result = ReduxState.duplicateStateValueByPath(state, "a/0");
    expect(result).toEqual(expected);
    result = ReduxState.duplicateStateValueByPath(state, ["a", 0]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = cloneObject(state);
    expected.a = [1, 2, 3, 3];
    result = ReduxState.duplicateStateValueByPath(state, "a/2");
    expect(result).toEqual(expected);
    result = ReduxState.duplicateStateValueByPath(state, ["a", 2]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);
});

// noinspection ES6ModulesDependencies
test('cloneParentState', () => {
    let state = {a: [1, 2, 3], b: {c: [4]}};

   expect(ReduxState.cloneParentState(state, "a/2")).toEqual({
       newState: {...state},
       parent: [1,2,3],
       parentPath: ["a"],
       value: 3,
       valuePath: [2],
   });

   expect(ReduxState.cloneParentState(state, "b/c/1/2")).toEqual({
       newState: {...state},
       parent: [4],
       parentPath: ["b", "c"],
       value: undefined,
       valuePath: [1, 2],
   });
});
