import * as THREE from "../../../lib/three/build/three.module.js";
import {toRadians} from '../../Utils/utils.js';
import {createTriangleMeshShape} from "../../Utils/utilsAmmo.js";
import * as CONST from "../../Utils/Constants.js";

/**
 * Delvis basert på /del7-2020/ShaderWater.html
 */
export class PhysicsPlane {
    constructor(physicsWorld, scene) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        this.customUniforms = undefined;

        this.create()
    }

    create(_width, length,pos={x:0,y:0,z:0}, rot={x:90,y:0,z:90}/* rotX, rotY, rotZ*/){
        let colGroupSelf = CONST.CollisionGroups.Plane,
            colGroupToCollideWith = CONST.CollisionMasks.Plane;

        let tempGeometry = new THREE.PlaneBufferGeometry(_width, length);
        let tempMesh = new THREE.Mesh(tempGeometry, this._getWoodMaterial())
        tempMesh.castShadow=true
        tempMesh.position.set(pos.x, pos.y, pos.z);
        tempMesh.rotation.set(toRadians(rot.x),toRadians(rot.y),toRadians(rot.z));
        createTriangleMeshShape(this.scene, tempMesh, 0, this.physicsWorld, colGroupSelf, colGroupToCollideWith)
    }

    _getWoodMaterial() {
        let noiseTexture = new THREE.TextureLoader().load('assets/textures/cloud.png');
        noiseTexture.wrapS = noiseTexture.wrapT = THREE.RepeatWrapping;

        let woodTexture = new THREE.TextureLoader().load('assets/textures/OpenGameArt/wood 2.jpg');
        woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;

        this.customUniforms = {
            baseTexture: { type: "t", value: woodTexture },
            baseSpeed: { type: "f", value: 0.15 },
            noiseTexture: { type: "t", value: noiseTexture },
            noiseScale: { type: "f", value: 0.2 },
            alpha: { type: "f", value: 0.8 },
            time: { type: "f", value: 0.2 }
        };

        // create custom material from the shader code above
        //   that is within specially labeled script tags
        let customMaterial = new THREE.ShaderMaterial(
            {
                uniforms: this.customUniforms,
                vertexShader: document.getElementById('vertexShader').textContent,
                fragmentShader: document.getElementById('fragmentShader').textContent
            });

        // other material properties
        customMaterial.side = THREE.DoubleSide;
        customMaterial.transparent = true;
        return customMaterial;
    }


    updateMaterial(deltaTime) {
        this.customUniforms.time.value += deltaTime;
    }
}