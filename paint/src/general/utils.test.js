import * as utils from "./utils";

// noinspection ES6ModulesDependencies
test('getValueInfoByPath', () => {

    let state = {a: [1, 2, 3], b: {c: [4]}};

    expect(utils.getValueInfoByPath(state, "a/1")).toEqual({
        "parent": [1, 2, 3],
        "parentPath": ["a"],
        "value": 2,
        "valuePath": [1]
    });

    expect(utils.getValueInfoByPath(state, "a/1/c")).toEqual({
        "parent": [1, 2, 3],
        "parentPath": ["a", 1],
        "value": undefined,
        "valuePath": ["c"]
    });
});