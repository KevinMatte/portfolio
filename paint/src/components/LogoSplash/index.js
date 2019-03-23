/* Copyright (C) 2019 Kevin Matte - All Rights Reserved */

import React, {Component} from 'react';
import {PropTypes} from 'prop-types';
import Logo from "./logo";

class LogoSplash extends Component {

    constructor(props) {
        super(props);

        this.gl = null;
        this.state = {
            hasWebGL: true,
        };
        this.canvasRef = React.createRef();
    }


    componentDidMount() {
        console.log("Mounted");
        // Initialize the GL context
        let canvas = this.canvasRef.current;

        if (canvas) {
            this.logo = new Logo(canvas);
            this.gl = this.logo.gl;
            if (this.gl === null) {
                this.setState({hasWebGL: false});
                return;
            }
            this.logo.startLogo();
            this.setState({hasWebGL: true});
        }
    };

    componentWillUnmount() {
        this.logo.deleteProgram();
    }


    render() {
        return (
            <div className="max_size">
                <canvas id="glCanvas" className="max_size" ref={this.canvasRef}>
                </canvas>
            </div>
        )
    }
}

LogoSplash.defaultProps = {
    words: "Hello there",
};

LogoSplash.propTypes = {
    words: PropTypes.string,
};

export default LogoSplash;
