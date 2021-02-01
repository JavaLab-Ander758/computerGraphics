import * as THREE from "../../../../lib/three/build/three.module.js";

/**
 * Basert på hingeTest0.html og springConstraintTest1.html
 */
export class PhysicsHinge {
	constructor(physicsWorld, scene){
		this.physicsWorld = physicsWorld;
		this.scene = scene;

		this.boardRotAngle = 0; //Math.PI/8;      // Dersom planet skal roteres.
		this.boardRotAxis = {x: 1, y:0, z: 0};
		this.IMPULSE_FORCE_STICK = 150;

		this.rbAnchor = undefined;
		this.anchorMesh = undefined;
		this.rbStick = undefined;
		this.stickMesh = undefined;
		this.hingeConstraint = undefined;

		this.enumKeyCodes = {
			V: 86,
			B: 66
		}
	}

	// Pinnen er forankret i kula (som står i ro, dvs. masse=0).
	// Man bestemmer selv om ankret (Kula) skal tegnes/vises.
	// Pinnen kan beveges - gjøres vha. applyCentralImpulse
	create(_hingeOriginXYZ={x: 0, y: 0, z:0}) {
		let posStick = {x: _hingeOriginXYZ.x, y: _hingeOriginXYZ.y, z: _hingeOriginXYZ.z};     // Cube
		let scaleStick = {x: Math.abs(_hingeOriginXYZ.x) - 0.5, y: 15, z: 2};   // Størrelse på pinnen.
		let massStick = 2;                     // Kuben/"stikka" festes til kula og skal kunne rotere. Må derfor ha masse.

		let posAnchor = {x: _hingeOriginXYZ.x, y: 0, z: 0};    // Sphere, forankringspunkt.
		let radiusAnchor = 1;                         // Størrelse på kula.
		let massAnchor = 0;                     // Sphere, denne skal stå i ro.

		let transform = new Ammo.btTransform();

		//ThreeJS, kule:
		let threeQuat = new THREE.Quaternion();  // Roterer i forhold til planet (dersom satt).
		threeQuat.setFromAxisAngle( new THREE.Vector3( this.boardRotAxis.x, this.boardRotAxis.y, this.boardRotAxis.z ), this.boardRotAngle);
		let anchorMeshOpacity = 1.0;
		this.anchorMesh = new THREE.Mesh(new THREE.CylinderBufferGeometry(radiusAnchor, radiusAnchor, 25), new THREE.MeshPhongMaterial({color: 0x000000, transparent: true, opacity: anchorMeshOpacity}));
		this.anchorMesh.position.set(posAnchor.x, posAnchor.y, posAnchor.z);
		this.anchorMesh.setRotationFromQuaternion(threeQuat);
		this.anchorMesh.castShadow = true;
		this.anchorMesh.receiveShadow = true;
		this.scene.add(this.anchorMesh);
		//AmmoJS, kule:
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( _hingeOriginXYZ.x, _hingeOriginXYZ.y, _hingeOriginXYZ.z ) );		let btQuat1 = new Ammo.btQuaternion();
		btQuat1.setRotation(new Ammo.btVector3(this.boardRotAxis.x, this.boardRotAxis.y, this.boardRotAxis.z), this.boardRotAngle);
		transform.setRotation( btQuat1 );
		let motionState = new Ammo.btDefaultMotionState( transform );
		let anchorColShape = new Ammo.btSphereShape( radiusAnchor );
		let localInertia = new Ammo.btVector3( 0, 0, 0 );
		anchorColShape.calculateLocalInertia( massAnchor, localInertia );
		let rbInfoAnchor = new Ammo.btRigidBodyConstructionInfo( massAnchor, motionState, anchorColShape, localInertia );
		this.rbAnchor = new Ammo.btRigidBody( rbInfoAnchor );
		this.rbAnchor.setRestitution(0.4);
		this.rbAnchor.setFriction(0.6);
		this.physicsWorld.addRB(this.rbAnchor,
			this.physicsWorld.groups.colGroupHingeSphere,
			this.physicsWorld.groups.colGroupBall);
		this.anchorMesh.userData.physicsBody = this.rbAnchor;
		this.physicsWorld.rigidBodies.push(this.anchorMesh);

		//ThreeJS, kube/stick:
		this.stickMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({map: new THREE.TextureLoader().load('textures/OpenGameArt/wood 2.jpg'), side: THREE.DoubleSide}));
		this.stickMesh = new THREE.Mesh(
			new THREE.BoxBufferGeometry(),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load('textures/OpenGameArt/wood 2.jpg'),
				side: THREE.DoubleSide}));
		this.stickMesh.wrap
		this.stickMesh.position.set(posStick.x, posStick.y, posStick.z);
		this.stickMesh.scale.set(scaleStick.x, scaleStick.y, scaleStick.z);
		this.stickMesh.setRotationFromQuaternion(threeQuat);
		this.stickMesh.castShadow = true;
		this.stickMesh.receiveShadow = true;
		this.scene.add(this.stickMesh);
		//AmmoJS, kube/stick:
		transform.setIdentity();
		transform.setOrigin( new Ammo.btVector3( posStick.x, posStick.y, posStick.z ) );
		let btQuat2 = new Ammo.btQuaternion();
		btQuat2.setRotation(new Ammo.btVector3(this.boardRotAxis.x, this.boardRotAxis.y, this.boardRotAxis.z), this.boardRotAngle); // + Math.PI/8);
		transform.setRotation( btQuat2 );
		motionState = new Ammo.btDefaultMotionState( transform );
		let stickColShape = new Ammo.btBoxShape( new Ammo.btVector3( scaleStick.x * 0.5, scaleStick.y * 0.5, scaleStick.z * 0.5 ) );
		localInertia = new Ammo.btVector3( 0, 0, 0 );
		stickColShape.calculateLocalInertia( massStick, localInertia );
		let rbInfoStick = new Ammo.btRigidBodyConstructionInfo( massStick, motionState, stickColShape, localInertia );
		this.rbStick = new Ammo.btRigidBody(rbInfoStick);
		this.rbStick.setRestitution(0.4);
		this.rbStick.setFriction(0.6);
		this.physicsWorld.addRB(this.rbStick, this.physicsWorld.groups.colGroupStick, this.physicsWorld.groups.colGroupBall | this.physicsWorld.groups.colGroupPlane | this.physicsWorld.groups.colGroupBox);
		this.stickMesh.userData.physicsBody = this.rbStick;

		//Ammo, hengsel: SE F.EKS: https://www.panda3d.org/manual/?title=Bullet_Constraints#Hinge_Constraint:
		let anchorPivot = new Ammo.btVector3( 0, 1, 0 );
		let stickPivot = new Ammo.btVector3( (_hingeOriginXYZ.x < 0)? (- scaleStick.x * 0.5) : (scaleStick.x * 0.5), 0, 0 );
		const anchorAxis = new Ammo.btVector3(0,1,0);
		const stickAxis = new Ammo.btVector3(0,1,0);
		this.hingeConstraint = new Ammo.btHingeConstraint(this.rbAnchor, this.rbStick, anchorPivot, stickPivot, anchorAxis, stickAxis, false);

		let maxHingePivot = Math.PI / 2.5;
		let _softness = 0.9;
		let _biasFactor = 0.3;
		let _relaxationFactor = 1.0;
		this.hingeConstraint.setLimit(-maxHingePivot, maxHingePivot, _softness, _biasFactor, _relaxationFactor);

		this.physicsWorld.addConstraint( this.hingeConstraint, false );
		this.physicsWorld.rigidBodies.push(this.stickMesh);
		createSpringDoor(this.scene, this.physicsWorld, this.rbStick)

		/**
		 * Creates spring for the hinge/door
		 *
		 * Based on ammoSpringHelpers1.js from /del4-2020
		 */
		function createSpringDoor(scene, physicsWorld, rbStick) {
			let springMass = 10;
			let springScale = {x: 0, y: 2, z: -2};
			let springPos = {x: 0, y: 0, z: 0};

			// Three:
			let springCubeMesh = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({visible: false}));
			springCubeMesh.position.set(springPos.x, springPos.y, springPos.z);
			springCubeMesh.scale.set(springScale.x, springScale.y, springScale.z);
			scene.add(springCubeMesh);

			let boxShape = new Ammo.btBoxShape(new Ammo.btVector3(springScale.x * 0.5, springScale.y * 0.5, springScale.z * 0.5));

			let rbBox = createRB(boxShape, springMass, springPos);
			springCubeMesh.userData.physicsBody = rbBox;
			physicsWorld.rigidBodies.push(springCubeMesh);

			//FJÆR MELLOM box1 og 2: https://stackoverflow.com/questions/46671809/how-to-make-a-spring-constraint-with-bullet-physics
			let transform1 = new Ammo.btTransform();
			transform1.setIdentity();
			transform1.setOrigin(new Ammo.btVector3(0, 0, 0));
			let transform2 = new Ammo.btTransform();
			transform2.setIdentity();
			transform2.setOrigin(new Ammo.btVector3(0, 0, 0));

			let springConstraint = new Ammo.btGeneric6DofSpringConstraint(
				rbStick,
				rbBox,
				transform1,
				transform2,
				true);

			// Removing any restrictions on the y-coordinate of the hanging box
			// by setting the lower limit above the upper one.
			springConstraint.setLinearLowerLimit(new Ammo.btVector3(0.0, 0.0, -10.0));
			springConstraint.setLinearUpperLimit(new Ammo.btVector3(0.0, 0.0, 10.0));

			springConstraint.setAngularLowerLimit(new Ammo.btVector3(0, 0.0, 0.0));
			springConstraint.setAngularUpperLimit(new Ammo.btVector3(0, 0.0, 0.0));

			springConstraint.enableSpring(2, true);

			let stiffness = 10;
			let damping = 0.8;
			springConstraint.setStiffness(2, stiffness);
			springConstraint.setDamping(2, damping);

			physicsWorld.addConstraint(springConstraint, false);
		}

		/**
		 * Based on ammoSpringHelpers1.js from /del4-2020
		 */
		function createRB(shape, mass, position) {
			let transform = new Ammo.btTransform();
			transform.setIdentity();
			transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
			let motionState = new Ammo.btDefaultMotionState(transform);
			let localInertia = new Ammo.btVector3(0, 0, 0);
			shape.calculateLocalInertia(mass, localInertia);
			let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
			let rbBox = new Ammo.btRigidBody(rbInfo);
			rbBox.setRestitution(0.0);
			rbBox.setFriction(0.0);
			return rbBox;
		}
	}

	/**
	 * Check for pressed keys
	 */
	keyCheck(deltaTime, currentlyPressedKeys) {
		this._moveHinge(currentlyPressedKeys)
	}

	/**
	 * Move the hinge using keyboard input
	 * @param currentlyPressedKeys
	 */
	_moveHinge(currentlyPressedKeys) {
		if (!this.rbStick || !this.rbAnchor)
			return;
		if (!this.anchorMesh || !this.stickMesh)
			return;

		// NB! Denne er viktig. rigid bodies "deaktiveres" når de blir stående i ro, må aktiveres før man bruke applyCentralImpulse().
		this.rbStick.activate(true);
		this.rbAnchor.activate(true);

		// ROTERER i forhold til PLANET, bruker kvaternion:
		let threeQuat = new THREE.Quaternion();
		threeQuat.setFromAxisAngle( new THREE.Vector3( this.boardRotAxis.x, this.boardRotAxis.y, this.boardRotAxis.z ), this.boardRotAngle);

		// Beregner impuls-vektorene:

		let tmpTrans = new Ammo.btTransform();
		// STICKEN / KUBEN:
		// 1. Henter gjeldende rotasjon for "sticken"/kuben (Ammo):
		let ms1 = this.rbStick.getMotionState();
		ms1.getWorldTransform( tmpTrans );      // NB! worldTRANSFORM!
		let q1 = tmpTrans.getRotation();        // q1 inneholder nå stickens rotasjon.

		// 2. Lager en (THREE) vektor som peker i samme retning som sticken:
		let threeDirectionVectorStick = new THREE.Vector3(1,0,0);
		//   2.1 Lager en THREE-kvaternion for rotasjon basert på Ammo-kvaternionen (q1) over:
		let threeQuaternionStick = new THREE.Quaternion(q1.x(), q1.y(), q1.z(), q1.w());
		//   2.2 Roterer (THREE) retningsvektoren slik at den peker i samme retning som sticken:
		threeDirectionVectorStick.applyQuaternion(threeQuaternionStick);


		// 4. Lager vektorer som står vinkelrett på threeDirectionVectorStick vha. mesh.getWorldDirection():
		// Disse brukes igjen til å dytte sticken vha. applyCentralImpulse()
		let threeDir2 = new THREE.Vector3();
		this.stickMesh.getWorldDirection(threeDir2);  // NB! worldDIRECTION! Gir en vektor som peker mot Z. FRA DOC: Returns a vector representing the direction of object's positive z-axis in world space.
		let threeDir3 = new THREE.Vector3(-threeDir2.x, -threeDir2.y, -threeDir2.z);

		// 6. "Dytter" sticken:
		if (currentlyPressedKeys[this.enumKeyCodes.V]) {
			let rdv1 = new Ammo.btVector3(threeDir2.x*this.IMPULSE_FORCE_STICK , threeDir2.y*this.IMPULSE_FORCE_STICK , threeDir2.z*this.IMPULSE_FORCE_STICK );
			this.rbStick.applyCentralImpulse( rdv1, this.IMPULSE_FORCE_STICK );
		}
		if (currentlyPressedKeys[this.enumKeyCodes.B]) {
			let rdv2 = new Ammo.btVector3(threeDir3.x*this.IMPULSE_FORCE_STICK , threeDir3.y*this.IMPULSE_FORCE_STICK , threeDir3.z*this.IMPULSE_FORCE_STICK );
			this.rbStick.applyCentralImpulse( rdv2, this.IMPULSE_FORCE_STICK );
		}
	}

	/**
	 * Update params for the hingeConstraint on door
	 */
	updateHingeConstraint(_maxHingePivot = Math.PI/2.5, _softness = 0.9, _biasFactor = 0.3, _relaxationFactor = 1.0) {
		if (!this.hingeConstraint)
			return;
		this.hingeConstraint.setLimit(-_maxHingePivot, _maxHingePivot, _softness, _biasFactor, _relaxationFactor);
	}

}