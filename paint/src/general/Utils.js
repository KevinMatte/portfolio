/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

// import $ from 'jquery';
import React from 'react';

export const ID_TOKEN_KEY = 'sessionid_token';

export class Utils {

    static compareObjects(o1, o2) {
        let p;
        for (p in o1) {
            if (o1.hasOwnProperty(p)) {
                if (o1[p] !== o2[p]) {
                    return false;
                }
            }
        }
        for (p in o2) {
            if (o2.hasOwnProperty(p)) {
                if (o1[p] !== o2[p]) {
                    return false;
                }
            }
        }
        return true;
    }

}

export function getValueByPath(obj, path, defaultValue) {
    if (!Array.isArray(path)) {
        path = path.split("/").map(field => {
            let index = Number(field);
            if (Number.isInteger(index))
                field = index;
            return field;
        });
    }

    let value = path.reduce((dst, name, index) => {
        if (dst === undefined || !dst.hasOwnProperty(name)) {
            if (index < path.length - 1) {
                return undefined;
            } else {
                return defaultValue;
            }
        }
        return dst[name];
    }, obj);

    return value;
}

export function getStateWithValueByPath(state, path, value) {
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

export function compareObjects(obj1, obj2) {
    return Object.keys(obj1).length === Object.keys(obj2).length &&
        Object.keys(obj1).every(key =>
            obj2.hasOwnProperty(key) && obj1[key] === obj2[key]
        );
}

export function getGridCellStyle(startRow, startCol, endRow, endCol) {
    endRow = (endRow !== undefined) ? endRow : startRow;
    endCol = (endCol !== undefined) ? endCol : startCol;

    return {gridArea: `${startRow} / ${startCol} / ${endRow} / ${endCol}`};
}

export function setValueByPath(obj, path, value) {
    let field, parentPath, parentObj;
    if (Array.isArray(path)) {
        parentPath = [...path];
        field = parentPath.pop();
        parentObj = getValueByPath(obj, parentPath);
        parentObj[field] = value;
    } else {
        obj[path] = value;
    }
    return obj;
}


export function getRootMatchPath(match) {
    let path = match.path;
    let iColon = path.indexOf('/:');
    if (iColon >= 0)
        path = path.slice(0, iColon);
    return path;
}

export function replaceMatchPathWithParameters(match) {
    let pos = 1;
    let path = match.path;
    let endingSlash = path.endsWith("/");
    if (!endingSlash)
        path += "/";

    while (pos < arguments.length) {
        let name = arguments[pos];
        let value = arguments[pos + 1];
        if (match.params.hasOwnProperty(name)) {
            if (value)
                path = path.replace(':' + name + "/", value + "/");
            else
                path = path.replace(':' + name + "/", "/");
        } else {
            if (value)
                path += value + "/";
        }

        pos += 2;
    }

    if (!endingSlash)
        path = path.slice(0, -1);
    return path;
}

export function renderText(text) {
    let lines;
    if (Array.isArray(text))
        lines = text.map(line => line.trimEnd());
    else if (text instanceof Response) {
        lines = [`${text.status}: ${text.statusText}`]
    } else
        lines = (text || "").trimEnd().split("\n");
    return lines.map((line, idx) => <pre key={"key_" + idx}>{line}</pre>);
}

export function filterObject(obj, predicate) {
    return Object.keys(obj)
        .filter(key => predicate(obj[key]))
        .reduce((res, key) => {
            res[key] = obj[key];
            return res
        }, {});
}


function getIdToken() {
    return sessionStorage.getItem(ID_TOKEN_KEY);
}

export function isLoggedIn() {
    const idToken = getIdToken();
    return !!idToken;
}


function getFetchHeaders() {
    let headers = {
        "Content-Type": "application/json",
    };
    if (isLoggedIn())
        headers["Authorization"] = `Bearer ${getIdToken()}`;
    return headers;
}

export function apiPost(url, postData = {}) {
    let headers = getFetchHeaders();
    let apiUrl = `/paint/api/${url}`;
    return fetch(apiUrl, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: headers,
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(postData), // body data type must match "Content-Type" header
    }).then((response) => {
        if (response.ok)
            return Promise.all([response, response.json()]);
        else
            return Promise.reject(response);
    }).then(([response2, data]) => {
        if (response2.ok) {
            return data;
        } else {
            return {status: data.status, result: response2.statusText};
        }
    }).catch(result => {
        return Promise.resolve({status: "error", result});
    });
}


