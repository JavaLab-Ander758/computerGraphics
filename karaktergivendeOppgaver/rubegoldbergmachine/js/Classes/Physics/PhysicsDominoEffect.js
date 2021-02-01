'use strict';
import * as THREE from '../../../lib/three/build/three.module.js';
import {createTriangleMeshShape} from "../../Utils/utilsAmmo.js";
import {isNumberInRange, toRadians, radToDeg, degToRad} from "../../Utils/utils.js";
import * as CONST from "../../Utils/Constants.js";
import {Text} from "./Text.js";

/**
 * Based on /del3-2020-OO from Modul 7
 * @author Anders Rubach Ese <aes014@uit.no>
 */
export class PhysicsDominoEffect {
    constructor(physicsWorld, scene) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

        this.rigidBody = undefined;
        this.mesh = undefined;
        this.meshBuffer  =[]
        this.dominoRigidBodies = []
        this.lastCronJobTime = Date.now()
    }

    create(posistion={x:0,y:0,z:0}) {
        let text = new Text(this.scene)
        text.create('Dominoeffects!', {x:-200, y:420, z:-50}, 30, {x:0, y:5, z:5})

        let initSize = {width: 0.5*2, height: 4*2, depth: 2*2},initPos = posistion
        let initMass = 6;

        let colGroupSelf = CONST.CollisionGroups.Box,
            colGroupToCollideWith = CONST.CollisionMasks.Box

        // Add first domino
        let dominoArray = [];
        initPos.x +=12

        // Add triangle-shape
        for (let len=0, i=-1, zOffset=2.5; len < 26; len++, initPos.x += 3) {
            i -= (len % 2 === 0) ? 2 : 3
            zOffset = (len % 2 === 0) ? 2 : 2.5
            for (let n = i; n < Math.abs(i + 4); n += 5)
                dominoArray.push({
                    pos: {x: initPos.x, y: initPos.y, z: n + zOffset+1},
                    size: {w: initSize.width, h: initSize.height, d: initSize.depth},
                    rotZ: 0});
        }

        // Add first positive 1/2 curve
        let incValues={
            '0': {x:3,  z:0.5}, '10':{x:2.5,z:1},
            '20':{x:2.5,z:1.5}, '30':{x:2.5,z:2},
            '40':{x:2.5,z:2.5}, '50':{x:2,  z:3},
            '60':{x:1.5,z:3.5}, '70':{x:1.5,z:4},
            '80':{x:1,  z:3.5}}
        for (let i=0; i<90; i+=10) {
            addDomino(i)
            initPos.x += incValues[''+i].x
            initPos.z -= incValues[''+i].z
        }

        // Add first vertical line
        for (let i=0; i<8; i++) {
            addDomino(90)
            initPos.z -= 3.5
        }

        // Add multiple curves
        for (let i=0; i<=3; i++) {
            appendPositiveCurve()
            appendLineVertical(27, false)
            appendNegativeCurve()
            if (i!==3)
                appendLineVertical(27, true)
        }
        appendLineVertical(8, true)
        appendPositiveCurve(true)
        appendLineHorizontal(5)



        /**
         * Adds positive curve
         */
        function appendPositiveCurve(half=false) {
            let incValues02={
                '90':{x:1,  z:3.5},
                '80':{x:1.5,z:4},
                '70':{x:1.5,z:3.5},
                '60':{x:2,  z:3},
                '50':{x:2.5,z:2},
                '40':{x:2.5,z:2.5},
                '30':{x:2.5,z:1.5},
                '20':{x:2.5,z:1},
                '10':{x:3,  z:0.5},
                '0': {x:3,  z:0.5}}

            for (let i=90; i>=0; i-=10) {
                addDomino(i)
                initPos.x += incValues02[''+i].x
                initPos.z -= incValues02[''+i].z
            }

            if (!half)
                for (let i = 0; i >= -90; i -= 10) {
                    addDomino(i)
                    initPos.x += incValues02['' + Math.abs(i)].x
                    initPos.z += incValues02['' + Math.abs(i)].z
                }
        }

        /**
         * Adds negative curve
         */
        function appendNegativeCurve() {
            let incValues02={
                '90':{x:1,  z:3.5},
                '80':{x:1.5,z:4},
                '70':{x:1.5,z:3.5},
                '60':{x:2,  z:3},
                '50':{x:2.5,z:2},
                '40':{x:2.5,z:2.5},
                '30':{x:2.5,z:1.5},
                '20':{x:2.5,z:1},
                '10':{x:3,  z:0.5},
                '0': {x:3,  z:0.5}}

            for (let i=-90; i<=0; i+=10) {
                addDomino(i)
                initPos.x += incValues02[''+Math.abs(i)].x
                initPos.z += incValues02[''+Math.abs(i)].z
            }
            for (let i=0; i<=90; i+=10) {
                addDomino(i)
                initPos.x += incValues02[''+Math.abs(i)].x
                initPos.z -= incValues02[''+Math.abs(i)].z
            }
        }

        function appendLineHorizontal(n) {
            for (let i=0; i<n; i++, initPos.x+=3.5)
                addDomino(0)
        }

        /**
         * appends vertical line
         * @param n
         * @param positive
         */
        function appendLineVertical(n=1, positive) {
            for (let i=0; i<=n; i++) {
                addDomino(90)
                if (positive)
                    initPos.z -= 3.5
                else
                    initPos.z += 3.5
            }
        }

        /**
         * Add standard domino with given rotation
         */
        function addDomino(rotZ) {
            dominoArray.push({
                pos: {x: initPos.x, y: initPos.y, z:initPos.z},
                size: {w: initSize.width, h: initSize.height, d: initSize.depth},
                rotZ: rotZ, mass: 6})
        }


        /**
         * Apply dominoes to the scene
         */
        for (let i=0,textures={n:1,min:1,max:28};i<dominoArray.length;i++) {
            let tempGeometry = new THREE.BoxBufferGeometry(dominoArray[i].size.w/2, dominoArray[i].size.h, dominoArray[i].size.d);
            let tempMesh = new THREE.Mesh(tempGeometry,
                new THREE.MeshPhongMaterial({
                    map: new THREE.TextureLoader().load('./assets/textures/OpenGameArt/domino set/Dominos/~REPLACE~.png'.replace('~REPLACE~', textures.n+''))}));
            tempMesh.castShadow=true
            tempMesh.position.set(dominoArray[i].pos.x, dominoArray[i].pos.y, dominoArray[i].pos.z);
            tempMesh.rotation.set(0,toRadians(dominoArray[i].rotZ),0);
            let mass = 6
            if (dominoArray[i].mass !== undefined)
                mass = dominoArray[i].mass
            // this.dominoRigidBodies.push(createTriangleMeshShape(this.scene, tempMesh, mass, this.physicsWorld, colGroupSelf, colGroupToCollideWith));
            this.dominoRigidBodies.push([createTriangleMeshShape(this.scene, tempMesh, mass, this.physicsWorld, colGroupSelf, colGroupToCollideWith), tempMesh]);
            this.meshBuffer.push(tempMesh)

            // Loop trough available textures
            textures.n++
            if (textures.n >= textures.max)
                textures.n=textures.min
        }
    }

    /**
     * Run CronJob to disable physics for
     *  dominoes to improve performance every 2 seconds
     */
    disablePhysicsCronjob() {
        if (Date.now()-this.lastCronJobTime > 2000) {
            this.lastCronJobTime = Date.now()
            for (let i = 0; i<this.dominoRigidBodies.length; i++)
                if (this.dominoRigidBodies[i][1].position.y <= 402)
                    this.dominoRigidBodies[i][0].setMassProps(0)
        }
    }





    /**
     * @Deprecated
     * Deletes all placed dominoes in class to free memory
     */
    deleteDominoes() {
        if (this.meshBuffer && this.meshBuffer.length) {
            try {
                for (let i = 0; i < this.meshBuffer.length; i++) {
                    if (this.meshBuffer[i] !== undefined)
                        this.scene.remove(this.meshBuffer[i])
                    this.meshBuffer[i] = undefined
                }
                this.meshBuffer = []
            } catch (error) {
                console.log(error)
            }
        }
    }

    /**
     * @Deprecated
     * Deletes the currently first domino
     */
    deleteFirstDomino() {
        if (this.meshBuffer && this.meshBuffer.length) {
            try {
                for (let i=0; i<this.meshBuffer.length; i++) {
                    if (this.meshBuffer[i]!==undefined) {
                        this.scene.remove(this.meshBuffer[i])
                        this.meshBuffer[i] = undefined
                        i=this.meshBuffer.length
                    }
                }
            } catch (error) {
                console.log(error)
            }
        }
    }
}