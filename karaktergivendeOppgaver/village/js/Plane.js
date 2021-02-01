"use strict";

/**
 * Den objektorienterte strukturen i House.js er basert på
 * eksempelet i 'Tips-OOstruktur.pdf' fra modul 5 i faget
 */
class Plane {

    constructor(gl, camera, lightSource, COORD_BOUNDARY) {
        this.gl = gl;
        this.camera = camera;
        this.COORD_BOUNDARY = COORD_BOUNDARY;
        this.lightSource = lightSource;

        this.planePositionBuffer = null;
        this.modelMatrix = null;

        this.stack = new Stack();

        this.isLoaded = false;
    }

    init() {
        this.initShaders();
        this.initTexture();

        this.bindShaderParameters();
    }

    initShaders() {
        let planeVertexShaderSource = document.getElementById("model-phong-vertex-shader").innerHTML;
        let planeFragmentShaderSource = document.getElementById("model-phong-fragment-shader").innerHTML;

        this.gl.planeShaderProgram = createProgram(this.gl, planeVertexShaderSource, planeFragmentShaderSource);
        if (!this.gl.planeShaderProgram) {
            console.log('Error during coord shader code init. Check shader code.');
        }
    }

    initTexture() {
        let textureUrl = "textures/grass-texture.jpg";
        const image = new Image();

        image.onload = () => {
            this.initBuffers(image);
            this.isLoaded = true;
        };

        image.onerror = function () {
            alert("Cannot find : " + textureUrl);
        }

        image.src = textureUrl;
    }

    initBuffers(image) {
        let planeVertices = new Float32Array([
            -this.COORD_BOUNDARY / 2, 0, this.COORD_BOUNDARY / 2,
            this.COORD_BOUNDARY / 2, 0, this.COORD_BOUNDARY / 2,
            -this.COORD_BOUNDARY / 2, 0, -this.COORD_BOUNDARY / 2,

            -this.COORD_BOUNDARY / 2, 0, -this.COORD_BOUNDARY / 2,
            this.COORD_BOUNDARY / 2, 0, this.COORD_BOUNDARY / 2,
            this.COORD_BOUNDARY / 2, 0, -this.COORD_BOUNDARY / 2,
        ]);

        this.planePositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.planePositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, planeVertices, this.gl.STATIC_DRAW);
        this.planePositionBuffer.itemSize = 3;
        this.planePositionBuffer.numberOfItems = 6;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        let planeUVs = new Float32Array([
            0, 0,
            1, 0,
            0, 1,

            0, 1,
            1, 0,
            1, 1,
        ]);

        this.planeTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.planeTexture);

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.planeTextureBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.planeTextureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, planeUVs, this.gl.STATIC_DRAW);
        this.planeTextureBuffer.itemSize = 2;
        this.planeTextureBuffer.numberOfItems = 6;

        let planeNormals = new Float32Array([
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
        ]);

        this.planeNormalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.planeNormalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, planeNormals, this.gl.STATIC_DRAW);
        this.planeNormalBuffer.itemSize = 3;
        this.planeNormalBuffer.numberOfItems = 6;
    }

    bindShaderParameters() {
        this.u_modelviewMatrix = this.gl.getUniformLocation(this.gl.planeShaderProgram, 'u_modelviewMatrix');
        this.u_projectionMatrix = this.gl.getUniformLocation(this.gl.planeShaderProgram, 'u_projectionMatrix');

        return true;
    }

    draw() {
        if (!this.isLoaded) {
            return;
        }

        this.camera.setCamera();

        this.modelMatrix = new Matrix4();
        this.modelMatrix.setIdentity();
        this.stack.pushMatrix(this.modelMatrix);

        this.gl.useProgram(this.gl.planeShaderProgram);

        let modelviewMatrix = this.camera.getModelViewMatrix(this.modelMatrix);

        drawWithTexture(this.planeTextureBuffer, this.planeTexture, this.planePositionBuffer,
            this.planeNormalBuffer, this.gl.planeShaderProgram, this.lightSource,
            this.gl, this.modelMatrix, modelviewMatrix, this.camera.projectionMatrix, this.camera);
    }
}