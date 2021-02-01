import * as THREE from '../../../lib/three/build/three.module.js';
import * as CONST from "../../Utils/Constants.js";
import {toRadians} from "../../Utils/utils.js";

/**
 * Based on /del3-2020-OO from Modul 7
 */
export class PhysicsTrench {
    constructor(physicsWorld, scene, camera) {
        this.physicsWorld = physicsWorld;
        this.scene = scene;
        this.camera = camera

        this.mesh = undefined;
        this.rigidBody = undefined;
        this.groupMesh = undefined;
        this.compoundShape = new Ammo.btCompoundShape();

    }

    create(_position={x:0,y:0,z:0},  _rotation={x:0,y:0,z:0}, _endWallEnabled=false, _length=25) {
        this.compoundShape = new Ammo.btCompoundShape();
        this.groupMesh = new THREE.Group()
        this.groupMesh.position.set(0,0,0)
        this._createTrench(this.groupMesh, _endWallEnabled, _length)

        this.groupMesh.rotation.set(toRadians(_rotation.x), toRadians(_rotation.y), toRadians(_rotation.z));
        this.groupMesh.position.set(_position.x, _position.y, _position.z);
        this.groupMesh.scale.set(1.5, 1.5, 1.5);

        this._initAmmo()
    }

    /**
     * Based on https://threejs.org/docs/#api/en/geometries/LatheBufferGeometry
     */
    _createTrench(_groupMesh, _endWallEnabled, _length){
        let width=10, height=_length, depth = 0.625
        // for (let arr=[width,height,depth])

        this._addWall({x: 0, y:0 , z:0}, {w:width,h:height,d:depth}, _groupMesh, {x:90,y:0,z:90})
        this._addWall({x: 0, y:width/4 , z:width/2-depth/2}, {w: width/2,h:height,d:depth}, _groupMesh, {x:0,y:0,z:90})
        this._addWall({x: 0, y:width/4 , z:-width/2+depth/2}, {w:width/2,h:height,d:depth}, _groupMesh, {x:0,y:0,z:90})

        if (_endWallEnabled)
            this._addWall({x: height/2-depth/2, y:width/4 , z:0}, {w:width-depth*2,h:width/2,d:depth}, _groupMesh, {x:0,y:90,z:0})
    }

    /**
     * Adds a wall to the scene with Ammo physics
     */
    _addWall(_position={x: 0, y: 0, z: 0}, _size={w:1,h:1, d:1}, _groupMesh, _rotation={x: 0, y: 0, z: 0}, _invisible=false, _scale={x: 1, y: 1, z: 1}) {
        let tWall = new THREE.TextureLoader().load('./assets/textures/OpenGameArt/Planks/test_128x128_6.png')
        tWall.wrapS = THREE.RepeatWrapping;
        tWall.wrapT = THREE.RepeatWrapping;
        tWall.repeat.y = 2
        tWall.repeat.x = 20

        let wallMaterial = new THREE.MeshPhongMaterial( {side: THREE.DoubleSide, map: tWall} );
        if (_invisible) {
            wallMaterial = new THREE.MeshPhongMaterial( {side: THREE.DoubleSide, opacity: 0} );
            wallMaterial.transparent = true;
        }

        let wallGeometry = new THREE.BoxBufferGeometry( _size.w, _size.h, _size.d, 1, 1);

        let tempMesh = new THREE.Mesh(wallGeometry, wallMaterial)
        tempMesh.position.set(_position.x, _position.y, _position.z)
        tempMesh.rotation.x = toRadians(_rotation.x)
        tempMesh.rotation.y = toRadians(_rotation.y)
        tempMesh.rotation.z = toRadians(_rotation.z)

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
        this.rigidBodyCompound.setFriction(0.9);
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
}