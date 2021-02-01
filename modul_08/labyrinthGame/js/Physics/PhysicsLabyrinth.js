"use strict";
import * as THREE from "../../../../../lib/three/build/three.module.js";
import {getKeyboardEnums, toRadians} from "./Utils/PhysicsUtils.js";
import {PhysicsSphere} from "./PhysicsSphere.js";

/**
 * Based on /del3-2020-OO from Modul 7
 * @author Anders Rubach Ese <aes014@uit.no>
 */
export class PhysicsLabyrinth{
    constructor(physicsWorld, scene, camera) {
        this.physicsWorld = physicsWorld;
        this.scene = scene;
        this.camera = camera;

        // Labyrinth parameters
        this.groupMesh = undefined;
        this.compoundShape = new Ammo.btCompoundShape();
        this.rigidBodyCompound = undefined;
        this.boardMesh = undefined
        this.soundPlayed = false;
    }
    
    create() {
        // Create the labyrinth
        this.groupMesh = new THREE.Group()
        this.groupMesh.position.set(0,0,0)
        this._createLabyrinth(this.groupMesh)
        this._initAmmo()

        // Create a ball and drop it
        this._createSphere()
    }

    /**
     * Create ball and add it to scene
     */
    _createSphere() {
        this.physicsSphere = new PhysicsSphere(this.physicsWorld, this.scene);
        this.physicsSphere.name = 'currentPhysicsSphere'
        this.physicsSphere.create(undefined, {x: 50/2-3.5, y: 25, z: 50/2-3.5}, undefined, 1)
    }

    /**
     * Remove current sphere and call this._createSphere()
     */
    _resetSphere() {
        var selectedObject = this.scene.getObjectByName('currentPhysicsSphere');
        this.scene.remove( selectedObject );
        this._createSphere()
        this.soundPlayed = false;
    }

    /**
     * Adds the floor to scene with Ammo.js physics
     */
    _createLabyrinth(_groupMesh){
        let labyrinthSize = {width: 50, height: 2, depth: 50};
        
        // Create outer walls
        this._addWall({x:0,y:labyrinthSize.height*2,z:1-labyrinthSize.depth/2},  {w:labyrinthSize.width, h:labyrinthSize.height*2,d:2}, _groupMesh)
        this._addWall({x:0,y:labyrinthSize.height*2,z:labyrinthSize.depth/2-1},  {w:labyrinthSize.width, h:labyrinthSize.height*2,d:2}, _groupMesh)
        this._addWall({x:1-labyrinthSize.depth/2,y:labyrinthSize.height*2,z:0},  {w:labyrinthSize.width, h:labyrinthSize.height*2,d:2}, _groupMesh, Math.PI/2)
        this._addWall({x:-1+labyrinthSize.depth/2,y:labyrinthSize.height*2,z:0}, {w:labyrinthSize.width, h:labyrinthSize.height*2,d:2}, _groupMesh, Math.PI/2)

        // Create floor and obstacles
        let textureFloor = new THREE.TextureLoader().load('assets/textures/OpenGameArt/floor/metal1-1024/metal1-dif-1024.png')
        textureFloor.wrapS = THREE.RepeatWrapping;
        textureFloor.wrapT = THREE.RepeatWrapping;
        textureFloor.offset.set(0.5, 0.5)
        let _repeat = 2 / (labyrinthSize.width + labyrinthSize.depth)
        textureFloor.repeat.set(_repeat, _repeat, _repeat)

        const extrudeSettings ={
            steps: 1,
            depth: labyrinthSize.height,
            bevelEnabled: false
        };

        let floorShape = new THREE.Shape();
        floorShape.moveTo(-labyrinthSize.width/2, -labyrinthSize.depth/2);
        floorShape.lineTo(-labyrinthSize.width/2, labyrinthSize.depth/2);
        floorShape.lineTo(labyrinthSize.width/2, labyrinthSize.depth/2);
        floorShape.lineTo(labyrinthSize.width/2, -labyrinthSize.depth/2);
        floorShape.lineTo(-labyrinthSize.width/2, -labyrinthSize.depth/2);

        let wallHeight = labyrinthSize.height*2, width=1, height=3;
        punchHole(21, 21, 1.5)
        this._addWall({x: 19, y:wallHeight, z:4}, {w:width,h:height,d:38}, _groupMesh)
        this._addWall({x: 14, y:wallHeight, z:-4}, {w:width,h:height,d:38}, _groupMesh)
        punchHole(21-4-1, -21, 1.5)
        this._addWall({x: 9, y:wallHeight, z:18}, {w:width,h:height,d:10}, _groupMesh)
        this._addWall({x: 9, y:wallHeight, z:10}, {w:width,h:height,d:10}, _groupMesh, Math.PI/2)
        this._addWall({x: 4, y:wallHeight, z:15-0.5}, {w:width,h:height,d:10}, _groupMesh)
        this._addWall({x: -1, y:wallHeight, z:14-0.5}, {w:width,h:height,d:20}, _groupMesh)
        this._addWall({x: 4, y:wallHeight, z:4}, {w:width,h:height,d:10}, _groupMesh, Math.PI/2)
        punchHole(21-4-1-4, -8, 1.25)
        this._addWall({x: 4, y:wallHeight, z:0}, {w:width,h:height,d:20}, _groupMesh, Math.PI/2)
        punchHole(-4.5, -1.5, 1)
        this._addWall({x: -6, y:wallHeight, z:8-0.5}, {w:width,h:height,d:16}, _groupMesh)
        punchHole(-6, -21, 1.75)
        this._addWall({x: -6-5, y:wallHeight, z:10}, {w:width,h:height,d:30}, _groupMesh)
        this._addWall({x: -1-0.5, y:wallHeight, z:-5-0.5}, {w:width,h:height,d:20}, _groupMesh, Math.PI/2)
        punchHole(10, 6-0.5, 1)
        this._addWall({x: 4, y:wallHeight, z:-10-0.5}, {w:width,h:height,d:20}, _groupMesh, Math.PI/2)
        this._addWall({x: -6-5, y:wallHeight, z:-10}, {w:width,h:height,d:12}, _groupMesh)
        // this._addWall({x: -3-0.5, y:wallHeight, z:-10-0.5-5}, {w:width,h:height,d:16}, _groupMesh, Math.PI/2)
        this._addWall({x: 12, y:wallHeight, z:-10-0.5-5-1}, {w:width*2,h:height,d:4}, _groupMesh, Math.PI/2)
        punchHole(12, 13, 1.5)
        // this._addWall({x: 4, y:wallHeight, z:-17}, {w:width,h:height,d:2}, _groupMesh)
        this._addWall({x: -3-0.5, y:wallHeight, z:-10-0.5-5-1}, {w:width*2,h:height,d:16}, _groupMesh, Math.PI/2)
        punchHole(12, 13, 1.5)
        punchHole(12-0.5, 20+0.5, 2.5)
        this._addWall({x: -6-5-5, y:wallHeight, z:-5}, {w:width,h:height,d:40}, _groupMesh)
        // punchHole(-20.5, -20.5, 2.25)
        punchEllipse(-17.5, -21, 5, 2)
        punchHole(-18, -9, 1)
        punchHole(-22, 0, 1)
        punchHole(-18, 9, 1)
        punchHole(-20, 18, 3)

        let floorGeometry = new THREE.ExtrudeBufferGeometry(floorShape, extrudeSettings);
        //let boardGeometry = new THREE.BoxBufferGeometry( labyrinthSize.width, labyrinthSize.height, labyrinthSize.depth, 5, 5);
        floorGeometry.rotateX(-Math.PI / 2);

        let floorMaterial = new THREE.MeshPhongMaterial( { /*color: 0xC709C7,*/ side: THREE.DoubleSide, map: textureFloor} );
        this.boardMesh = new THREE.Mesh( floorGeometry, floorMaterial );
        this.boardMesh.scale.set(1,1,1);
        this.boardMesh.receiveShadow = true;
        _groupMesh.add( this.boardMesh );

        let ammoTerrainShape = this.extractAmmoShapeFromMesh(this.boardMesh)
        let shapeTrans = new Ammo.btTransform();
        shapeTrans.setIdentity();
        shapeTrans.setOrigin(new Ammo.btVector3(this.boardMesh.position.x,this.boardMesh.position.y,this.boardMesh.position.z));
        let terrainQuat = this.boardMesh.quaternion;
        shapeTrans.setRotation( new Ammo.btQuaternion(terrainQuat.x, terrainQuat.y, terrainQuat.z, terrainQuat.w) );
        this.compoundShape.addChildShape(shapeTrans, ammoTerrainShape);

        function punchEllipse(_x, _y, _rX, _rY) {
            let hole = new THREE.Path();
            hole.ellipse(_x, _y, _rX, _rY, 0, Math.PI * 2, true)
            floorShape.holes.push(hole)
        }

        function punchHole(_x, _y, _r) {
            let hole = new THREE.Path();
            hole.absarc(_x, _y, _r, 0, Math.PI * 2, true);
            floorShape.holes.push(hole)
        }
    }

    /**
     * Adds a wall to the scene with Ammo physics
     */
    _addWall(_position={x: 0, y: 0, z: 0}, _size={w:1,h:1, d:1}, _groupMesh, _rotationY=0, _scale={x: 1, y: 1, z: 1}) {
        let tWall = new THREE.TextureLoader().load('./assets/textur     es/OpenGameArt/Planks/test_128x128_6.png')
        tWall.wrapS = THREE.RepeatWrapping;
        tWall.wrapT = THREE.RepeatWrapping;
        tWall.repeat.y = 2
        tWall.repeat.x = 20
        let wallMaterial = new THREE.MeshPhongMaterial( {side: THREE.DoubleSide, map: tWall} );
        let wallGeometry = new THREE.BoxBufferGeometry( _size.w, _size.h, _size.d, 1, 1);

        let tempMesh = new THREE.Mesh(wallGeometry, wallMaterial)
        tempMesh.position.set(_position.x, _position.y, _position.z)
        tempMesh.rotation.y = _rotationY

        tempMesh.scale.set(_scale.x,_scale.y,_scale.z);
        tempMesh.receiveShadow = true;
        tempMesh.castShadow = true;
        _groupMesh.add(tempMesh);

        let ammoWallShape = new Ammo.btBoxShape(new Ammo.btVector3(_size.w/2, _size.h/2, _size.d/2));
        let shapeWallTrans = new Ammo.btTransform();
        shapeWallTrans.setIdentity();
        shapeWallTrans.setOrigin(new Ammo.btVector3(tempMesh.position.x,tempMesh.position.y,tempMesh.position.z));
        let shapeWallQuat = tempMesh.quaternion;
        shapeWallTrans.setRotation( new Ammo.btQuaternion(shapeWallQuat.x, shapeWallQuat.y, shapeWallQuat.z, shapeWallQuat.w) );
        this.compoundShape.addChildShape(shapeWallTrans, ammoWallShape);
    }

    /**
     * Adds the labyrinth to the scene and initializes Ammo physics
     */
    _initAmmo() {
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
        this.rigidBodyCompound.setFriction(0.3);
        this.rigidBodyCompound.setRestitution(0.03);
        this.rigidBodyCompound.setCollisionFlags(this.rigidBodyCompound.getCollisionFlags() | 2);   // BODYFLAG_KINEMATIC_OBJECT = 2 betyr kinematic object, masse=0 men kan flyttes!!
        this.rigidBodyCompound.setActivationState(4);   // Never sleep, BODYSTATE_DISABLE_DEACTIVATION = 4

        // this.scene.add(this.groupMesh);
        this.scene.add(this.groupMesh)

        // Legg til physicsWorld:
        this.physicsWorld.addRB( this.rigidBodyCompound, this.physicsWorld.groups.colGroupPlane,
            this.physicsWorld.groups.colGroupBall,
            this.physicsWorld.groups.colGroupPlane);
        this.physicsWorld._updateSingleAabb(this.rigidBodyCompound) ;
        this.groupMesh.userData.physicsBody = this.rigidBodyCompound;
        this.physicsWorld.rigidBodies.push(this.groupMesh);
    }


    /**
     * Plays a sound
     * https://threejs.org/docs/#api/en/audio/Audio
     * @param _path Path to audio file
     * @param _loopEnabled True for repeating of audio
     * @param _volume 0.0 -> 1.0 (max)
     */
    _playSound(_path, _loopEnabled=false, _volume=0.5) {
        // create an AudioListener and add it to the camera
        var listener = new THREE.AudioListener();
        this.camera.add(listener);
        // create a global audio source
        let sound = new THREE.Audio(listener);
        // load a sound and set it as the Audio object's buffer
        var audioLoader = new THREE.AudioLoader();
        audioLoader.load(_path, function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(_loopEnabled);
            sound.setVolume(_volume);
            sound.play();
        });
        this.soundPlayed = true;
    }


    keyCheck(deltaTime, currentlyPressedKeys) {
        // Control the ball
        if (this.physicsSphere) {
            this.physicsSphere.keyCheck(deltaTime, currentlyPressedKeys);
            let pos = this.physicsSphere.getPosition();
            if (pos.y < -10 && !this.soundPlayed) {
                if (pos.x < -18 && pos.z < -18)
                    this._playSound('./assets/sound/sound_win.mp3')
                else
                    this._playSound('./assets/sound/sound_loose.mp3')
            }
            if (pos.y < -1000)
                this._resetSphere()
        }

        // Control the labyrinth
        if (!this.rigidBodyCompound || !this.groupMesh)
            return;
        this.rigidBodyCompound.activate(true);
        const enumsKeyboard = getKeyboardEnums()

        let limited = true;
        if (currentlyPressedKeys[enumsKeyboard.W])
            this._rotatePlane(1, false, limited)
        if (currentlyPressedKeys[enumsKeyboard.S])
            this._rotatePlane(1, true, limited)
        if (currentlyPressedKeys[enumsKeyboard.A])
            this._rotatePlane(3, true, limited)
        if (currentlyPressedKeys[enumsKeyboard.D])
            this._rotatePlane(3, false, limited)
    }

    /**
     * Rotates the plane
     * @param _axisNo x=1, y=2, z=3
     * @param _positive True for positive rotation
     * @param _limited True for limited rotation along XZ and angle
     */
    _rotatePlane(_axisNo, _positive, _limited) {
        if (_limited) {
            let tempTransform = new Ammo.btTransform();
            let tempMotionState = this.rigidBodyCompound.getMotionState();
            tempMotionState.getWorldTransform(tempTransform);

            tempTransform.setRotation(new Ammo.btQuaternion(
                tempTransform.getRotation().x() + (_axisNo===1?(_positive?0.001:-0.001):0),
                tempTransform.getRotation().y() + (_axisNo===2?(_positive?0.001:-0.001):0),
                tempTransform.getRotation().z() + (_axisNo===3?(_positive?0.001:-0.001):0),
                1));

            console.log(
                'labyrinthRotation:' + '\n' +
                'x=' + tempTransform.getRotation().x() + '\n' +
                'y=' + tempTransform.getRotation().y() + '\n' +
                'z=' + tempTransform.getRotation().z() + '\n')

            tempMotionState.setWorldTransform(tempTransform);
        }
        else {
            let axis;
            switch (_axisNo) {
                case 1:
                    axis = new THREE.Vector3( 1, 0, 0 );
                    break;
                case 2:
                    axis = new THREE.Vector3( 0,1, 0);
                    break;
                case 3:
                    axis = new THREE.Vector3( 0,0, 1);
                    break;
                default:
                    axis = new THREE.Vector3( 1, 0, 0 );
            }
            // Henter gjeldende transformasjon:
            let terrainTransform = new Ammo.btTransform();
            // let terrainMotionState = this.rigidBody.getMotionState();
            let terrainMotionState = this.rigidBodyCompound.getMotionState();
            // console.log(this.rigidBodyCompound)
            terrainMotionState.getWorldTransform( terrainTransform );
            let ammoRotation = terrainTransform.getRotation();

            console.log(
                'labyrinthRotation:' + '\n' +
                'x: ' + ammoRotation.x() + '\n' +
                'y: ' + ammoRotation.y() + '\n' +
                'z: ' + ammoRotation.z() + '\n'
            )

            // Roter gameBoardRigidBody om en av aksene (bruker Three.Quaternion til dette):
            let threeCurrentQuat = new THREE.Quaternion(ammoRotation.x(), ammoRotation.y(), ammoRotation.z(), ammoRotation.w());
            let threeNewQuat = new THREE.Quaternion();
            threeNewQuat.setFromAxisAngle(axis, toRadians(_positive?0.1:-0.1));
            // Slår sammen eksisterende rotasjon med ny/tillegg.
            let resultQuaternion = threeCurrentQuat.multiply(threeNewQuat);
            // Setter ny rotasjon på ammo-objektet:
            terrainTransform.setRotation( new Ammo.btQuaternion( resultQuaternion.x, resultQuaternion.y, resultQuaternion.z, resultQuaternion.w ) );
            terrainMotionState.setWorldTransform(terrainTransform);
        }
    }

    /**
     * Extracts Ammo.js shapes from given mesh
     */
    extractAmmoShapeFromMesh(mesh, scale) {
        function traverseModel(mesh, modelVertices=[]) {
            if (mesh.type === "SkinnedMesh" || mesh.type === "Mesh" || mesh.type === "InstancedMesh") {
                let bufferGeometry = mesh.geometry;
                let attr = bufferGeometry.attributes;
                let position = attr.position;
                let tmpVertices = Array.from(position.array);
                //modelVertices = modelVertices.concat(tmpVertices);
                modelVertices.push(...tmpVertices);
            }
            mesh.children.forEach((child, ndx) => {
                traverseModel(child, modelVertices);
            });
            return modelVertices;
        }

        if (!scale)
            scale = {x:1, y:1, z: 1};

        let vertices = traverseModel(mesh);   // Fungerer kun sammen med BufferGeometry!!
        let ammoMesh = new Ammo.btTriangleMesh();
        for (let i = 0; i < vertices.length; i += 9)
        {
            let v1_x = vertices[i];
            let v1_y = vertices[i+1];
            let v1_z = vertices[i+2];

            let v2_x = vertices[i+3];
            let v2_y = vertices[i+4];
            let v2_z = vertices[i+5];

            let v3_x = vertices[i+6];
            let v3_y = vertices[i+7];
            let v3_z = vertices[i+8];

            let bv1 = new Ammo.btVector3(v1_x, v1_y, v1_z);
            let bv2 = new Ammo.btVector3(v2_x, v2_y, v2_z);
            let bv3 = new Ammo.btVector3(v3_x, v3_y, v3_z);

            ammoMesh.addTriangle(bv1, bv2, bv3);
        }
        let triangleShape = new Ammo.btBvhTriangleMeshShape(ammoMesh, false);
        triangleShape.setMargin( 0.01 );
        triangleShape.setLocalScaling(new Ammo.btVector3(scale.x, scale.y, scale.z));
        return triangleShape;
    }
}