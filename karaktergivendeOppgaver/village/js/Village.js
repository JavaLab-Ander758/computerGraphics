/**
 * Inneholder noe basis-kode basert på eksempler fra faget 'DTE-2800 Datamaskingrafikk' av Werner Farstad
 */

"use strict";

/**
 * Den objektorienterte strukturen i Village.js er basert på
 * eksempelet i 'Tips-OOstruktur.pdf' fra modul 5 i faget
 */
class Village {

    constructor(gl, camera, pointLight, stack) {
        this.gl = gl;
        this.camera = camera;
        this.pointLight = pointLight;
        this.stack = stack;
    }

    init() {
        this.house00 = new House(this.gl, this.camera, this.pointLight, [300, -425], 25, 90, 'textures/house/hustekstur01.png');
        this.house00.init();
        this.car00 = new Car(this.gl, this.camera, this.pointLight, 'textures/car/carTexture01.png');
        this.car00.init();

        this.house01 = new House(this.gl, this.camera, this.pointLight, [-300, -425], 35, 90, 'textures/house/hustekstur02.png');
        this.house01.init();
        this.car01 = new Car(this.gl, this.camera, this.pointLight, 'textures/car/carTexture02.png');
        this.car01.init();

        this.house02 = new House(this.gl, this.camera, this.pointLight, [-200, -125], 22, 0, 'textures/house/hustekstur03.png');
        this.house02.init();
        this.car02 = new Car(this.gl, this.camera, this.pointLight, 'textures/car/carTexture03.png');
        this.car02.init();

        this.house03 = new House(this.gl, this.camera, this.pointLight, [260, -55], 40, -33,'textures/house/hustekstur04.png');
        this.house03.init();
        this.car03 = new Car(this.gl, this.camera, this.pointLight, 'textures/car/carTexture04.png');
        this.car03.init();

        this.house04 = new House(this.gl, this.camera, this.pointLight, [-200, 410], 22, 0, 'textures/house/hustekstur05.png');
        this.house04.init();
        this.house05 = new House(this.gl, this.camera, this.pointLight, [340, 355], 40, 180, 'textures/house/hustekstur06.png');
        this.house05.init();

        this.car04 = new Car(this.gl, this.camera, this.pointLight, 'textures/car/carTexture03.png');
        this.car04.init();
        this.car05 = new Car(this.gl, this.camera, this.pointLight, 'textures/car/carTexture01.png');
        this.car05.init();
    }

    draw() {

        this.house00.draw(this.stack);
        this.car00.draw(this.stack, 150, -425, 0, carIndexRotation[0]);

        this.house01.draw(this.stack);
        this.car01.draw(this.stack, -150, -425, 0, carIndexRotation[1]);

        this.house02.draw(this.stack);
        this.car02.draw(this.stack, -150, -60, 0, carIndexRotation[2]);

        this.house03.draw(this.stack);
        this.car03.draw(this.stack, 220, 15, -33, carIndexRotation[3]);

        this.car04.draw(this.stack, -20, 400, -90, carIndexRotation[4]);
        this.car05.draw(this.stack, 20, -300, -90, carIndexRotation[5]);

        this.house04.draw(this.stack);
        this.house05.draw(this.stack);
    }
}