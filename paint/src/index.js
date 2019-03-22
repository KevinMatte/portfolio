/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Provider} from "react-redux";
import store from "./redux";
import {setupDemo} from "./demo";

setupDemo();

const rootElement = document.getElementById('root');
ReactDOM.render(
    <Provider store={store}>
        <App/>
    </Provider>,
    rootElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
