import * as THREE from '../../../lib/three/build/three.module.js';
import * as CONST from "../../Utils/Constants.js";

/**
 * Based on /del3-2020-OO from Modul 7
 */
export class PhysicsSphere {
	constructor(physicsWorld, scene, camera) {
		this.physicsWorld = physicsWorld;
		this.scene = scene;
		this.camera = camera;

		this.mesh = undefined;
		this.rigidBody = undefined;
		this.IMPULSE_FORCE = 10;

		this.lastMovementDeltaTime = 0;
		this.lastPosition = undefined
        this.n = 0
		this.isMissile = undefined
		this.movementEnabled = false;
	}

	create(radius, pos, color, mass, isMissile){
		// Inputkontroll:
		if (!radius) radius = 1;
		if (!pos) pos = {x:0, y:30, z:0};
		// if (!mass) mass = 10;
		if (!color) color = '#0000FF';
		this.isMissile = isMissile

		mass = mass * radius;   // Gjør massen proporsjonal med størrelsen.

		let quat = {x: 0, y: 0, z: 0, w: 1};

		//Ammojs:
		let transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
		transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
		let motionState = new Ammo.btDefaultMotionState( transform );
		let colShape = new 	Ammo.btSphereShape( radius );
		//colShape.setMargin( 0.05 );
		let localInertia = new Ammo.btVector3( 0, 0, 0 );
		colShape.calculateLocalInertia( mass, localInertia );
		let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
		this.rigidBody = new Ammo.btRigidBody( rbInfo );
		this.rigidBody.setRestitution(0.3);
		this.rigidBody.setFriction(0.6);

		this.physicsWorld.addRB(this.rigidBody,
			CONST.CollisionGroups.Sphere,
			CONST.CollisionMasks.Sphere
		);

		//ThreeJS:
		this.mesh = new THREE.Mesh(new THREE.SphereBufferGeometry(radius, 32, 32), new THREE.MeshPhongMaterial({color: color}));
		this.mesh.position.set(pos.x, pos.y, pos.z);
		this.mesh.castShadow = true;
		this.mesh.receiveShadow = true;
		this.mesh.userData.physicsBody = this.rigidBody;
		this.mesh.userData.name = 'ball';
		//this.rigidBodies.push(ball);
		this.physicsWorld.rigidBodies.push(this.mesh);
		this.scene.add(this.mesh);
	}

	keyCheck(deltaTime, currentlyPressedKeys) {
		if (!this.rigidBody || !this.mesh)
			return;

		this.rigidBody.activate(true);

        let direction = undefined;
        let impulse = undefined;

        this.IMPULSE_FORCE = 5;

        if (currentlyPressedKeys["KeyA"])
            direction = {x: -1, y: 0, z: 0};
        if (currentlyPressedKeys["KeyD"])
            direction = {x: 1, y: 0, z: 0};
        if (currentlyPressedKeys["KeyW"])
            direction = {x: 0, y: 0, z: -1};
        if (currentlyPressedKeys["KeyS"])
            direction = {x: 0, y: 0, z: 1};
        if (currentlyPressedKeys["Keyx"])
            direction = {x: 0, y: -1, z: 0};
        if (currentlyPressedKeys["Space"]) {
            direction = {x: 0, y: 1, z: 0};
        }
        if (direction)  //<== NB! Viktig å sjekke!
            impulse = new Ammo.btVector3(direction.x * this.IMPULSE_FORCE, direction.y * this.IMPULSE_FORCE, direction.z * this.IMPULSE_FORCE);

        this.rigidBody.applyCentralImpulse(impulse);
    }

	/**
	 * Return THREE.Mesh.Position
	 */
	getPosition() {
		return this.mesh.position;
	}
}
