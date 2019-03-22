import TreeModel from "./treeModel";

export class ReduxState {

    constructor(model, initialState) {
        this.map = null;
        this.model = model;
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
        let map = {};
        let model = this.model;
        Object.getOwnPropertyNames(model).forEach((k) => {
            if (typeof (model[k]) === "function" && !k.endsWith("Reducer") && model.hasOwnProperty(`${k}Reducer`)) {
                let const_name = [...k].map(ch => ('A' <= ch && ch <= 'Z') ? `_${ch}` : ch.toUpperCase()).join("");
                if (model.hasOwnProperty(const_name)) {
                    let method = model[`${k}Reducer`];
                    map[model[const_name]] = function () {
                        return method.apply(null, arguments);
                    };
                }
            }
        });
        return map;
    }

    getMapDispatchToProps(store) {
        let model = this.model;
        let props = {};
        Object.getOwnPropertyNames(model).forEach((k) => {
            if (typeof (model[k]) === "function" && !k.endsWith("Reducer") && model.hasOwnProperty(`${k}Reducer`)) {
                let const_name = [...k].map(ch => ('A' <= ch && ch <= 'Z') ? `_${ch}` : ch.toUpperCase()).join("");
                if (model.hasOwnProperty(const_name)) {
                    props[k] = function () {
                        store.dispatch(model[k].apply(null, arguments));
                    }
                }
            }
        });
        return props;
    }
}