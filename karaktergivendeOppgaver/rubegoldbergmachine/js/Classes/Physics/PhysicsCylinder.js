import * as THREE from '../../../lib/three/build/three.module.js';
import * as CONST from "../../Utils/Constants.js";
import {extractAmmoShapeFromMesh} from "../../Utils/utilsAmmo.js";

/**
 * Based on /del3-2020-OO from Modul 7
 */
export class PhysicsCylinder {
    constructor(physicsWorld, scene) {
        this.physicsWorld = physicsWorld;
        this.scene = scene;

        this.mesh = undefined;
        this.rigidBody = undefined;
        this.groupMesh = undefined;
        this.compoundShape = new Ammo.btCompoundShape();
    }

    create(position={x:0,y:0,z:0}) {
        // Create the labyrinth
        this.groupMesh = new THREE.Group()
        this.groupMesh.position.set(0,0,0)
        this._createSpiral(this.groupMesh, position)
        this._initAmmo()
    }

    /**
     * Based on https://threejs.org/docs/#api/en/geometries/LatheBufferGeometry
     */
    _createSpiral(_groupMesh, position){

        let textureFloor = new THREE.TextureLoader().load('assets/textures/OpenGameArt/Metal_seamless2_ch16.jpg')
        let material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, map: textureFloor} );
        let geometry = new THREE.CylinderBufferGeometry( 90, 2.1, 40, 250, 120, true);
        let cylinder = new THREE.Mesh( geometry, material );
        cylinder.position.set(position.x,position.y+5,position.z)
        appendMesh(cylinder, this.compoundShape)


        geometry = new THREE.CylinderBufferGeometry( 70, 70, 20+10, 250, 120, true, 4, 2);
        cylinder = new THREE.Mesh( geometry, material );
        cylinder.position.set(position.x,position.y+20,position.z)
        appendMesh(cylinder, this.compoundShape)

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

    keyCheck(deltaTime, currentlyPressedKeys) {
        if (!this.rigidBody || !this.mesh)
            return;

        this.rigidBody.activate(true);
    }
}
