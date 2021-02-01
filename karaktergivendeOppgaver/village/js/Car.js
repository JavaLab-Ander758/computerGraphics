"use strict";

/**
 * Den objektorienterte strukturen i Car.js er basert på
 * eksempelet i 'Tips-OOstruktur.pdf' fra modul 5 i faget
 */
class Car {

    constructor(gl, camera, lightSource, textureUrl) {
        this.gl = gl;
        this.camera = camera;
        this.lightSource = lightSource;

        this.carVertices = null;

        this.isLoaded = false;

        this.textureUrl = textureUrl;

        this.tireFrontLeft = null;
        this.tireFrontRight = null;
        this.tireBackLeft = null;
        this.tireRearRight = null;
    }

    init() {
        this.initShaders();
        this.initTextures();

        this.bindShaderParameters()
    }

    initShaders() {
        let carVertexShaderSource = document.getElementById("model-phong-vertex-shader").innerHTML;
        let carFragmentShaderSource = document.getElementById("model-phong-fragment-shader").innerHTML;

        this.gl.carShaderProgram = createProgram(this.gl, carVertexShaderSource, carFragmentShaderSource);
        if (!this.gl.carShaderProgram) {
            console.log('Error during coord shader code init. Check shader code.');
        }
    }

    initTextures() {
        const image = new Image();

        image.onload = () => {
            this.initBuffers(image);
            this.isLoaded = true;
        };

        image.onerror = function () {
            alert("Cannot find : " + this.textureUrl);
        }

        image.src = this.textureUrl;
    }

    initBuffers(image) {
        this.initCarBuffer();
        this.initTextureBuffer(image);
        this.initNormalBuffer();

        this.tireFrontRight = new Tire(this.gl, this.camera, this.lightSource, 2, +2, 90);
        this.tireFrontLeft = new Tire(this.gl, this.camera, this.lightSource, 2, -2, 90);
        this.tireBackLeft = new Tire(this.gl, this.camera, this.lightSource, -3, +2, 90);
        this.tireRearRight = new Tire(this.gl, this.camera, this.lightSource, -3, -2, 90);

        this.tireFrontLeft.init();
        this.tireFrontRight.init();
        this.tireBackLeft.init();
        this.tireRearRight.init();
    }

    /**
     * Commented numbers above vertex-sets references to numbers in 'carTexture_info.png'
     */
    initCarBuffer() {
        this.carVertices = new Float32Array([
            // 1_RightSide
            -3, 1, 1,
            -3, 0, 1,
            2, 0, 1,
            -3, 1, 1,
            2, 0, 1,
            2, 1, 1,

            // 2_Front
            2, 1, 1,
            2, 0, 1,
            2, 0, -1,
            2, 1, 1,
            2, 0, -1,
            2, 1, -1,

            // 3_rightWindow
            0.5, 1.25, 1,
            0.5, 1, 1,
            2, 1, 1,
            0.5, 1.25, 1,
            2, 1, 1,
            2, 1.25, 1,

            // 4_rightWindow
            0.5, 2.25, 1,
            0.5, 1.25, 1,
            1.25, 1.25, 1,
            0.5, 2.25, 1,
            1.25, 1.25, 1,
            1.25, 2.25, 1,

            // 5_rightWindow
            1.25, 1.25, 1,
            1.25, 2.25, 1,
            2, 1.25, 1,

            // 6_frontWindow
            1.25, 2.25, 1,
            2, 1.25, 1,
            2, 1.25, -1,
            1.25, 2.25, 1,
            2, 1.25, -1,
            1.25, 2.25, -1,

            // 7
            2, 1.25, 1,
            2, 1, 1,
            2, 1, -1,
            2, 1.25, 1,
            2, 1, -1,
            2, 1.25, -1,

            // Roof
            0.5, 2.25, 1,
            1.25, 2.25, 1,
            1.25, 2.25, -1,
            0.5, 2.25, 1,
            1.25, 2.25, -1,
            0.5, 2.25, -1,

            // BackWindow
            0.5, 2.25, -1,
            0.5, 1, -1,
            0.5, 1, 1,
            0.5, 2.25, -1,
            0.5, 1, 1,
            0.5, 2.25, 1,

            // 3_leftWindow
            0.5, 1.25, -1,
            0.5, 1, -1,
            2, 1, -1,
            0.5, 1.25, -1,
            2, 1, -1,
            2, 1.25, -1,

            // 4_leftWindow
            0.5, 2.25, -1,
            0.5, 1.25, -1,
            1.25, 1.25, -1,
            0.5, 2.25, -1,
            1.25, 1.25, -1,
            1.25, 2.25, -1,

            // 5_leftWindow
            1.25, 1.25, -1,
            1.25, 2.25, -1,
            2, 1.25, -1,

            // 8_Bed
            -3, 1, -1,
            -3, 1, 1,
            0.5, 1, 1,
            -3, 1, -1,
            0.5, 1, 1,
            0.5, 1, -1,

            // 9_Back
            -3, 1, -1,
            -3, 0, -1,
            -3, 0, 1,
            -3, 1, -1,
            -3, 0, 1,
            -3, 1, 1,

            // 1_LeftSide
            2, 1, -1,
            2, 0, -1,
            -3, 0, -1,
            2, 1, -1,
            -3, 0, -1,
            -3, 1, -1,

            // Bottom
            -3, 0, 1,
            -3, 0, -1,
            2, 0, -1,
            -3, 0, 1,
            2, 0, -1,
            2, 0, 1
        ]);

        this.carPositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.carPositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.carVertices, this.gl.STATIC_DRAW);
        this.carPositionBuffer.itemSize = 3;
        this.carPositionBuffer.numberOfItems = this.carVertices.length / this.carPositionBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    /**
     * Commented numbers above vertex-sets references to numbers in 'carVertices'
     */
    initTextureBuffer(image) {
        let uvCoords = [];
        {
            // 1
            let tl1 = [0, 0.4];
            let bl1 = [0, 0];
            let tr1 = [0.5, 0.4];
            let br1 = [0.5, 0];
            uvCoords = uvCoords.concat(tl1, bl1, br1, tl1, br1, tr1);

            // 2
            let tl2 = [0, 0.8];
            let bl2 = [0, 0.5];
            let tr2 = [0.25, 0.8];
            let br2 = [0.25, 0.5];
            uvCoords = uvCoords.concat(tl2, bl2, br2, tl2, br2, tr2);

            // 3
            let tl3 = [0.25, 0.5];
            let bl3 = [0.25, 0.4];
            let tr3 = [0.5, 0.5];
            let br3 = [0.5, 0.4];
            uvCoords = uvCoords.concat(tl3, bl3, br3, tl3, br3, tr3);

            // 4
            let tl4 = [0.25, 0.75];
            let bl4 = [0.25, 0.5];
            let tr4 = [0.375, 0.75];
            let br4 = [0.375, 0.5];
            uvCoords = uvCoords.concat(tl4, bl4, br4, tl4, br4, tr4);

            // 5
            let bl5 = [0.375, 0.5];
            let t5 = [0.375, 0.75];
            let br5 = [0.5, 0.5];
            uvCoords = uvCoords.concat(bl5, t5, br5);

            // 6
            let tl6 = [0, 1];
            let bl6 = [0, 0.9];
            let tr6 = [0.15, 1];
            let br6 = [0.15, 0.9];
            uvCoords = uvCoords.concat(tl6, bl6, br6, tl6, br6, tr6);

            // 7
            let tl7 = [0.15, 1];
            let bl7 = [0.15, 0.9];
            let tr7 = [0.25, 1];
            let br7 = [0.25, 0.9];
            uvCoords = uvCoords.concat(tl7, bl7, br7, tl7, br7, tr7);

            // Roof
            let tlRoof = [0.15, 0.9];
            let blRoof = [0.15, 0.8];
            let trRoof = [0.2, 0.9];
            let brRoof = [0.2, 0.8];
            uvCoords = uvCoords.concat(tlRoof, blRoof, brRoof, tlRoof, brRoof, trRoof);

            // BackWindows
            let tl10 = [0.5, 1];
            let bl10 = [0.5, 0.9];
            let tr10 = [0.65, 1];
            let br10 = [0.65, 0.9];
            uvCoords = uvCoords.concat(tl10, bl10, br10, tl10, br10, tr10);

            // LeftWindow
            uvCoords = uvCoords.concat(tl3, bl3, br3, tl3, br3, tr3);
            uvCoords = uvCoords.concat(tl4, bl4, br4, tl4, br4, tr4);
            uvCoords = uvCoords.concat(bl5, t5, br5);

            // 8
            let tl8 = [0.25, 1];
            let bl8 = [0.25, 0.8];
            let tr8 = [0.5, 1];
            let br8 = [0.5, 0.8];
            uvCoords = uvCoords.concat(tl8, bl8, br8, tl8, br8, tr8);

            // 9
            let tl9 = [0.5, 0.8];
            let bl9 = [0.5, 0.5];
            let tr9 = [0.75, 0.8];
            let br9 = [0.75, 0.5];
            uvCoords = uvCoords.concat(tl9, bl9, br9, tl9, br9, tr9);

            // 1_leftSide
            uvCoords = uvCoords.concat(tl1, bl1, br1, tl1, br1, tr1);

            // Bottom
            let tl11 = [0.5, 0.4];
            let bl11 = [0.5, 0];
            let tr11 = [1, 0.4];
            let br11 = [1, 0];
            uvCoords = uvCoords.concat(tl11, bl11, br11, tl11, br11, tr11);
        }

        let uvs = new Float32Array(uvCoords);

        this.carTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.carTexture);

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.carTextureBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.carTextureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, uvs, this.gl.STATIC_DRAW);
        this.carTextureBuffer.itemSize = 2;
        this.carTextureBuffer.numberOfItems = uvCoords.length / this.carTextureBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    /**
     * Basert på 'beregneNormalvektorKodeVec3.txt' fra modul 6
     */
    initNormalBuffer() {
        // Calculates normal vector for car vertices
        let tempNormals = [];
        for (let i = 0; i < this.carVertices.length; i++) {
            let p0 = vec3.fromValues(this.carVertices[i], this.carVertices[++i], this.carVertices[++i]);
            let p1 = vec3.fromValues(this.carVertices[++i], this.carVertices[++i], this.carVertices[++i]);
            let p2 = vec3.fromValues(this.carVertices[++i], this.carVertices[++i], this.carVertices[++i]);

            let u = vec3.create(), v = vec3.create();
            vec3.subtract(u, p1, p0);
            vec3.subtract(v, p2, p0);

            let cross = vec3.create();
            vec3.cross(cross, u, v);

            tempNormals = tempNormals.concat(cross[0], cross[1], cross[2],
                cross[0], cross[1], cross[2],
                cross[0], cross[1], cross[2]);
        }

        let normals = new Float32Array(tempNormals);
        this.carNormalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.carNormalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);
        this.carNormalBuffer.itemSize = 3;
        this.carNormalBuffer.numberOfItems = tempNormals.length / this.carNormalBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    bindShaderParameters() {
        this.u_modelViewMatrix = this.gl.getUniformLocation(this.gl.carShaderProgram, "u_modelViewMatrix");
        this.u_projectionMatrix = this.gl.getUniformLocation(this.gl.carShaderProgram, "u_projectionMatrix");
        return true;
    }

    draw(stack, posX, posZ, initAngle, tireRotation) {
        if (!this.isLoaded || !this.bindShaderParameters(this.gl.carShaderProgram)) {
            return;
        }
        this.tireFrontRight.draw(stack, posX, posZ, initAngle+tireRotation);
        this.tireFrontLeft.draw(stack, posX, posZ, initAngle+tireRotation);
        this.tireBackLeft.draw(stack, posX, posZ, initAngle);
        this.tireRearRight.draw(stack, posX, posZ, initAngle);

        this.gl.useProgram(this.gl.carShaderProgram);

        this.camera.setCamera();

        let modelMatrix = stack.peekMatrix();
        modelMatrix.translate(0, 20, 0);
        modelMatrix.translate(posX,0,posZ);
        modelMatrix.rotate(initAngle, 0,1,0);

        modelMatrix.scale(20, 20, 20);

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);

        this.gl.useProgram(this.gl.carShaderProgram);

        drawWithTexture(this.carTextureBuffer, this.carTexture, this.carPositionBuffer,
            this.carNormalBuffer, this.gl.carShaderProgram, this.lightSource,
            this.gl, modelMatrix, modelviewMatrix, this.camera.projectionMatrix, this.camera);
    }
}