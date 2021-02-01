"use strict";
/*
    buffer og draw for et kube.
*/
var allSidesSameColor = true;

class Pyramid {
    constructor(gl, camera, color) {
        this.gl = gl;
        this.camera = camera;
        if (!color)
            this.color = {red: 0.8, green: 0.4, blue: 0.6, alpha: 1};
        else
            this.color = color;         // Forventer et objekt, f.eks. slk: {red: 1, green:0, blue:0, alpha:1}
        this.vertexBufferPyramid = null;
        this.colorBufferPyramid = null;

        // Tegne som wireframe, vha. LINE_STRIP, eller ikke?
        this.wireFrame = false;
    }

    initBuffers() {
        let pyramidVertices = new Float32Array([
            // Sides
            -1,0,-1,
            1,0,-1,
            0,2,0,

            -1,0,-1,
            -1,0,1,
            0,2,0,

            1,0,1,
            -1,0,1,
            0,2,0,

            1,0,-1,
            1,0,1,
            0,2,0,

            // Bottom
            1,0,-1,
            -1,0,-1,
            -1,0,1,

            -1,0,1,
            1,0,1,
            1,0,-1,
        ]);

        let colorArray = [];
        for (let i = 0; i < 36; i++) {
            // colorArray.push(this.color.red, this.color.green, this.color.blue, this.color.alpha);
            colorArray.push(Math.random(), Math.random(), Math.random(), this.color.alpha);
        }
        let colors = new Float32Array(colorArray);


        // Verteksbuffer for trekanten:
        this.vertexBufferPyramid = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferPyramid);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, pyramidVertices, this.gl.STATIC_DRAW);
        this.vertexBufferPyramid.itemSize = 3; 		// NB!!
        this.vertexBufferPyramid.numberOfItems = 36;	// NB!!
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);	// NB!! M? kople fra n?r det opereres med flere buffer! Kopler til i draw().

        //Fargebuffer: oppretter, binder og skriver data til bufret:
        this.colorBufferPyramid = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBufferPyramid);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, colors, this.gl.STATIC_DRAW);
        this.colorBufferPyramid.itemSize = 4; 			// 4 float per farge.
        this.colorBufferPyramid.numberOfItems = 36; 	// 36 farger.
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    handleKeys(elapsed) {
        // implementeres ved behov
    }

    draw(elapsed, modelMatrix) {     //HER!!
        this.camera.setCamera();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferPyramid);
        let a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        this.gl.vertexAttribPointer(a_Position, this.vertexBufferPyramid.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Position);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBufferPyramid);
        let a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        this.gl.vertexAttribPointer(a_Color, this.colorBufferPyramid.itemSize, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(a_Color);

        let modelviewMatrix = this.camera.getModelViewMatrix(modelMatrix);    //HER!!
        // Kopler matriseshaderparametre med tilsvarende Javascript-variabler:
        let u_modelviewMatrix = this.gl.getUniformLocation(this.gl.program, "u_modelviewMatrix");   // HER!!
        let u_projectionMatrix = this.gl.getUniformLocation(this.gl.program, "u_projectionMatrix"); // HER!!

        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.camera.projectionMatrix.elements);   //HER!!
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexBufferPyramid.numberOfItems);
    }
}