import * as THREE from "../../../../lib/three/build/three.module.js";
export class PhysicsBox {
	constructor(physicsWorld, scene) {
		this.scene = scene;
		this.physicsWorld = physicsWorld;

		this.rigidBody = undefined;
		this.mesh = undefined;

		this.IMPULSE_FORCE = 4;
	}

	create(radius=1, pos, color, mass, boxSize){
		// Inputkontroll:
		if (!pos) pos = {x:0, y:25, z:0};
		if (!mass) mass = 0;
		if (!color) color = '#00FF00';
		if (!boxSize) boxSize = {width: 1, height: 1, depth:1};

		let quat = {x: 0, y: 0, z: 0, w: 1};

		// AMMO:
		let boxShape = new Ammo.btBoxShape( new Ammo.btVector3( boxSize.width/2, boxSize.height/2, boxSize.depth/2) );  //NB! Delt på 2!!
		let transform = new Ammo.btTransform();
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
		transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );

		let motionState = new Ammo.btDefaultMotionState( transform );
		let localInertia = new Ammo.btVector3( 0, 0, 0 );
		this.rigidBody = new Ammo.btRigidBody(new Ammo.btRigidBodyConstructionInfo(mass, motionState, boxShape, localInertia));
		this.rigidBody.setRestitution(0.7);
		this.rigidBody.setFriction(0.5);

		// Kollisjonsfiltrering: Denne RB tilhører gruppa colGroupBox og skal kunne
		// kollidere med objekter i gruppene colGroupBox, colGroupPlane, colGroupBall m.fl.
		this.physicsWorld.addRB(this.rigidBody,
			this.physicsWorld.groups.colGroupBox,
			this.physicsWorld.groups.colGroupBox |
				this.physicsWorld.groups.colGroupPlane |
				this.physicsWorld.groups.colGroupBall |
				this.physicsWorld.groups.colGroupStick
			);

		//this.physicsWorld.addRB(this.rigidBody);

		// THREE:
		let geometry = new THREE.BoxBufferGeometry( boxSize.width, boxSize.height, boxSize.depth);
		this.mesh = new THREE.Mesh(
			geometry,
			new THREE.MeshPhongMaterial({
			map: new THREE.TextureLoader().load('textures/OpenGameArt/Planks/test_128x128_6.png'),
			side: THREE.DoubleSide}));
		let originBox = transform.getOrigin();
		let orientationBox = transform.getRotation();
		this.mesh.position.set(originBox.x(), originBox.y(), originBox.z());
		this.mesh.setRotationFromQuaternion(new THREE.Quaternion(orientationBox.x(), orientationBox.y(), orientationBox.z(), orientationBox.w()));
		this.mesh.castShadow = true;

		this.mesh.userData.physicsBody = this.rigidBody;
		this.physicsWorld.rigidBodies.push(this.mesh);
		this.scene.add(this.mesh);
	}

	keyCheck(deltaTime, currentlyPressedKeys) {
		if (!this.rigidBody || !this.mesh)
			return;

		this.rigidBody.activate(true);

		let direction = undefined;
		let impulse = undefined;
		if (currentlyPressedKeys[65]) {	//A
			direction = {x:-1, y:0, z:0};
		}
		if (currentlyPressedKeys[68]) {	//D
			direction = {x:1, y:0, z:0};
		}
		if (currentlyPressedKeys[87]) {	//W
			direction = {x:0, y:0, z:-1};
		}
		if (currentlyPressedKeys[83]) {	//S
			direction = {x:0, y:0, z:1};
		}
		if (currentlyPressedKeys[32]) {	//SPACE
			direction = {x:0, y:1, z:0};
		}
		if (direction)  //<== NB! Viktig å sjekke!
			impulse = new Ammo.btVector3(direction.x*this.IMPULSE_FORCE, direction.y*this.IMPULSE_FORCE, direction.z*this.IMPULSE_FORCE);

		this.rigidBody.applyCentralImpulse( impulse );


	}
}
