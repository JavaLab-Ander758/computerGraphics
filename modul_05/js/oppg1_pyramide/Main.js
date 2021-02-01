"use strict";
// TODO:
//  - Endre på shader i .html koden


class Main {
    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;

        this.stack = new Stack();

        // Hjul:

        /**
         * Listen for single key presses
         */
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {

            }
        });

    }

    /**
     * Initialize buffers
     */
    initBuffers() {

        // Platform
        this.pyramid = new Pyramid(this.gl, this.camera, undefined, true);
        this.pyramid.initBuffers();
    }

    /**
     * Listen to key-presses held down
     */
    handleKeys(elapsed, currentlyPressedKeys) {
        if (currentlyPressedKeys[89]) { // Y

        }
    }

    /**
     * Draw elements to screen
     */
    draw(elapsed, modelMatrix) {
        // Viser styrevinkel:
        document.getElementById("angle").innerHTML = this.steeringRot;

        this.stack.pushMatrix(modelMatrix);
        modelMatrix.translate(0, 0, 0);
        modelMatrix.scale(1,1,1);
        this.stack.pushMatrix(modelMatrix);

        // Pyramide
        modelMatrix = this.stack.peekMatrix();
        this.pyramid.draw(elapsed, modelMatrix);


        //Tømmer stacken ...:
        this.stack.empty();
    }
}


