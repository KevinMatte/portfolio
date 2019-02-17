import {ADVANCED_MODE_TOGGLE} from "../actions";

export default class Options {
    static toggleAdvancedMode() {
        return {
            type: ADVANCED_MODE_TOGGLE,
        };
    }
}