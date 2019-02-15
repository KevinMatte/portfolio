// import $ from 'jquery';
// import React from 'react';

export const ID_TOKEN_KEY = 'sessionid_token';

export const button_style = {
    margin: 5
};

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


export function logout() {
    sessionStorage.removeItem(ID_TOKEN_KEY);
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
    return fetch(`/paint/api/${url}`, {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "same-origin", // include, *same-origin, omit
        headers: getFetchHeaders(),
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(postData), // body data type must match "Content-Type" header
    }).then((response) => {
        if (response.ok)
            return Promise.all([response, response.json()]);
        else
            return Promise.all([response, undefined]);
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


