"use strict";


/**
 * PointLight.js er basert på 'CubeDiffusePointLight1.js'
 * fra del10 i modul 6
 */
class PointLight {

    constructor(gl, camera, currentlyPressedKeys) {
        this.gl = gl;
        this.camera = camera;
        this.currentlyPressedKeys = currentlyPressedKeys;

        this.pointLightPositionBuffer = null;

        this.u_lightPosition = {x: 0.0, y:50, z:0.0};
        this.u_ambientLightColor = [0.2, 0.2, 0.2];
        this.u_diffuseLightColor = [1, 1, 1];
        this.u_specularLightColor = [0.5, 0.5, 0.5];
    }

    init() {
        this.initBuffers();
        this.initShaders();
        this.bindShaderParameters();
    }

    handleKeys() {
        // Light source
        // x-pos:
        if (this.currentlyPressedKeys[73]) {     //I
            this.u_lightPosition.x -= 2;
        }

        if (this.currentlyPressedKeys[74]) {	    //J
            this.u_lightPosition.x += 2;
        }

        //y-pos
        if (this.currentlyPressedKeys[75]) {    //K
            this.u_lightPosition.y += 2;
        }

        if (this.currentlyPressedKeys[76]) {	//L
            this.u_lightPosition.y -= 2;
        }

        //z-pos
        if (this.currentlyPressedKeys[78]) {    //M
            this.u_lightPosition.z += 2;
        }

        if (this.currentlyPressedKeys[77]) {	//N
            this.u_lightPosition.z -= 2;
        }
    }

    initBuffers() {
        let cubeVertices = new Float32Array([
            -1, 1, 1,
            -1, -1, 1,
            1, -1, 1,

            -1, 1, 1,
            1, -1, 1,
            1, 1, 1,

            1, 1, 1,
            1, -1, 1,
            1, -1, -1,

            1, 1, 1,
            1, -1, -1,
            1, 1, -1,

            1, -1, -1,
            -1, -1, -1,
            1, 1, -1,

            -1, -1, -1,
            -1, 1, -1,
            1, 1, -1,

            -1, -1, -1,
            -1, 1, 1,
            -1, 1, -1,

            -1, -1, 1,
            -1, 1, 1,
            -1, -1, -1,

            -1, 1, 1,
            1, 1, 1,
            -1, 1, -1,

            -1, 1, -1,
            1, 1, 1,
            1, 1, -1,

            -1, -1, -1,
            1, -1, 1,
            -1, -1, 1,

            -1, -1, -1,
            1, -1, -1,
            1, -1, 1
        ]);

        this.pointLightPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointLightPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, cubeVertices, this.gl.STATIC_DRAW);
        this.pointLightPositionBuffer.itemSize = 3;
        this.pointLightPositionBuffer.numberOfItems =
            cubeVertices.length / this.pointLightPositionBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    initShaders() {
        let pointLightVertexShaderSource = document.getElementById("light-source-vertex-shader").innerHTML;
        let pointLightFragmentShaderSource = document.getElementById("light-source-fragment-shader").innerHTML;

        this.gl.pointLightShaderProgram = createProgram(this.gl, pointLightVertexShaderSource, pointLightFragmentShaderSource);
        if (!this.gl.pointLightShaderProgram) {
            console.log('Error during point light shader code init. Check shader code.')
        }
    }

    bindShaderParameters() {
        this.u_modelviewMatrix = this.gl.getUniformLocation(this.gl.pointLightShaderProgram, 'u_modelviewMatrix');
        this.u_projectionMatrix = this.gl.getUniformLocation(this.gl.pointLightShaderProgram, 'u_projectionMatrix');
    }

    draw() {
        this.camera.setCamera();

        this.gl.useProgram(this.gl.pointLightShaderProgram);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.pointLightPositionBuffer);
        let a_Position = this.gl.getAttribLocation(this.gl.pointLightShaderProgram, 'a_Position');
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Position);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        let u_FragColor = this.gl.getUniformLocation(this.gl.pointLightShaderProgram, 'u_FragColor');
        let rgba = [254.0/256, 250.0/256, 37.0/256, 1.0];

        this.gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        let modelMatrix = new Matrix4();
        modelMatrix.setIdentity();
        modelMatrix.scale(5, 5, 5);
        modelMatrix.translate(this.u_lightPosition.x / 5, this.u_lightPosition.y / 5, this.u_lightPosition.z / 5);

        let modelViewMatrix = this.camera.getModelViewMatrix(modelMatrix);

        let u_modeviewMatrix = this.gl.getUniformLocation(this.gl.pointLightShaderProgram, 'u_modelviewMatrix');
        let u_projectionMatrix = this.gl.getUniformLocation(this.gl.pointLightShaderProgram, 'u_projectionMatrix');

        this.gl.uniformMatrix4fv(u_modeviewMatrix, false, modelViewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.pointLightPositionBuffer.numberOfItems);
    }
}