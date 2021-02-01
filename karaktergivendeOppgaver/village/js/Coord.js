"use strict";

/**
 * Coord.js er basert på klassen 'Del3_4_5_6_7-KubemannOO\js\Bil1oo\Coord.js'
 * i eksempelkoden Del3_4_5_6_7-KubemannOO.zip under modul 3 i faget
 */
class Coord {

    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;

        this.coordPositionBuffer = null;
        this.coordColorBuffer = null;
        this.COORD_BOUNDARY = 1100;
    }

    init() {
        this.initShaders();
        this.initBuffers();
    }

    initShaders() {
        let coordVertexShaderSource = document.getElementById("coord-vertex-shader").innerHTML;
        let coordFragmentShaderSource = document.getElementById("coord-fragment-shader").innerHTML;

        this.gl.coordShaderProgram = createProgram(this.gl, coordVertexShaderSource, coordFragmentShaderSource);
        if (!this.gl.coordShaderProgram) {
            console.log('Error during coord shader code init. Check shader code.');
        }
    }

    initBuffers() {
        let coordPositions = new Float32Array([
            //x-axis
            -this.COORD_BOUNDARY, 0.0, 0.0,
            this.COORD_BOUNDARY, 0.0, 0.0,

            //y-axis:
            0.0, this.COORD_BOUNDARY, 0.0,
            0.0, -this.COORD_BOUNDARY, 0.0,

            //z-axis:
            0.0, 0.0, this.COORD_BOUNDARY,
            0.0, 0.0, -this.COORD_BOUNDARY,
        ]);

        // Vertex buffer
        this.coordPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coordPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, coordPositions, this.gl.STATIC_DRAW);
        this.coordPositionBuffer.itemSize = 3;
        this.coordPositionBuffer.numberOfItems = 6;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        let coordColors = new Float32Array([
            1, 0.0, 0.0, 1,   // X-axis
            1, 0.0, 0.0, 1,
            0.0, 1, 0.0, 1,   // Y-axis
            0.0, 1, 0.0, 1,
            0.0, 0.0, 1, 1,   // Z-axis
            0.0, 0.0, 1, 1
        ]);

        this.coordColorBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coordColorBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, coordColors, this.gl.STATIC_DRAW);
        this.coordColorBuffer.itemSize = 4; 			// 4 float per farge.
        this.coordColorBuffer.numberOfItems = 6; 	// 6 farger.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    draw() {
        this.camera.setCamera();

        let modelMatrix = new Matrix4();
        modelMatrix.setIdentity();
        this.gl.useProgram(this.gl.coordShaderProgram);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coordPositionBuffer);
        let a_Position = this.gl.getAttribLocation(this.gl.coordShaderProgram, "a_Position");
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Position);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.coordColorBuffer);
        let a_Color = this.gl.getAttribLocation(this.gl.coordShaderProgram, "a_Color");
        this.gl.vertexAttribPointer(a_Color, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Color);

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);

        let u_modelviewMatrix = this.gl.getUniformLocation(this.gl.coordShaderProgram, 'u_modelviewMatrix');
        let u_projectionMatrix = this.gl.getUniformLocation(this.gl.coordShaderProgram, 'u_projectionMatrix');

        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);

        // Tegner koordinatsystem:
        this.gl.drawArrays(this.gl.LINES, 0, this.coordPositionBuffer.numberOfItems);
    }
}