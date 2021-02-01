import * as THREE from "../../../../lib/three/build/three.module.js";
export class PhysicsTerrain {
	constructor(physicsWorld, scene) {
		this.scene = scene;
		this.physicsWorld = physicsWorld;

		this.rigidBody = undefined;
		this.mesh = undefined;

		this.TERRAIN_SIZE = 50;
		this.terrainWidth = 128;
		this.terrainDepth = 128;
	}

	create(){
		let geometry = new THREE.PlaneBufferGeometry( this.TERRAIN_SIZE * 2, this.TERRAIN_SIZE * 2, this.terrainWidth - 1, this.terrainDepth - 1 );
		geometry.rotateX( - Math.PI / 2 );
		let material = new THREE.MeshPhongMaterial( { color: 0xC709C7, side: THREE.DoubleSide } );
		this.mesh = new THREE.Mesh( geometry, material );
		this.mesh.receiveShadow = true;
		this.scene.add( this.mesh );

		let textureLoader = new THREE.TextureLoader();
		textureLoader.load( "./textures/tile2.png", ( texture ) =>  {   //<== NB! Arrow Function!! Kan dermed bruke this. inne i funksjonen.
			// ThreeJS, teksturering av terreng:
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			texture.repeat.set( this.terrainWidth - 1, this.terrainDepth - 1 );
			material.map = texture;
			material.needsUpdate = true;

			// AmmoJS for terreng:
			let pos = {x: 0, y: 0, z: 0};
			let scale = {x: this.TERRAIN_SIZE * 2, y: 0 , z:this.TERRAIN_SIZE * 2};
			let quat = {x: 0, y: 0, z: 0, w: 1};
			let mass = 0;   //NB! Terrenget skal stå i ro.
			let transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
			transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
			let motionState = new Ammo.btDefaultMotionState( transform );
			let terrainShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
			//terrainShape.setMargin( 0.05 );
			let localInertia = new Ammo.btVector3( 0, 0, 0 );
			terrainShape.calculateLocalInertia( mass, localInertia );
			let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, terrainShape, localInertia );
			this.rigidBody = new Ammo.btRigidBody( rbInfo );
			this.rigidBody.setRestitution(0.8);
			this.rigidBody.setFriction(0.5);

			this.physicsWorld.addRB(this.rigidBody,
				this.physicsWorld.groups.colGroupPlane,
				this.physicsWorld.groups.colGroupBall |
				this.physicsWorld.groups.colGroupBox |
				this.physicsWorld.groups.colGroupStick);

			// ThreeJS (resten):
			this.mesh.userData.physicsBody = this.rigidBody;
			this.mesh.userData.name = 'terrain';
			this.physicsWorld.rigidBodies.push(this.mesh);



		} );
	}

	keyCheck(deltaTime, currentlyPressedKeys) {
		if (!this.rigidBody || !this.mesh)
			return;

		this.rigidBody.activate(true);
	}
}
