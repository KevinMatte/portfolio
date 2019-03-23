export class BaseController {

    constructor(props, hooks = null) {
        this.props = props;
        this.hooks = hooks;
    }

    getValue = (name) => this.hooks[name][0];
    setValue = (name, value) => this.hooks[name][1](value);
    getValues = () => Object.keys(this.hooks).reduce(
        (dst, key) => {
            dst[key] = this.hooks[key][0];
            return dst;
        }, {}
    );

    static getController(aClass, props, hooks=null) {
        let controller;
        if (props.controller) {
            controller = props.controller;
            controller.props = props;
            controller.hooks = hooks
        }
        else
            controller = new aClass(props, hooks);

        return controller;
    }

    handleTextChange = (event) => {
        this.setValue(event.target.name, event.target.value);
    };
}