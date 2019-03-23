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
                        return method.apply(null, arguments);
                    };
                } else {
                    throw new Error(`${this.constructor.name}(reduxState) has no Action type for ${k}`);
                }
            }
        });
        return map;
    }

    getMapDispatchToProps(store) {
        let model = this.constructor;
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