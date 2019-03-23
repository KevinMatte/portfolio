import {getValueInfoByPath} from "../general/utils";

export function cloneParentState(state, path) {
    let {parentPath, value, valuePath} = getValueInfoByPath(state, path);

    let newState = Array.isArray(state) ? [...state] : {...state};
    let parent = newState;
    if (parentPath === undefined)
        return {newState, parent, parentPath, value, valuePath};

    parentPath.forEach((field) => {
        let value = parent[field];
        value = Array.isArray(value) ? [...value] : {...value};
        parent[field] = value;
        parent = value;
    });

    return {newState, parent, parentPath, value, valuePath};
}


export function setStateValueByPath(state, path, value) {
    if (path === null) {
        return Array.isArray(state) ? [...state] : {...state};
    }

    let {newState, parent, valuePath} = cloneParentState(state, path);

    if (valuePath.length > 1) {
        valuePath.slice(0, valuePath.length-1).forEach((field, index) => {
            let nextField = valuePath[index+1];
            parent[field] = isNaN(nextField) ? {} : [];
            parent = parent[field];
        });
        valuePath = [valuePath.pop()];
    }
    parent[valuePath[0]] = value;

    return newState;
}

export function deleteStateValueByPath(state, path) {
    if (path === null) {
        return Array.isArray(state) ? [] : {};
    }

    let {newState, parent, valuePath} = cloneParentState(state, path);
    let valueField = valuePath[0];
    if (isNaN(valueField))
        delete parent[valueField];
    else
        parent.splice(valueField, 1);

    return newState;
}

export function cloneObject(obj) {
    let newObject = obj;

    if (Array.isArray(obj)) {
        newObject = [];
        obj.every(value => {
            newObject.push(cloneObject(value));
            return true;
        });
    } else if (typeof (obj) === "object") {
        newObject = {};
        Object.keys(obj).every(key => {
            newObject[key] = cloneObject(obj[key]);
            return true;
        });
    }

    return newObject;
}

export function duplicateStateValueByPath(state, path, newField = null) {
    if (path === null) {
        return Array.isArray(state) ? [...state] : {...state};
    }

    let {newState, parent, valuePath} = cloneParentState(state, path);

    if (valuePath.length > 1) {
        valuePath.slice(0, valuePath.length-1).forEach((field, index) => {
            let nextField = valuePath[index+1];
            parent[field] = isNaN(nextField) ? {} : [];
            parent = parent[field];
        });
        valuePath = [valuePath.pop()];
    }
    let valueField = valuePath[0];

    let newValue = cloneObject(parent[valueField]);
    if (Array.isArray(parent)) {
        newField = (newField !== null) ? newField : valueField + 1;
        parent.splice(newField, 0, newValue);
    } else {
        parent[newField] = newValue;
    }

    return newState;
}