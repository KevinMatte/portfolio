export function setStateValueByPath(state, path, value) {
    path = Array.isArray(path) ? path : path.split("/");
    let valueField = path.pop();

    let newState = Array.isArray(state) ? [...state] : {...state};

    let parent = newState;
    path.every(pathNode => {
        let child = parent[pathNode];
        child = Array.isArray(child) ? [...child] : {...child};
        parent[pathNode] = child;
        parent = child;
        return true;
    });
    parent[valueField] = value;

    return newState;
}

export function deleteStateValueByPath(state, path, newField = null) {
    path = Array.isArray(path) ? path : path.split("/");
    let valueField = path.pop();

    let newState = Array.isArray(state) ? [...state] : {...state};

    let parent = newState;
    path.every(pathNode => {
        let child = parent[pathNode];
        child = Array.isArray(child) ? [...child] : {...child};
        parent[pathNode] = child;
        parent = child;
        return true;
    });
    if (Array.isArray(parent)) {
        parent.splice(valueField, 1);
    } else {
        delete parent[valueField];
    }

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
    path = Array.isArray(path) ? path : path.split("/");
    let valueField = path.pop();

    let newState = Array.isArray(state) ? [...state] : {...state};

    let parent = newState;
    path.every(pathNode => {
        let child = parent[pathNode];
        child = Array.isArray(child) ? [...child] : {...child};
        parent[pathNode] = child;
        parent = child;
        return true;
    });
    if (Array.isArray(parent)) {
        newField = (newField !== null) ? newField : valueField + 1;
        parent.splice(valueField + 1, 0, cloneObject(parent[valueField]));
    } else {
        parent[newField] = cloneObject(parent[valueField]);
    }

    return newState;
}