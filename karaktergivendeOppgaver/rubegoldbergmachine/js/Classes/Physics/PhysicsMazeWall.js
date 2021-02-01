import * as THREE from '../../../lib/three/build/three.module.js';
import * as CONST from "../../Utils/Constants.js";
import {degToRad, isNumberInRange, toRadians} from "../../Utils/utils.js";
import {PhysicsSphere} from "./PhysicsSphere.js";

/**
 * Based on /del3-2020-OO from Modul 7
 */
export class PhysicsMazeWall {
    constructor(physicsWorld, scene, camera) {
        this.physicsWorld = physicsWorld;
        this.scene = scene;
        this.camera = camera

        this.treeLit = false;

        this.mesh = undefined;
        this.rigidBody = undefined;
        this.groupMesh = undefined;
        this.compoundShape = new Ammo.btCompoundShape();

        this.physicsSphere = new PhysicsSphere(this.physicsWorld, this.scene, this.camera);
        this.physicsSphere.create(2, {x:250-20+3, y:401, z:-5}, false, 3, false)


        let intensity = 1, distance = 2000, angle = degToRad(45), penumbra = 0.1, decay = 0.9;
        this.spotLightFront = new THREE.SpotLight(0xffffff, intensity, distance, degToRad(15), penumbra, decay);
        this.spotLightFront.position.set(200, 390, 0);
        this.spotLightFront.castShadow = true;
        this.spotLightFront.shadow.mapSize.width = 1024;
        this.spotLightFront.shadow.mapSize.height = 1024;
        this.spotLightFront.shadow.camera.near = 500;
        this.spotLightFront.shadow.camera.far = 4000;
        this.spotLightFront.shadow.camera.fov = 30;
        this.spotLightFront.target = this.physicsSphere.mesh
        this.scene.add(this.spotLightFront);
    }

    create(position={x:0, y:0, z:0}) {
        // Create spiral
        this.groupMesh = new THREE.Group()
        this.groupMesh.position.set(0,0,0)
        this._createSpiral(this.groupMesh)

        let x=0, y=-90, z=0
        this.groupMesh.rotation.set(toRadians(x), toRadians(y), toRadians(z) )
        this.groupMesh.position.set(position.x,position.y,position.z)

        this.groupMesh.scale.set(4,4,4)
        this._initAmmo()
    }

    /**
     * Based on https://threejs.org/docs/#api/en/geometries/LatheBufferGeometry
     */
    _createSpiral(_groupMesh){
        let width=6, height=25, posInitY = 80, depth = 0.625

        this._addWall({x: 0, y:0.5 , z:0}, {w:width,h:height,d:depth}, _groupMesh)
        this._addWall({x: 0, y:0.5-2 , z:depth*4}, {w:width,h:height,d:depth}, _groupMesh, {x:0,y:0,z:0}, true)
        this._addWall({x: -width/2-depth/2, y:0 , z:depth}, {w:depth,h:height,d:depth*5}, _groupMesh)
        this._addWall({x: width/2+depth/2, y:6/2  , z:depth}, {w:depth,h:height-6,d:depth*5}, _groupMesh)

        let wallWidth = 50/12, curPosY = height/2-depth/2-depth*2, angle = 10, yIncrement = 2.5

        for (let i=0; i<9; i++, curPosY-=yIncrement) {
            if (i === 9 - 1) {
                curPosY-=yIncrement
                wallWidth *= 3
            }
            this._addWall({
                x: i % 2 === 0 ? (-width / 2 + wallWidth / 2) : (width / 2 - wallWidth / 2), y: curPosY, z: depth
            }, {w: wallWidth, h: depth, d: depth * 5}, _groupMesh, {x: 0, y: 0, z: i % 2 === 0 ? -angle : angle})
        }
    }

    update() {
        let position = this.physicsSphere.getPosition()

        if (position.x > 235) {
            this.physicsWorld._setGravity(-100)
            this.camera.position.x = position.x +-100
            this.camera.position.y = 350
            this.camera.position.z = 0
            this.camera.lookAt(position)
        }
        if(position.z >=260 && !this.treeLit){
            //turn lights on. Probably shouldn't be a part of PhysicsMazeWall.js....
            this.treeLit = true;
            let tree = this.scene.getObjectByName("ChristmasTree");
            for (let i=0; i< tree.children.length-4; i++) {
                tree.children[i].material.color.r *=100;
                tree.children[i].material.color.g *=100;
                tree.children[i].material.color.b *=100;
                tree.children[i].material.emissive = new THREE.Color(
                    tree.children[i].material.color.r,
                    tree.children[i].material.color.g,
                    tree.children[i].material.color.b
                );
            }
        }

        this.setCamera(position.y, 237, 310, {x:240, y:325, z:50})
        this.setCamera(position.y, 170, 237, {x:190, y:260, z:-115})
        this.setCamera(position.y, 140, 170, {x:40, y:position.y+100/*220*/, z:0})
        this.setCamera(position.y, 5, 140, {x:-50, y: 180, z: 0})

        this.setCamera(position.y, -50, 5, {x:-65, y:2, z:3})
        this.setCamera(position.y, -100000, -50, {x:-109, y:-20, z:332}, {x:-64, y:-64, z:290})
    }

    /**
     * Positions camera if values are in range
     */
    setCamera(n, min, max, camPos={x:0,y:0,z:0}, customLookAt) {
        if (isNumberInRange(n, min, max)) {
            this.camera.position.x = camPos.x
            this.camera.position.y = camPos.y
            this.camera.position.z = camPos.z

            if(customLookAt)
                this.camera.lookAt(new THREE.Vector3(customLookAt.x, customLookAt.y, customLookAt.z))
            else
                this.camera.lookAt(this.physicsSphere.getPosition());
        }
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

        this.scene.add(this.groupMesh)

        // Legg til physicsWorld:
        this.physicsWorld.addRB( this.rigidBodyCompound,
            CONST.CollisionGroups.Tube,
            CONST.CollisionMasks.Tube);
        this.physicsWorld._updateSingleAabb(this.rigidBodyCompound) ;
        this.groupMesh.userData.physicsBody = this.rigidBodyCompound;
        this.physicsWorld.rigidBodies.push(this.groupMesh);
    }
}