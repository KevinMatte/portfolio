/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

// import $ from 'jquery';
import React from 'react';

export const ID_TOKEN_KEY = 'sessionid_token';

export function getValueByPath(obj, path, defaultValue) {
    let {value} = getValueInfoByPath(obj, path);

    return value === undefined ? defaultValue : value;
}

export function getPathArray(path) {
    if (path === null)
        return path;

    if (!Array.isArray(path)) {
        path = path.split("/");
    }
    path = path.map(field => {
        let index = parseInt(field);
        if (!isNaN(index))
            field = index;
        return field;
    });
    return path;
}

export function getValueInfoByPath(obj, path) {
    let parent, parentPath, value, valuePath;
    path = getPathArray(path);
    if (path === null)
        { // noinspection JSUnusedAssignment
            return {parent, parentPath, value, valuePath};
        }

    parent = obj;
    value = parent;
    path.find((name, index) => {
        if (!value.hasOwnProperty(name)) {
            parentPath = path.slice(0, index);
            valuePath = path.slice(index);
            value = undefined;
            return true;
        }
        parent = value;
        value = value[name];
        return false;
    });
    if (parentPath === undefined) {
        parentPath = [...path];
        valuePath = parentPath.length ? [parentPath.pop()] : [];
    }

    return {parent, parentPath, value, valuePath}
}

// noinspection JSUnusedGlobalSymbols
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

// noinspection JSUnusedGlobalSymbols
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


// noinspection JSUnusedGlobalSymbols
export function getRootMatchPath(match) {
    let path = match.path;
    let iColon = path.indexOf('/:');
    if (iColon >= 0)
        path = path.slice(0, iColon);
    return path;
}

// noinspection JSUnusedGlobalSymbols
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
        lines = text.map(line => line.trimRight());
    else if (text instanceof Response) {
        lines = [`${text.status}: ${text.statusText}`]
    } else
        lines = (text || "").trimRight().split("\n");
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
            return response.json();
        else
            return Promise.reject(response);
    }).then(data => {
        return data;
    }).catch(result => {
        return Promise.resolve({status: "error", result});
    });
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