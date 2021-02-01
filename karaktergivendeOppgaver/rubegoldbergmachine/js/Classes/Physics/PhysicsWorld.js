/*
	Collision margin (.setMargin(0.04) under:
	Fra: Bullet_User_manual.pdf
	Bullet uses a small collision margin for collision shapes, to improve performance and reliability of the collision detection.
	It is best not to modify the default collision margin, and if you do use a positive value: zero margin might introduce problems.
	By default this collision margin is set to 0.04

	Local inertia (treghetsmoment):
	Fra: Bullet_User_manual.pdf
	The world transform of a rigid body is in Bullet always equal to its center of mass, and its basis also defines its
	local frame for inertia. The local inertia tensor depends on the shape, and the btCollisionShape class provides a
	method to calculate the local inertia, given a mass.

 */

/**
 * Based on /del3-2020-OO from Modul 7
 */
export class PhysicsWorld {
	constructor() {
		this.physicsWorld = undefined;
		this.tmpTrans = undefined;
		this.rigidBodies = [];
	}

	setup() {
		this.tmpTrans = new Ammo.btTransform();  // Hjelpeobjekt.
		let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
			dispatcher          = new Ammo.btCollisionDispatcher(collisionConfiguration),
			overlappingPairCache= new Ammo.btDbvtBroadphase(),
			solver              = new Ammo.btSequentialImpulseConstraintSolver();

		this.physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
		this.physicsWorld.setGravity(new Ammo.btVector3(0, -9.81*2, 0));
	}

	_setGravity(_gravity) {
        this.physicsWorld.setGravity(new Ammo.btVector3(0, _gravity, 0));
    }

	update( deltaTime ){
		if (!this.tmpTrans)
			return;

		// Step physics world:
		this.physicsWorld.stepSimulation( deltaTime, 10 );

		// Update rigid bodies
		for ( let i = 0; i < this.rigidBodies.length; i++ ) {
			let objThree = this.rigidBodies[ i ];
			let objAmmo = objThree.userData.physicsBody;
			let ms = objAmmo.getMotionState();
			if ( ms ) {
				ms.getWorldTransform( this.tmpTrans );
				let p = this.tmpTrans.getOrigin();
				let q = this.tmpTrans.getRotation();
				objThree.position.set( p.x(), p.y(), p.z() );
				objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );
			}
		}
	}

	addRB(rigidBody, group, mask) {
		if (group && mask) {
			if (this.physicsWorld)
				this.physicsWorld.addRigidBody(rigidBody, group, mask);
		} else {
			if (this.physicsWorld)
				this.physicsWorld.addRigidBody(rigidBody);
		}
	}

	addConstraint(constraint, disableCollisions) {
		this.physicsWorld.addConstraint(constraint, disableCollisions);
	}

	_updateSingleAabb(rigidBodyCompound) {
		this.physicsWorld.updateSingleAabb(rigidBodyCompound)
	}
}
