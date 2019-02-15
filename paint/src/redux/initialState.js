import {ID_TOKEN_KEY} from "../general/Utils";

export var initialState = {
    options: {
        advancedMode: false
    },
    session: {
        sessionId: sessionStorage.getItem(ID_TOKEN_KEY),
        permissions: [],
        title: "Kevin Matte's Portfolio",
        messages: [],
        messageId: 0,
    }
};
