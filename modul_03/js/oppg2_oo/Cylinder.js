"use strict";
/*
    buffer og draw for et sylinder.
*/
let width = 2;

class Cylinder {
    constructor(gl, myCamera, color, widthParam) {
        this.gl = gl;
        this.myCamera = myCamera;
        if (widthParam)
            width = widthParam;
        if (!color)
            this.color = {red: 0.8, green: 0.4, blue: 0.6, alpha: 1};
        else
            this.color = color;         // Forventer et objekt, f.eks. slk: {red: 1, green:0, blue:0, alpha:1}

        this.cylinderFloat32Vertices = null;
        this.vertexBufferCylinder = null;
        this.noVertsCylinder = 0;

        this.leftCylinderVerticeLen = 0;
        this.rightCylinderVerticeLen = 0;
        this.zigZagCylinderVerticeLen = 0;
    }

    initBuffers() {
        this.initCylinderVertices();

        this.vertexBufferCylinder = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCylinder);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.cylinderFloat32Vertices, this.gl.STATIC_DRAW);
        this.vertexBufferCylinder.itemSize = 3 + 4;
        this.vertexBufferCylinder.numberOfItems = this.noVertsCylinder; //= antall vertekser

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    initCylinderVertices() {
        let toPI = 2 * Math.PI;
        let CylinderVertices = [];	//Tegnes vha. TRIANGLE_FAN
        let stepGrader = 10;
        let step = (Math.PI / 180) * stepGrader;
        let r = this.color.red, g = this.color.green, b = this.color.blue, a = this.color.alpha;
        console.log("width=" + width)
        // Senterpunkt:
        let x = 0, y = 0, z = 0;
        CylinderVertices = CylinderVertices.concat(x, y - (width/2), z, r, g, b, a); //NB! bruk av concat!!
        this.noVertsCylinder++;
        for (let i = 0; i <= 2; i++) {
            let flip = false;
            for (let phi = 0.0; phi <= toPI; phi += step) {
                console.log(this.noVertsCylinder)
                x = Math.cos(phi);
                y = 0;
                z = Math.sin(phi);

                if (i === 0) {
                    CylinderVertices = CylinderVertices.concat(x, y - (width/2), z, r, g, b, a);
                    this.leftCylinderVerticeLen = this.noVertsCylinder;
                }
                else if (i === 1) {
                    CylinderVertices = CylinderVertices.concat(x, y + (width/2), z, r, g, b, a);
                    this.rightCylinderVerticeLen = this.noVertsCylinder;
                }
                else if (i === 2) {
                    this.zigZagCylinderVerticeLen = this.noVertsCylinder;
                    if (flip === true) {
                        CylinderVertices = CylinderVertices.concat(x, y + (width/2), z, r, g, b, a);
                        flip = false;
                    } else {
                        CylinderVertices = CylinderVertices.concat(x, y - (width/2), z, r, g, b, a);
                        flip = true;
                    }
                }
                this.noVertsCylinder++;
            }
        }
        this.cylinderFloat32Vertices = new Float32Array(CylinderVertices);
    }

    handleKeys(elapsed) {
        // implementeres ved behov

    }

    draw(elapsed, modelMatrix) {     //HER!!
        this.myCamera.setCamera();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCylinder);
        let a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        let stride = (3 + 4) * 4;
        this.gl.vertexAttribPointer(a_Position, 3, this.gl.FLOAT, false, stride, 0);
        this.gl.enableVertexAttribArray(a_Position);

        let a_Color = this.gl.getAttribLocation(this.gl.program, 'a_Color');
        let colorOfset = 3 * 4; //12= offset, start på color-info innafor verteksinfoen.
        this.gl.vertexAttribPointer(a_Color, 4, this.gl.FLOAT, false, stride, colorOfset);
        this.gl.enableVertexAttribArray(a_Color);

        let modelviewMatrix = this.myCamera.getModelViewMatrix(modelMatrix);    //HER!!
        // Kopler matriseshaderparametre med tilsvarende Javascript-variabler:
        let u_modelviewMatrix = this.gl.getUniformLocation(this.gl.program, "u_modelviewMatrix");   // HER!!
        let u_projectionMatrix = this.gl.getUniformLocation(this.gl.program, "u_projectionMatrix"); // HER!!
        this.gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        this.gl.uniformMatrix4fv(u_projectionMatrix, false, this.myCamera.projectionMatrix.elements);

        // Tegn venstre-/høyre-side samt selve sporet til hjulet
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.leftCylinderVerticeLen +1);
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, this.leftCylinderVerticeLen +1, this.rightCylinderVerticeLen);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, this.rightCylinderVerticeLen, this.zigZagCylinderVerticeLen +1);
    }
}