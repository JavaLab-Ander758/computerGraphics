"use strict";

/**
 * Den objektorienterte strukturen i House.js er basert på
 * eksempelet i 'Tips-OOstruktur.pdf' fra modul 5 i faget
 */
class House {

    constructor(gl, camera, lightSource, xzTranslation, houseScale, houseRotation, textureUrl) {
        this.gl = gl;
        this.camera = camera;
        this.lightSource = lightSource;
        this.xyzTranslation = xzTranslation;
        this.houseScale = houseScale;
        this.houseRotation = houseRotation;
        this.textureUrl = textureUrl;

        this.houseVertices = null;

        this.isLoaded = false;
    }

    init() {
        this.initShaders();
        this.initTextures();

        this.bindShaderParameters()
    }

    initShaders() {
        let houseVertexShaderSource = document.getElementById("model-phong-vertex-shader").innerHTML;
        let houseFragmentShaderSource = document.getElementById("model-phong-fragment-shader").innerHTML;

        this.gl.houseShaderProgram = createProgram(this.gl, houseVertexShaderSource, houseFragmentShaderSource);
        if (!this.gl.houseShaderProgram) {
            console.log('Error during coord shader code init. Check shader code.');
        }
    }

    initTextures() {
        // let textureUrl = "textures/hustekstur.png";
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
        this.initHouseBuffer();
        this.initTextureBuffer(image);
        this.initNormalBuffer();
    }

    /**
     * Commented numbers above vertex-sets references to numbers in 'hustekstur_mål.png'
     */
    initHouseBuffer() {
        this.houseVertices = new Float32Array([
            // 1
            -2, 1, 1,
            -2, -1, 1,
            2, -1, 1,
            -2, 1, 1,
            2, -1, 1,
            2, 1, 1,

            // 2
            2, 1, 1,
            2, -1, 1,
            2, -1, -1,
            2, 1, 1,
            2, -1, -1,
            2, 1, -1,

            // 3
            2, -1, -1,
            -2, -1, -1,
            2, 1, -1,
            -2, -1, -1,
            -2, 1, -1,
            2, 1, -1,

            // 4
            -2, -1, -1,
            -2, 1, 1,
            -2, 1, -1,
            -2, -1, 1,
            -2, 1, 1,
            -2, -1, -1,

            // 5
            2, 1, -1,
            2, 2, 0,
            2, 1, 1,

            // 6
            -2, 1, 1,
            -2, 2, 0,
            -2, 1, -1,

            // 7
            -2, 2, 0,
            -2, 1, 1,
            2, 1, 1,
            -2, 2, 0,
            2, 1, 1,
            2, 2, 0,

            // 8
            2, 2, 0,
            2, 1, -1,
            -2, 1, -1,
            2, 2, 0,
            -2, 1, -1,
            -2, 2, 0
        ]);

        this.housePositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.housePositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.houseVertices, this.gl.STATIC_DRAW);
        this.housePositionBuffer.itemSize = 3;
        this.housePositionBuffer.numberOfItems = this.houseVertices.length / this.housePositionBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    /**
     * Commented numbers above vertex-sets references to numbers in 'houseVertices
     */
    initTextureBuffer(image) {
        let uvCoords = [];
        {
            // 1
            let tl1 = [0, 0.75];
            let bl1 = [0, 0.375];
            let tr1 = [0.375, 0.75];
            let br1 = [0.375, 0.375];
            uvCoords = uvCoords.concat(tl1, bl1, br1, tl1, br1, tr1);

            // 2
            let tl2 = [0.375, 0.75];
            let bl2 = [0.375, 0.375];
            let tr2 = [0.625, 0.75];
            let br2 = [0.625, 0.375];
            uvCoords = uvCoords.concat(tl2, bl2, br2, tl2, br2, tr2);

            // 3
            let tl3 = [0.625, 0.75];
            let bl3 = [0.625, 0.375];
            let tr3 = [1, 0.75];
            let br3 = [1, 0.375];
            uvCoords = uvCoords.concat(bl3, br3, tl3, br3, tr3, tl3);

            // 4
            let tl4 = [0.375, 0.375];
            let bl4 = [0.375, 0];
            let tr4 = [0.625, 0.375];
            let br4 = [0.625, 0];
            uvCoords = uvCoords.concat(bl4, tr4, tl4, br4, tr4, bl4);

            // 5
            let bl5 = [0.375, 0.75];
            let t5 = [0.5, 1];
            let br5 = [0.625, 0.75];
            uvCoords = uvCoords.concat(bl5, t5, br5);

            // 6
            let bl6 = [0.625, 0];
            let t6 = [0.75, 0.25];
            let br6 = [0.875, 0];
            uvCoords = uvCoords.concat(bl6, t6, br6);

            // 7_8
            let tl7_8 = [0, 0.3125];
            let bl7_8 = [0, 0];
            let tr7_8 = [0.375, 0.3125];
            let br7_8 = [0.375, 0];
            uvCoords = uvCoords.concat(tl7_8, bl7_8, br7_8, tl7_8, br7_8, tr7_8);
            uvCoords = uvCoords.concat(tl7_8, bl7_8, br7_8, tl7_8, br7_8, tr7_8);
        }

        let uvs = new Float32Array(uvCoords);

        this.houseTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.houseTexture);

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.houseTextureBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.houseTextureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, uvs, this.gl.STATIC_DRAW);
        this.houseTextureBuffer.itemSize = 2;
        this.houseTextureBuffer.numberOfItems = uvCoords.length / this.houseTextureBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    initNormalBuffer() {
        // Calculates normal vector for house vertices
        let tempNormals = [];
        for (let i = 0; i < this.houseVertices.length; i++) {
            let p0 = vec3.fromValues(this.houseVertices[i], this.houseVertices[++i], this.houseVertices[++i]);
            let p1 = vec3.fromValues(this.houseVertices[++i], this.houseVertices[++i], this.houseVertices[++i]);
            let p2 = vec3.fromValues(this.houseVertices[++i], this.houseVertices[++i], this.houseVertices[++i]);

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
        this.houseNormalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.houseNormalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);
        this.houseNormalBuffer.itemSize = 3;
        this.houseNormalBuffer.numberOfItems = tempNormals.length / this.houseNormalBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    bindShaderParameters() {
        this.u_modelViewMatrix = this.gl.getUniformLocation(this.gl.houseShaderProgram, "u_modelViewMatrix");
        this.u_projectionMatrix = this.gl.getUniformLocation(this.gl.houseShaderProgram, "u_projectionMatrix");
        return true;
    }

    draw(stack) {
        if (!this.isLoaded || !this.bindShaderParameters(this.gl.houseShaderProgram)) {
            return;
        }

        this.gl.useProgram(this.gl.houseShaderProgram);

        this.camera.setCamera();

        let modelMatrix = stack.peekMatrix();
        modelMatrix.translate(this.xyzTranslation[0], this.houseScale, this.xyzTranslation[1]);
        modelMatrix.scale(this.houseScale, this.houseScale, this.houseScale);
        modelMatrix.rotate(this.houseRotation, 0, 1, 0)

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);

        this.gl.useProgram(this.gl.houseShaderProgram);

        drawWithTexture(this.houseTextureBuffer, this.houseTexture, this.housePositionBuffer,
            this.houseNormalBuffer, this.gl.houseShaderProgram, this.lightSource,
            this.gl, modelMatrix, modelviewMatrix, this.camera.projectionMatrix, this.camera);
    }
}