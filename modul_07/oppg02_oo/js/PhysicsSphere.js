import * as THREE from "../../../../lib/three/build/three.module.js";
export class PhysicsSphere {
	constructor(physicsWorld, scene) {
		this.scene = scene;
		this.physicsWorld = physicsWorld;

		this.mesh = undefined;
		this.rigidBody = undefined;
	}

	create(radius, pos, color, mass){
		// Inputkontroll:
		if (!radius) radius = 1;
		if (!pos) pos = {x:0, y:30, z:0};
		if (!mass) mass = 1;
		if (!color) color = '#0000FF';

		mass = mass * radius;   // Gjør massen proporsjonal med størrelsen.

		let quat = {x: 0, y: 0, z: 0, w: 1};

		//Ammojs:
		let transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
		transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
		let motionState = new Ammo.btDefaultMotionState( transform );
		let colShape = new Ammo.btSphereShape( radius );
		//colShape.setMargin( 0.05 );
		let localInertia = new Ammo.btVector3( 0, 0, 0 );
		colShape.calculateLocalInertia( mass, localInertia );
		let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
		this.rigidBody = new Ammo.btRigidBody( rbInfo );
		this.rigidBody.setRestitution(0.3);
		this.rigidBody.setFriction(0.6);
		// Kollisjonsfiltrering: Denne RB tilhører gruppa colGroupBall og skal kunne
		// kollidere med objekter i gruppene colGroupBall, colGroupBall, colGroupPlane OG colGroupBox.
		this.physicsWorld.addRB(this.rigidBody,
			this.physicsWorld.groups.colGroupBall,
			this.physicsWorld.groups.colGroupBall |
			this.physicsWorld.groups.colGroupPlane |
			this.physicsWorld.groups.colGroupBox |
			this.physicsWorld.groups.colGroupStick
		);
		// this.physicsWorld.addRB(this.rigidBody);

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

	createRandom(){
		let xPos = -14 + Math.random() * 28;
		let zPos = 15 + Math.random() * -50;
		let pos = {x: xPos, y: 20, z: zPos};
		let radius = -0.2 + Math.random()*2;
		return this.create(radius, pos, 0xff0505, 5);
	}

	keyCheck(deltaTime, currentlyPressedKeys) {
		if (!this.rigidBody || !this.mesh)
			return;

		this.rigidBody.activate(true);

		if (currentlyPressedKeys[72]) {	//H
			this.createRandom();
		}
	}

}
