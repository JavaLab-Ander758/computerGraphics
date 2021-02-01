/**
 * Inneholder noe basis-kode basert på eksempler fra faget 'DTE-2800 Datamaskingrafikk' av Werner Farstad
 */

"use strict";

let carIndexRotation = [0, 0, 0, 0, 0, 0, 0];
let carRotationActiveIndex = 0;

class Main {

    constructor() {
        this.gl = null;
        this.canvas = null;
        this.camera = null;

        this.currentlyPressedKeys = [];

        this.lastTime = 0.0;

        this.fpsData = {};
        this.elapsed = 0.0;
        this.rot = 0;
        this.scale = 100;

        const getUrl = window.location;
        document.getElementById("uri").innerHTML = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
    }

    start() {
        this.initContext();

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        this.camera = new Camera(this.canvas, this.currentlyPressedKeys);
        this.camera.setCamera();

        this.pointLight = new PointLight(this.gl, this.camera, this.currentlyPressedKeys);
        this.pointLight.init();

        this.coord = new Coord(this.gl, this.camera);
        this.coord.init();

        this.plane = new Plane(this.gl, this.camera, this.pointLight, this.coord.COORD_BOUNDARY);
        this.plane.init();

        this.village = new Village(this.gl, this.camera, this.pointLight, this.plane.stack);
        this.village.init();

        this.gl.clearColor(0.9, 0.9, 1.0, 1.0);

        this.fpsData.numberOfFrames = 0;
        this.fpsData.lastTimeStamp = 0;

        this.draw();
    }

    initContext() {
        this.canvas = document.getElementById("webgl");

        // this.gl = getWebGLContext(this.canvas);
        this.gl = this.canvas.getContext('webgl')

        if (!this.gl) {
            console.log("Could not obtain rendering context for WebGL");
            return false;
        }

        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

        document.addEventListener('keyup', this.handleKeyUp.bind(this), false);
        document.addEventListener('keydown', this.handleKeyDown.bind(this), false);

        return true;
    }

    handleKeyUp(event) {
        this.currentlyPressedKeys[event.which] = false;
    }

    handleKeyDown(event) {
        this.currentlyPressedKeys[event.which] = true;
    }

    handleKeys(elapsed) {
        this.camera.handleKeys(elapsed);
        this.pointLight.handleKeys(elapsed);

        // handles tire rotation
        for (let i = 49; i <= 54; i++) {
            if (this.currentlyPressedKeys[i]) {
                carRotationActiveIndex = i - 49;
                console.log("SELECTED_CAR=" + carRotationActiveIndex);
            }
        }
        if (this.currentlyPressedKeys[37]) {	//
            rotateCarTire(carRotationActiveIndex, false);
        }
        if (this.currentlyPressedKeys[39]) {	//
            rotateCarTire(carRotationActiveIndex, true);
        }
    }

    draw(currentTime) {
        requestAnimFrame(this.draw.bind(this));

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        //Enables depth testing
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        if (currentTime === undefined) {
            currentTime = 0;
        }

        if (currentTime - this.fpsData.lastTimeStamp >= 1000) {
            document.getElementById("fps").innerHTML = this.fpsData.numberOfFrames;
            this.fpsData.numberOfFrames = 0;
            this.fpsData.lastTimeStamp = currentTime;
        }

        let elapsed = 0.0;
        if (this.lastTime !== 0.0)
            elapsed = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.coord.draw();
        this.pointLight.draw();
        this.plane.draw();
        this.village.draw();

        this.handleKeys(elapsed);

        this.fpsData.numberOfFrames++;
    }
}

/**
 * Rotates a given cars front tires
 * @param carIndex Which car's tires to rotate
 * @param right True if rotation is right-way
 */
function rotateCarTire(carIndex, right) {
    let MaxAngle = 15;
    if (!(carIndexRotation[carIndex] >= -MaxAngle && carIndexRotation[carIndex] <= MaxAngle)) {
        if (carIndexRotation[carIndex] < -MaxAngle)
            carIndexRotation[carIndex]++;
        else if (carIndexRotation[carIndex] > MaxAngle)
            carIndexRotation[carIndex]--;
        return;
    }
    if (right)
        carIndexRotation[carIndex]--;
    else
        carIndexRotation[carIndex]++;

    console.log('[' + carIndexRotation[0] + ',' + carIndexRotation[1] + ',' + carIndexRotation[2] + ',' + carIndexRotation[3] + ']')
    console.log('TIRE_ROTATE=' + (right ? 'RIGHT' : 'LEFT'));
}

