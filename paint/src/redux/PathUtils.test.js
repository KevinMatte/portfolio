import * as pathUtils from "./PathUtils";

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