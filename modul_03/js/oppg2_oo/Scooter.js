"use strict";
/*
    Tegner koordinatsystemet.
*/
class Scooter {

    constructor(gl, camera) {
        this.gl = gl;
        this.camera = camera;

        this.stack = new Stack();

        // Hjul:
        this.cylinder_wheel_outer = null;

        this.steeringRot = 0;
        this.steeringCollapse = false;

        /**
         * Listen for single key presses
         */
        document.addEventListener('keydown', (event) => {
            if (event.code === 'Space') {
                this.steeringCollapse = this.steeringCollapse !== true;
            }
        });

    }

    /**
     * Initialize buffers
     */
    initBuffers() {
        // Platform
        this.cube1 = new Cube(this.gl, this.camera);
        this.cube1.initBuffers();
        this.cube2_platform = new Cube(this.gl, this.camera, true);
        this.cube2_platform.initBuffers();
        this.cube3_wheel_screen = new Cube(this.gl, this.camera );
        this.cube3_wheel_screen.initBuffers();
        this.cube3_wheel_screen_rotation_axis = new Cube(this.gl, this.camera, {red:0.0, green:0.0, blue:0.0, alpha:1}, true);
        this.cube3_wheel_screen_rotation_axis.initBuffers(true);

        // Hjul
        this.cylinder_wheel_outer = new Cylinder(this.gl, this.camera, {red:0.5, green:0.5, blue:0.5, alpha:1});
        this.cylinder_wheel_outer.initBuffers();
        this.cylinder_wheel_inner = new Cylinder(this.gl, this.camera, {red:1.0, green:1.0, blue:1.0, alpha:1});
        this.cylinder_wheel_inner.initBuffers();

        // Styring
        this.cylinder_front_steering = new Cylinder(this.gl, this.camera, {red:0.7, green:0.7, blue:0.7, alpha:1});
        this.cylinder_front_steering.initBuffers();
        this.cylinder_front_steering_handle = new Cylinder(this.gl, this.camera, {red:0.5, green:0.0, blue:0.0, alpha:1});
        this.cylinder_front_steering_handle.initBuffers();
    }

    /**
     * Listen to key-presses held down
     */
    handleKeys(elapsed, currentlyPressedKeys) {
        //Sving på hjulene
        let maxRot = 16;
        if (currentlyPressedKeys[89]) // Y
            if (this.steeringRot >= -maxRot && this.steeringRot < maxRot)
                this.steeringRot++;
        if (currentlyPressedKeys[85]) // U
            if (this.steeringRot > -maxRot && this.steeringRot <= maxRot)
                this.steeringRot--;
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

        // Platform + hjul bak
        {
            // Platformen.
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(0,2.0,0);
            modelMatrix.scale(9,0.5,2);
            this.cube2_platform.draw(elapsed, modelMatrix);

            // Bak skjerm
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(6,4,0);
            modelMatrix.rotate(45, 0, 0, 1);
            modelMatrix.scale(3,0.5,1.5);
            this.cube3_wheel_screen.draw(elapsed, modelMatrix);
            this.stack.popMatrix();    // Ta utgangspunkt i "rota" igjen.
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate( 9.7,6,0);
            modelMatrix.scale(2,0.5,1.5);
            this.cube3_wheel_screen.draw(elapsed, modelMatrix);

            // Bak hjul
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(9, 2, 0);
            modelMatrix.rotate(90, 1, 0, 0);
            modelMatrix.scale(2.5,1,2.5);
            this.cylinder_wheel_outer.draw(elapsed, modelMatrix);
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(9, 2, 0);
            modelMatrix.rotate(90, 1, 0, 0);
            modelMatrix.scale(1.5, 1.1,1.5);
            this.cylinder_wheel_inner.draw(elapsed, modelMatrix);

            // Front skjerm
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(-7,4,0);
            modelMatrix.rotate(-45, 0, 0, 1);
            modelMatrix.scale(2.5,0.5,1.5);
            this.cube3_wheel_screen.draw(elapsed, modelMatrix);
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(-7.8,5.5,0);
            modelMatrix.rotate(-45, 0, 0, 1);
            modelMatrix.scale(0.8, 0.5, 1.3);
            this.cube3_wheel_screen_rotation_axis.draw(elapsed, modelMatrix);
        }

        // Fronthjul + styret
        {
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(-10.5, -0.6, 0);
            modelMatrix.rotate(this.steeringRot, 0, 1, 0);
            modelMatrix.rotate(-25, 0, 0, 1);
            {
                // Kollaps
                if (this.steeringCollapse === true) {
                    modelMatrix.rotate(-50, 0, 0, 1);
                    modelMatrix.translate(-4,-2,0);
                    this.steeringRot = 0;
                }
            }
            this.stack.pushMatrix(modelMatrix);

            // Aksling
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(0, 12, 0);
            modelMatrix.scale(0.4,10,0.4);
            this.cylinder_front_steering.draw(elapsed, modelMatrix);

            // Ratt
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(0, 22, 0);
            modelMatrix.rotate(90, 1, 0, 0)
            modelMatrix.scale(0.4,5,0.4);
            this.cylinder_front_steering.draw(elapsed, modelMatrix);

            // Håndtak
            modelMatrix.translate(0, 0.7, 0);
            modelMatrix.scale(2,0.25,2);
            this.cylinder_front_steering_handle.draw(elapsed, modelMatrix);
            modelMatrix.translate(0, -5.55, 0);
            this.cylinder_front_steering_handle.draw(elapsed, modelMatrix);

            // Hjul foran
            modelMatrix = this.stack.peekMatrix();
            modelMatrix.translate(0, 3, 0);
            modelMatrix.rotate(90, 1, 0, 0);
            modelMatrix.scale(2.5,1,2.5);
            this.cylinder_wheel_outer.draw(elapsed, modelMatrix);
            modelMatrix.scale(0.6, 1.1,0.6);
            this.cylinder_wheel_inner.draw(elapsed, modelMatrix);
        }

        //Tømmer stacken ...:
        this.stack.empty();
    }
}


