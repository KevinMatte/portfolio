import * as pathUtils from "./pathUtils";

test('setStateValueByPath(state, path, value)', () => {

    let result, expected;
    let state = { a: [1,2,3], b: { c:[4]}};
    let orgState = { a: [1,2,3], b: { c:[4]}};

    expected = pathUtils.cloneObject(state);
    result = pathUtils.setStateValueByPath(state, null, null);
    expect(result).not.toBe(state);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = pathUtils.cloneObject(state);
    expected.a[1] = 5;
    result = pathUtils.setStateValueByPath(state, "a/1", 5);
    expect(result).toEqual(expected);
    result = pathUtils.setStateValueByPath(state, ["a", 1], 5);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

});

test('deleteStateValueByPath(state, path, value)', () => {

    let result, expected;
    let state = { a: [1,2,3], b: { c:[4]}};
    let orgState = { a: [1,2,3], b: { c:[4]}};

    expected = pathUtils.cloneObject(state);
    expected.a = [1, 3];
    result = pathUtils.deleteStateValueByPath(state, "a/1");
    expect(result).toEqual(expected);
    result = pathUtils.deleteStateValueByPath(state, ["a", 1]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = pathUtils.cloneObject(state);
    expected.b = {};
    result = pathUtils.deleteStateValueByPath(state, "b/c");
    expect(result).toEqual(expected);
    result = pathUtils.deleteStateValueByPath(state, ["b", "c"]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

});


test('duplicateStateValueByPath(state, path, newField)', () => {

    let result, expected;
    let state = { a: [1,2,3], b: { c:[4]}};
    let orgState = { a: [1,2,3], b: { c:[4]}};

    expected = pathUtils.cloneObject(state);
    expected.b.d = pathUtils.cloneObject(expected.b.c);
    result = pathUtils.duplicateStateValueByPath(state, "b/c", "d");
    expect(result).toEqual(expected);
    result = pathUtils.duplicateStateValueByPath(state, ["b", "c"], "d");
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = pathUtils.cloneObject(state);
    expected.b.d = pathUtils.cloneObject(expected.b.c);
    result = pathUtils.duplicateStateValueByPath(state, "b/c", "d");
    expect(result).toEqual(expected);
    result = pathUtils.duplicateStateValueByPath(state, ["b", "c"], "d");
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = pathUtils.cloneObject(state);
    expected.a = [1, 2, 2, 3];
    result = pathUtils.duplicateStateValueByPath(state, "a/1");
    expect(result).toEqual(expected);
    result = pathUtils.duplicateStateValueByPath(state, ["a", 1]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = pathUtils.cloneObject(state);
    expected.a = [1, 1, 2, 3];
    result = pathUtils.duplicateStateValueByPath(state, "a/0");
    expect(result).toEqual(expected);
    result = pathUtils.duplicateStateValueByPath(state, ["a", 0]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);

    expected = pathUtils.cloneObject(state);
    expected.a = [1, 2, 3, 3];
    result = pathUtils.duplicateStateValueByPath(state, "a/2");
    expect(result).toEqual(expected);
    result = pathUtils.duplicateStateValueByPath(state, ["a", 2]);
    expect(result).toEqual(expected);
    expect(state).toEqual(orgState);
});

test('cloneParentState', () => {
    let state = {a: [1, 2, 3], b: {c: [4]}};

   expect(pathUtils.cloneParentState(state, "a/2")).toEqual({
       newState: {...state},
       parent: [1,2,3],
       parentPath: ["a"],
       value: 3,
       valuePath: [2],
   });

   expect(pathUtils.cloneParentState(state, "b/c/1/2")).toEqual({
       newState: {...state},
       parent: [4],
       parentPath: ["b", "c"],
       value: undefined,
       valuePath: [1, 2],
   });
});