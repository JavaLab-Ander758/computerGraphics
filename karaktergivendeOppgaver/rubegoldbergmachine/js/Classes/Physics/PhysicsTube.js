'use strict';
import * as THREE from '../../../lib/three/build/three.module.js';
import {PhysicsSphere} from './PhysicsSphere.js';
import {extractAmmoShapeFromMesh} from "../../Utils/utilsAmmo.js";
import {createTriangleMeshShape} from "../../Utils/utilsAmmo.js";
import {isNumberInRange, degToRad} from "../../Utils/utils.js";
import {_playSound} from "../../Utils/utilsThree.js";
import * as CONST from "../../Utils/Constants.js";
import {Text} from "./Text.js";

/**
 * Based on /del3-2020-OO from Modul 7
 * @author Anders Rubach Ese <aes014@uit.no>
 */
let testDone = false;
let testMesh, lastTextChangeDeltaTime=0, lastTextString='hei'
export class PhysicsTube{
    constructor(physicsWorld, scene, camera) {
        this.physicsWorld = physicsWorld;
        this.scene = scene;
        this.camera = camera;

        // Labyrinth parameters
        this.groupMesh = undefined;
        this.compoundShape = new Ammo.btCompoundShape();
        this.rigidBodyCompound = undefined;

        // Sphere parameters
        this.meshSphere = undefined
        this.rigidBodySphere = undefined
        this.sphereSequenceDone = false;
        this.dominoSequenceDone = false;
        this.startTime = Date.now()

        this.countDownText = new Text(this.scene);

    }

    create() {
        // Create the labyrinth
        this.groupMesh = new THREE.Group()
        this.groupMesh.position.set(0,0,0)
        this.createTube(this.groupMesh)
        this.initAmmo()
    }

    /**
     * Adds a tube with a sphere in it
     */
    createTube(_groupMesh){
        let _tubeHeight = 1200
        appendMesh(getTubeMesh(2, 1.75, _tubeHeight, {x:-310-_tubeHeight-62, y:742.5, z:0}, {x:90, y:90, z:90}), this.compoundShape)

        appendMesh(getSinCurveMesh(), this.compoundShape)


        // Put a sphere in beginning of the tube
        const geometrySphere = new THREE.SphereBufferGeometry( 1.5, 32, 32);
        this.meshSphere = new THREE.Mesh( geometrySphere, new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('assets/textures/OpenGameArt/floor/metal1-1024/metal1-dif-1024.png'), side: THREE.DoubleSide}));
        this.meshSphere.position.set(-310-_tubeHeight, 743, 0)
        this.rigidBodySphere = createTriangleMeshShape(this.scene, this.meshSphere, 12, this.physicsWorld,
            CONST.CollisionGroups.Sphere,
            CONST.CollisionMasks.Sphere)

        // Add countdown text
        this.countDownText.create('hei', {x:-310-_tubeHeight, y:743+5, z:-5}, 3, {x:0, y:-90, z:0}, 0.1, 0.1, 0.5)


        /**
         * Return a hollow sinus curve
         */
        function getSinCurveMesh(_radius=2, _scale=100, _lambda=-1.2, _position={x:-310,y:584,z:0}, _rotation={x:0,y:0,z:140}) {
            const path = new CustomSinCurve( _scale, _lambda);
            const geometry = new THREE.TubeBufferGeometry( path, 500, _radius, 15, false );
            let textureFloor = new THREE.TextureLoader().load('assets/textures/OpenGameArt/floor/metal1-1024/metal1-dif-1024.png')
            const material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, map: textureFloor, wireframe: true} );
            const mesh = new THREE.Mesh( geometry, material );
            mesh.receiveShadow  = true
            mesh.castShadow     = true
            mesh.position.set(_position.x,_position.y,_position.z)
            mesh.rotation.z = degToRad(_rotation.z)
            return mesh
        }

        /**
         * Return a hollow tube
         */
        function getTubeMesh(_outerRadius, _innerRadius, _height, _position={x:0,y:0,z:0}, _rotation={x:0,y:0,z:0}) {
            const extrudeSettings ={
                amount : _height,
                steps : 1,
                bevelEnabled: false,
                curveSegments: 10};

            let tubeShape = new THREE.Shape();
            tubeShape.moveTo(0, 0);
            tubeShape.absarc(0, 0, _outerRadius, 0, Math.PI*2, 0, false);
            var holePath = new THREE.Path();
            holePath.absarc(0, 0, _innerRadius, 0, Math.PI*2, true);
            tubeShape.holes.push(holePath);
            let tubeGeometry = new THREE.ExtrudeBufferGeometry(tubeShape, extrudeSettings);
            let tubeMaterial = new THREE.MeshPhongMaterial( { /*color: 0xC709C7,*/ side: THREE.DoubleSide, wireframe: true} );
            let tubeMesh = new THREE.Mesh( tubeGeometry, tubeMaterial );
            tubeMesh.position.set(_position.x, _position.y, _position.z)
            tubeMesh.receiveShadow = true;
            tubeMesh.castShadow = true;
            tubeMesh.rotation.set(degToRad(_rotation.x), degToRad(_rotation.y), degToRad(_rotation.z))
            return tubeMesh
        }

        /**
         * Append mesh in Create() for initAmmo()
         */
        function appendMesh(_mesh, _compoundShape) {
            _groupMesh.add( _mesh );

            let ammoTerrainShape = extractAmmoShapeFromMesh(_mesh)
            let shapeTrans = new Ammo.btTransform();
            shapeTrans.setIdentity();
            shapeTrans.setOrigin(new Ammo.btVector3(_mesh.position.x,_mesh.position.y,_mesh.position.z));
            let terrainQuat = _mesh.quaternion;
            shapeTrans.setRotation( new Ammo.btQuaternion(terrainQuat.x, terrainQuat.y, terrainQuat.z, terrainQuat.w) );
            _compoundShape.addChildShape(shapeTrans, ammoTerrainShape);
        }
    }

    /**
     * Adds the labyrinth to the scene and initializes Ammo physics
     */
    initAmmo() {
        let massTerrain = 0;
        let compoundShapeTrans = new Ammo.btTransform();
        compoundShapeTrans.setIdentity();
        compoundShapeTrans.setOrigin(new Ammo.btVector3(this.groupMesh.position.x,this.groupMesh.position.y,this.groupMesh.position.z));
        let quatCompound = this.groupMesh.quaternion;
        compoundShapeTrans.setRotation( new Ammo.btQuaternion( quatCompound.x, quatCompound.y, quatCompound.z, quatCompound.w ) );
        let motionState = new Ammo.btDefaultMotionState( compoundShapeTrans );
        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        this.compoundShape.setLocalScaling(new Ammo.btVector3(this.groupMesh.scale.x,this.groupMesh.scale.y, this.groupMesh.scale.x));
        this.compoundShape.calculateLocalInertia( massTerrain, localInertia );
        let rbInfo = new Ammo.btRigidBodyConstructionInfo( massTerrain, motionState, this.compoundShape, localInertia );
        this.rigidBodyCompound = new Ammo.btRigidBody(rbInfo);
        this.rigidBodyCompound.setFriction(0);
        this.rigidBodyCompound.setRestitution(0);
        this.rigidBodyCompound.setCollisionFlags(this.rigidBodyCompound.getCollisionFlags() | 2);   // BODYFLAG_KINEMATIC_OBJECT = 2 betyr kinematic object, masse=0 men kan flyttes!!
        this.rigidBodyCompound.setActivationState(4);   // Never sleep, BODYSTATE_DISABLE_DEACTIVATION = 4

        // this.scene.add(this.groupMesh);
        this.scene.add(this.groupMesh)

        // Legg til physicsWorld:
        this.physicsWorld.addRB( this.rigidBodyCompound, CONST.CollisionGroups.Tube,
            CONST.CollisionMasks.Tube);
        this.physicsWorld._updateSingleAabb(this.rigidBodyCompound) ;
        this.groupMesh.userData.physicsBody = this.rigidBodyCompound;
        this.physicsWorld.rigidBodies.push(this.groupMesh);
    }

    keyCheck(deltaTime, currentlyPressedKeys) {
        if (!this.rigidBodySphere || !this.meshSphere)
            return;

        this.rigidBodySphere.activate(true);

        if (!testDone) {
            let testGeometry = new THREE.SphereGeometry(1)
            let testMaterial = new THREE.MeshBasicMaterial( {opacity : 0 } );
            testMesh = new THREE.Mesh(testGeometry, testMaterial);
            testMesh.position.set(-225,401,0)
            testMaterial.transparent = true
            this.scene.add(testMesh)
            testDone = true;
        }


        /** TESTING: Sett til debug til true for å
         * disable start av spillet slik at man kan bevege kamera fritt */
        let debug = false;
        if (debug) {
            this.sphereSequenceDone = true
            this.dominoSequenceDone = true
        }

        if (this.sphereSequenceDone && !this.dominoSequenceDone) {
            if (currentlyPressedKeys["KeyD"])
                testMesh.translateX(1)
            if (currentlyPressedKeys["KeyA"])
                testMesh.translateX(-1)

            let pos = testMesh.position

            this.camera.position.x = pos.x  +0
            this.camera.position.y = pos.y  +150
            this.camera.position.z = pos.z  +150
            this.camera.lookAt(pos)

            if (pos.x > 260)
            this.dominoSequenceDone = true;
        }

        let pos = this.meshSphere.position

        if (!this.sphereSequenceDone) {
            this.camera.lookAt(pos)
            let f=200

            let cameraPosition = {x:0,y:0,z:0}

            if (isNumberInRange(pos.x, -1550, -1200)) {
                cameraPosition = {x:-1550,y:pos.y+10,z:0}

                // Tell ned fra 10 sekunder, og dytt ball
                let countDown = 15 *1000;
                if (Date.now() - this.startTime > countDown) {
                    applyForceOnSphere(this.rigidBodySphere)
                    playSound(0, this.camera)
                } else {
                    if (Date.now() - lastTextChangeDeltaTime > 500) {
                        lastTextChangeDeltaTime = Date.now()

                        let newTextString = ''+ countDown-(Date.now() - this.startTime);
                        if (lastTextString==='hei')
                            lastTextString = 'hei';

                        this.countDownText.changeExistingText(newTextString, lastTextString)
                        lastTextString = newTextString
                    }
                }
            } else if (isNumberInRange(pos.x, -1200, -900)) {
                cameraPosition = {x:-1200,y:pos.y+20,z:20}
                applyForceOnSphere(this.rigidBodySphere)
                if (isNumberInRange(pos.x, -1200-f, -1150)) {
                    playSound(1, this.camera)
                }
            } else if (isNumberInRange(pos.x, -900, -450)) {
                cameraPosition = {x:-900,y:pos.y-20,z:-20}
                if (isNumberInRange(pos.x, -900-f, -850)) {
                    playSound(2, this.camera)
                }
            } else if (isNumberInRange(pos.x, -450, -265)) {
                cameraPosition = {x:pos.x,y:pos.y+20,z:-20}
                if (isNumberInRange(pos.x, -500-f, -550)) {
                    playSound(3, this.camera)
                }

            } else if (pos.x >= -265) {
                this.sphereSequenceDone = true
                cameraPosition = {x:-260,y:200,z:-20}
            }

            // Run when done
            this.camera.position.x = cameraPosition.x
            this.camera.position.y = cameraPosition.y
            this.camera.position.z = cameraPosition.z
        }

        function applyForceOnSphere(_rigidBodySphere) {
            let impulseForceSphere = 10
            let direction = {x: 1, y: 0, z: 0};
            let impulse = new Ammo.btVector3(direction.x * impulseForceSphere, direction.y * impulseForceSphere, direction.z * impulseForceSphere);
            _rigidBodySphere.applyCentralImpulse(impulse);
        }

        function playSound(n, _camera) {
            let path;
            if (n===0)
                path = './assets/sound/OpenGameArt/cannon/launches/flaunch.wav';
            else if (isNumberInRange(n, 1, 3))
                path = './assets/sound/trench/High speed passby.mp3';
            if (!soundsPlayed[n])
                _playSound(path, _camera, false, 1)
            soundsPlayed[n] = true
        }
    }
}

// Lagrer hvorvidt sekvenser er spilt av
let soundsPlayed = [false, false, false, false, false]

/**
 * https://threejs.org/docs/#api/en/geometries/TubeGeometry
 */
class CustomSinCurve extends THREE.Curve {
    constructor(scale = 1, _lambda = 2) {
        super();
        this.scale = scale;
        this._lambda = _lambda;
    }

    getPoint(t, optionalTarget = new THREE.Vector3()) {
        const tx = t * 3 - 1.5;
        const ty = Math.cos(this._lambda * Math.PI * t);
        const tz = 0;
        return optionalTarget.set(tx, ty, tz).multiplyScalar(this.scale);
    }
}