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

    handleTextChange = (event) => {
        this.setValue(event.target.name, event.target.value);
    };
}