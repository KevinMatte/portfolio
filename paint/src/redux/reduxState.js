import {cloneObject, getValueInfoByPath} from "../general/utils";

export class ReduxState {

    constructor(initialState) {
        this.map = null;
        this.initialState = initialState;
    }

    reducer = (state = this.initialState, action) => {
        if (this.map === null) {
            this.map = this.getActionMap();
        }
        let method = this.map[action.type];
        if (method)
            return method(state, action);
        else
            return state;
    };

    getActionMap() {
        let self = this;
        let map = {};
        let model = this.constructor;
        Object.getOwnPropertyNames(model).forEach((k) => {
            if (typeof (model[k]) === "function" && !k.endsWith("Reducer") && model.hasOwnProperty(`${k}Reducer`)) {
                // noinspection JSUnresolvedFunction
                let const_name = [...k].map(ch => ('A' <= ch && ch <= 'Z') ? `_${ch}` : ch.toUpperCase()).join("");
                let const_name_full = `${this.constructor.name.toUpperCase()}_${const_name}`;

                const_name = model.hasOwnProperty(const_name_full) ? const_name_full : const_name;
                if (model.hasOwnProperty(const_name)) {
                    let method = model[`${k}Reducer`];
                    map[model[const_name]] = function () {
                        return method.apply(self.constructor, arguments);
                    };
                } else {
                    throw new Error(`${this.constructor.name}(reduxState) has no Action type for ${k}`);
                }
            }
        });
        return map;
    }

    getMapDispatchToProps(store) {
        let self = this;
        let model = this.constructor;
        let props = {};
        Object.getOwnPropertyNames(model).forEach((k) => {
            if (typeof (model[k]) === "function" && !k.endsWith("Reducer") && model.hasOwnProperty(`${k}Reducer`)) {
                let const_name = [...k].map(ch => ('A' <= ch && ch <= 'Z') ? `_${ch}` : ch.toUpperCase()).join("");
                if (model.hasOwnProperty(const_name)) {
                    props[k] = function () {
                        store.dispatch(model[k].apply(self.constructor, arguments));
                    }
                }
            }
        });
        return props;
    }


    static cloneParentState(state, path) {
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

    static setStateValueByPath(state, path, value) {
        if (path === null) {
            return Array.isArray(state) ? [...state] : {...state};
        }

        let {newState, parent, valuePath} = this.cloneParentState(state, path);

        if (valuePath.length > 1) {
            valuePath.slice(0, valuePath.length - 1).forEach((field, index) => {
                let nextField = valuePath[index + 1];
                parent[field] = isNaN(nextField) ? {} : [];
                parent = parent[field];
            });
            valuePath = [valuePath.pop()];
        }
        parent[valuePath[0]] = value;

        return newState;
    }

    static deleteStateValueByPath(state, path) {
        if (path === null) {
            return Array.isArray(state) ? [] : {};
        }

        let {newState, parent, valuePath} = this.cloneParentState(state, path);
        let valueField = valuePath[0];
        if (isNaN(valueField))
            delete parent[valueField];
        else
            parent.splice(valueField, 1);

        return newState;
    }

    static duplicateStateValueByPath(state, path, newField = null) {
        if (path === null) {
            return Array.isArray(state) ? [...state] : {...state};
        }

        let {newState, parent, valuePath} = this.cloneParentState(state, path);

        if (valuePath.length > 1) {
            valuePath.slice(0, valuePath.length - 1).forEach((field, index) => {
                let nextField = valuePath[index + 1];
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
}