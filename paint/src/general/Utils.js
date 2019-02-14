// import $ from 'jquery';
// import React from 'react';

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

