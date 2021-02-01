"use strict";

/**
 * Den objektorienterte strukturen i Tire.js er basert på
 * eksempelet i 'Tips-OOstruktur.pdf' fra modul 5 i faget
 */
class Tire {

    constructor(gl, camera, lightSource, posX, posZ, angle) {
        this.gl = gl;
        this.camera = camera;
        this.lightSource = lightSource;

        this.tireVertices = null;

        this.isLoaded = false;

        this.posX = posX;
        this.posZ = posZ;
        this.angle = angle;
    }

    init() {
        this.initShaders();
        this.initTextures();

        this.bindShaderParameters()
    }

    initShaders() {
        let tireVertexShaderSource = document.getElementById("model-phong-vertex-shader").innerHTML;
        let tireFragmentShaderSource = document.getElementById("model-phong-fragment-shader").innerHTML;

        this.gl.tireShaderProgram = createProgram(this.gl, tireVertexShaderSource, tireFragmentShaderSource);
        if (!this.gl.tireShaderProgram) {
            console.log('Error during coord shader code init. Check shader code.');
        }
    }

    initTextures() {
        let textureUrl = "textures/car/tireTexture.png";
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
        this.initTireBuffer();
        this.initTextureBuffer(image);
        this.initNormalBuffer();
    }

    /**
     * Commented numbers above vertex-sets references to numbers in 'hustekstur_mål.png'
     */
    initTireBuffer() {
        this.tireVertices = createTireVertices(20, 20,  20);

        this.tirePositionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tirePositionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.tireVertices, this.gl.STATIC_DRAW);
        this.tirePositionBuffer.itemSize = 3;
        this.tirePositionBuffer.numberOfItems = this.tireVertices.length / this.tirePositionBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    /**
     * Commented numbers above vertex-sets references to numbers in 'tireVertices'
     */
    initTextureBuffer(image) {
        let uvCoords = [];
        for (let i = 0; i < this.tirePositionBuffer.numberOfItems; i++)
            uvCoords = uvCoords.concat([0, 0], [0.5, 1], [1, 0]);

        let uvs = new Float32Array(uvCoords);

        this.tireTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tireTexture);

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);

        this.tireTextureBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tireTextureBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, uvs, this.gl.STATIC_DRAW);
        this.tireTextureBuffer.itemSize = 2;
        this.tireTextureBuffer.numberOfItems = uvCoords.length / this.tireTextureBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    initNormalBuffer() {
        // Calculates normal vector for tire vertices
        let tempNormals = [];
        for (let i = 0; i < this.tireVertices.length; i++) {
            let p0 = vec3.fromValues(this.tireVertices[i], this.tireVertices[++i], this.tireVertices[++i]);
            let p1 = vec3.fromValues(this.tireVertices[++i], this.tireVertices[++i], this.tireVertices[++i]);
            let p2 = vec3.fromValues(this.tireVertices[++i], this.tireVertices[++i], this.tireVertices[++i]);

            let u = vec3.create(), v = vec3.create();
            vec3.subtract(u, p1, p0);
            vec3.subtract(v, p2, p0);

            let cross = vec3.create();
            vec3.cross(cross, v, u);

            tempNormals = tempNormals.concat(cross[0], cross[1], cross[2],
                cross[0], cross[1], cross[2],
                cross[0], cross[1], cross[2]);
        }

        let normals = new Float32Array(tempNormals);
        this.tireNormalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.tireNormalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);
        this.tireNormalBuffer.itemSize = 3;
        this.tireNormalBuffer.numberOfItems = tempNormals.length / this.tireNormalBuffer.itemSize;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    bindShaderParameters() {
        this.u_modelViewMatrix = this.gl.getUniformLocation(this.gl.tireShaderProgram, "u_modelViewMatrix");
        this.u_projectionMatrix = this.gl.getUniformLocation(this.gl.tireShaderProgram, "u_projectionMatrix");
        return true;
    }

    draw(stack, posX, posZ, userInputAngle) {
        if (!this.isLoaded || !this.bindShaderParameters(this.gl.tireShaderProgram)) {
            return;
        }

        this.gl.useProgram(this.gl.tireShaderProgram);

        this.camera.setCamera();

        let modelMatrix = stack.peekMatrix();
        modelMatrix.translate(posX, 0, posZ);
        modelMatrix.rotate(userInputAngle, 0,1,0);

        let multiplier = 13;
        modelMatrix.translate(this.posX*multiplier, 18, this.posZ*multiplier+8);
        modelMatrix.rotate(this.angle, 0,1,0);

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);

        this.gl.useProgram(this.gl.tireShaderProgram);

        drawWithTexture(this.tireTextureBuffer, this.tireTexture, this.tirePositionBuffer,
            this.tireNormalBuffer, this.gl.tireShaderProgram, this.lightSource,
            this.gl, modelMatrix, modelviewMatrix, this.camera.projectionMatrix, this.camera);
    }
}

/**
 * Returns vertices for the tire
 *
 * @param r Radius of cylinder
 * @param width Width of cylinder
 * @param thetaStep Lower results in higher resolution
 * @returns {Float32Array} Vertices to be drawn with gl.TRIANGLES
 */
function createTireVertices(r, width, thetaStep) {
    thetaStep = thetaStep * (Math.PI / 180.0); //Degrees
    let theta = 0;
    let y1, z1, y2, z2;
    let tempVertices = [];

    //Create vertices for tire with origin on center back
    while (theta < 2 * Math.PI) {
        y1 = r * Math.cos(theta);
        z1 = r * Math.sin(theta);
        theta += thetaStep;

        y2 = r * Math.cos(theta);
        z2 = r * Math.sin(theta);

        tempVertices.push(
            //Front triangle
            width, 0.0, 0.0,
            width, y1, z1,
            width, y2, z2,

            //Side square (two triangles)
            //Triangle 1
            width, y1, z1,
            0.0, y1, z1,
            0.0, y2, z2,

            //Triangle 2
            width, y1, z1,
            0.0, y2, z2,
            width, y2, z2,

            //Back triangle
            0.0, 0.0, 0.0,
            0.0, y1, z1,
            0.0, y2, z2,
        );
    }
    return new Float32Array(tempVertices)
}