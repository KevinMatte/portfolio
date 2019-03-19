import {vec3, mat4} from 'gl-matrix';

const cubeVertices = [
    -1, -1, +1,  // 0
    +1, -1, +1,  // 1
    +1, +1, +1,  // 2
    -1, +1, +1,  // 3
    -1, -1, -1,  // 4
    -1, +1, -1,  // 5
    +1, +1, -1,  // 6
    +1, -1, -1,  // 7
    -1, +1, -1,  // 8
    -1, +1, +1,  // 9
    +1, +1, +1,  // 10
    +1, +1, -1,  // 11
    -1, -1, -1,  // 12
    +1, -1, -1,  // 13
    +1, -1, +1,  // 14
    -1, -1, +1,  // 15
    +1, -1, -1,  // 16
    +1, +1, -1,  // 17
    +1, +1, +1,  // 18
    +1, -1, +1,  // 19
    -1, -1, -1,  // 20
    -1, -1, +1,  // 21
    -1, +1, +1,  // 22
    -1, +1, -1,  // 23
];
const cubeIndices = [
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    8, 9, 10, 8, 10, 11,
    12, 13, 14, 12, 14, 15,
    16, 17, 18, 16, 18, 19,
    20, 21, 22, 20, 22, 23,
];

export default class Logo {

    constructor(canvas) {
        this.cubeRotation = 0.0;
        this.isRunning = true;
        this.shaderProgram = null;
        this.canvas = canvas;
        this.then = 0;
        let realToCSSPixels = window.devicePixelRatio;
        this.canvas.width = Math.floor(this.canvas.clientWidth * realToCSSPixels);
        this.canvas.height = Math.floor(this.canvas.clientHeight * realToCSSPixels);

        this.attributes = [];

        this.gl = this.canvas.getContext("webgl");
        this.programInfo = {};
        this.buffers = {};

        this.positions = [];
        this.colors = [];
        this.indices = [];

        this.addCube([+0.0, +0.0, +0.0], [+0.0, +1.0, +0.0], [+1.0, +0.0, +0.0]);
        // this.addCube([+0.0, +0.0, +2.0], [+0.0, +0.5, +0.0], [+1.0, +0.0, +0.0]);
        // this.addCube([+2.0, +0.0, +0.0], [+0.0, +0.5, +0.0], [+1.0, +0.0, +0.0]);
        // this.addCube([+0.0, +2.0, +0.0], [+0.0, +1.0, +0.0], [+0.5, +0.0, +0.0]);
        // this.addCube([+3.0, +0.0, +3.0], [+0.0, +1.0, +0.0], [+0.5, +0.0, +0.0]);
    }

    addCube(center, up, right, forward) {
        if (forward === undefined || forward === null) {
            forward = vec3.create();
            vec3.cross(forward, right, up);
        }

        function addVertex(x, y, z) {
            let res = [...center];
            for (let i = 0; i < 3; i++)
                res[i] += x * right[i] + y * up[i] + z * forward[i];
            return res;
        }

        let is = this.positions.length / 3;
        let v1 = addVertex(-1.0, -1.0, +1.0);
        let v2 = addVertex(+1.0, -1.0, +1.0);
        let v3 = addVertex(+1.0, +1.0, +1.0);
        let v4 = addVertex(-1.0, +1.0, +1.0);
        let v5 = addVertex(-1.0, -1.0, -1.0);
        let v6 = addVertex(-1.0, +1.0, -1.0);
        let v7 = addVertex(+1.0, +1.0, -1.0);
        let v8 = addVertex(+1.0, -1.0, -1.0);
        this.positions = [...this.positions,
            ...v1, ...v2, ...v3, ...v4,
            ...v5, ...v6, ...v7, ...v8,
            ...v6, ...v4, ...v3, ...v7,
            ...v5, ...v8, ...v2, ...v1,
            ...v8, ...v7, ...v3, ...v2,
            ...v5, ...v1, ...v4, ...v6,
        ];

        const faceColors = [
            [1.0, 1.0, 1.0, 1.0],    // Front face: white
            [1.0, 0.0, 0.0, 1.0],    // Back face: red
            [0.0, 1.0, 0.0, 1.0],    // Top face: green
            [0.0, 0.0, 1.0, 1.0],    // Bottom face: blue
            [1.0, 1.0, 0.0, 1.0],    // Right face: yellow
            [1.0, 0.0, 1.0, 1.0],    // Left face: purple
        ];
        for (let j = 0; j < faceColors.length; ++j) {
            const c = faceColors[j];
            this.colors = this.colors.concat(c, c, c, c);
        }

        this.indices = [...this.indices,
            is + 0, is + 1, is + 2, is + 0, is + 2, is + 3,    // front
            is + 4, is + 5, is + 6, is + 4, is + 6, is + 7,    // back
            is + 8, is + 9, is + 10, is + 8, is + 10, is + 11,   // top
            is + 12, is + 13, is + 14, is + 12, is + 14, is + 15,   // bottom
            is + 16, is + 17, is + 18, is + 16, is + 18, is + 19,   // right
            is + 20, is + 21, is + 22, is + 20, is + 22, is + 23,   // left
        ];
        console.log(JSON.stringify(this.positions));
        console.log(JSON.stringify(this.indices));
    }

    deleteProgram() {
        this.isRunning = false;
        if (this.shaderProgram !== null)
            this.gl.deleteProgram(this.shaderProgram);
        this.shaderProgram = null;
    }

    startLogo() {
        this.isRunning = true;
        this.then = 0;
        this.create();

        this.programInfo = {
            program: this.shaderProgram,
            attribLocations: {
                vertexPosition: this.gl.getAttribLocation(this.shaderProgram, 'aVertexPosition'),
                vertexColor: this.gl.getAttribLocation(this.shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
                projectionMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uProjectionMatrix'),
                modelViewMatrix: this.gl.getUniformLocation(this.shaderProgram, 'uModelViewMatrix'),
            },
        };

        this.initBuffers();

        requestAnimationFrame(this.render);
    }

    // Draw the scene repeatedly
    render = (now) => {
        now *= 0.001;  // convert to seconds
        const deltaTime = now - this.then;
        this.then = now;

        this.drawScene(deltaTime);

        if (this.isRunning)
            requestAnimationFrame(this.render);
    };


    initBuffers() {

        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.positions), this.gl.STATIC_DRAW);

        const colorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, colorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.colors), this.gl.STATIC_DRAW);

        const indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);

        this.buffers = {
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer,
        };
    }

    drawScene(deltaTime) {
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        this.gl.clearDepth(1.0);                 // Clear everything
        this.gl.enable(this.gl.DEPTH_TEST);           // Enable depth testing
        this.gl.depthFunc(this.gl.LEQUAL);            // Near things obscure far things
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        const fieldOfView = 45 * Math.PI / 180;   // in radians
        const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [-0.0, 0.0, -10.0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, this.cubeRotation, [0, 0, 1]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, this.cubeRotation * .3, [0, 1, 0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, this.cubeRotation * .7, [1, 0, 0]);

        {
            const numComponents = 3;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.position);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexPosition);
        }

        {
            const numComponents = 4;
            const type = this.gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffers.color);
            this.gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset);
            this.gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexColor);
        }

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffers.indices);

        this.gl.useProgram(this.programInfo.program);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        this.gl.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

        {
            const vertexCount = this.indices.length;
            const type = this.gl.UNSIGNED_SHORT;
            const offset = 0;
            this.gl.drawElements(this.gl.TRIANGLES, vertexCount, type, offset);
        }

        this.cubeRotation += deltaTime;
    }

    create() {
        const vsSource = [
"    attribute vec4 aVertexPosition;",
"    attribute vec4 aVertexColor;",
"",
"    uniform mat4 uModelViewMatrix;",
"    uniform mat4 uProjectionMatrix;",
"",
"    varying lowp vec4 vColor;",
"",
"    void main(void) {",
"      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;",
"      vColor = aVertexColor;",
"    }",
  ].join("\n");

        const fsSource = `
    varying lowp vec4 vColor;

    void main(void) {
      gl_FragColor = vColor;
    }
  `;
        const vertexShader = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);

        // Create the shader program

        this.shaderProgram = this.gl.createProgram();
        this.gl.attachShader(this.shaderProgram, vertexShader);
        this.gl.attachShader(this.shaderProgram, fragmentShader);
        this.gl.linkProgram(this.shaderProgram);

        // If creating the shader program failed, alert

        if (!this.gl.getProgramParameter(this.shaderProgram, this.gl.LINK_STATUS)) {
            alert('Unable to initialize the shader program: ' + this.gl.getProgramInfoLog(this.shaderProgram));
            return null;
        }
    }

    loadShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            alert('An error occurred compiling the shaders: ' + this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

}

class Attribute {
    constructor(name, size) {
        this.name = name;
        this.size = size;
    }
}