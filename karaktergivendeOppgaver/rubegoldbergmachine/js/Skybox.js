import * as THREE from "../lib/three/build/three.module.js";
import {isNumberInRange, isNumberInteger} from "./Utils/utils.js";

/**
 * Based on shader-og-skybox.pdf from module 09
 *
 * @author Anders Rubach Ese <aes014@uit.no>
 */
export class Skybox {
    constructor(physicsWorld, scene) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        this.currentSkybox = 0;
    }

    /**
     * Apply skybox to current THREE.Scene
     *  0  - Maskonaive
     *  1  - Maskonaive2
     *  2  - Maskonaive3
     *  3  - Nalovardo
     *  4  - Ryfjallet
     *  5  - Teide
     */
    setSkybox(_skyboxNum = 0) {
        if (isNumberInRange(_skyboxNum, 0, 5) && isNumberInteger(_skyboxNum)) {
            let _rootPath = 'assets/textures/OpenGameArt/SkyBox/mountain-skyboxes/' + ['Maskonaive', 'Maskonaive2', 'Maskonaive3', 'Nalovardo', 'Ryfjallet', 'Teide',][_skyboxNum];
            this.scene.background = new THREE.CubeTextureLoader().load([
                _rootPath + '/posx.jpg', _rootPath + '/negx.jpg',
                _rootPath + '/posy.jpg', _rootPath + '/negy.jpg',
                _rootPath + '/posz.jpg', _rootPath + '/negz.jpg']);
        } else
            this.scene.background = new THREE.Color( 0xffffff );
    }

    /**
     * Changes to next skybox background
     */
    nextSkybox() {
       this.currentSkybox ++;
       if (this.currentSkybox > 5)
           this.currentSkybox = -1
        this.setSkybox(this.currentSkybox)
    }
}
