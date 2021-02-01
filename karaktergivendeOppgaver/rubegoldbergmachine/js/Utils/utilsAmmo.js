import * as THREE from '../../lib/three/build/three.module.js';
import {toRadians} from './utils.js';

/**
 * Extracts Ammo.js shapes from given mesh
 */
export function extractAmmoShapeFromMesh(mesh, scale) {
    function traverseModel(mesh, modelVertices = []) {
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
        scale = {x: 1, y: 1, z: 1};

    let vertices = traverseModel(mesh);   // Fungerer kun sammen med BufferGeometry!!
    let ammoMesh = new Ammo.btTriangleMesh();
    for (let i = 0; i < vertices.length; i += 9) {
        let v1_x = vertices[i];
        let v1_y = vertices[i + 1];
        let v1_z = vertices[i + 2];

        let v2_x = vertices[i + 3];
        let v2_y = vertices[i + 4];
        let v2_z = vertices[i + 5];

        let v3_x = vertices[i + 6];
        let v3_y = vertices[i + 7];
        let v3_z = vertices[i + 8];

        let bv1 = new Ammo.btVector3(v1_x, v1_y, v1_z);
        let bv2 = new Ammo.btVector3(v2_x, v2_y, v2_z);
        let bv3 = new Ammo.btVector3(v3_x, v3_y, v3_z);

        ammoMesh.addTriangle(bv1, bv2, bv3);
    }
    let triangleShape = new Ammo.btBvhTriangleMeshShape(ammoMesh, false);
    triangleShape.setMargin(0.01);
    triangleShape.setLocalScaling(new Ammo.btVector3(scale.x, scale.y, scale.z));
    return triangleShape;
}

/**
 * Adds given mesh to scene with physics
 * NB - Only THREE.<...>BufferGeometry allowed in mesh
 *
 * Based on /del5ammoShapes3/ammoShapeHelpers3.js
 * @param scene
 * @param mesh
 * @param mass
 * @param _physicsWorld
 * @param _colGroupSelf
 * @param _colGroupToCollideWith
 */
export function createTriangleMeshShape(scene, mesh, mass, _physicsWorld, _colGroupSelf, _colGroupToCollideWith) {
    mesh.receiveShadow = true
    mesh.castShadow = true;

    // TriangleShape:
    let shape = createAmmoTriangleShape(mesh, true);
    let shapeTrans = new Ammo.btTransform();
    shapeTrans.setIdentity();

    // Compound:
    let compoundShape = new Ammo.btCompoundShape();
    compoundShape.addChildShape(shapeTrans, shape);
    let position = mesh.position;
    let quat = mesh.quaternion;
    let compoundShapeTrans = new Ammo.btTransform();
    compoundShapeTrans.setIdentity();
    compoundShapeTrans.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));
    compoundShapeTrans.setRotation( new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w) );
    let motionState = new Ammo.btDefaultMotionState( compoundShapeTrans );
    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    compoundShape.setMargin( 0.04 );
    compoundShape.calculateLocalInertia( mass, localInertia );
    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, compoundShape, localInertia );
    let rigidBodyCompound = new Ammo.btRigidBody(rbInfo);
    rigidBodyCompound.setFriction(0.4);
    rigidBodyCompound.setRestitution(0.6);
    scene.add(mesh);

    // rigidBodyCompound.setMassProps(0)

    _physicsWorld.addRB(
        rigidBodyCompound,
        _colGroupSelf,
        _colGroupToCollideWith
    );


    _physicsWorld._updateSingleAabb(rigidBodyCompound)

    mesh.userData.physicsBody = rigidBodyCompound;
    _physicsWorld.rigidBodies.push(mesh)
    return rigidBodyCompound
}


/** ************* **/
/** HELPERS BELOW **/
/** ************* **/

/**
 * Based on /del5ammoShapes3/ammoShapeHelpers3.js
 */
function createAmmoTriangleShape(mesh, useConvexShape) {
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

    let triangleShape;
    if (useConvexShape)
        triangleShape = new Ammo.btConvexTriangleMeshShape(ammoMesh, false);
    else
        triangleShape = new Ammo.btBvhTriangleMeshShape(ammoMesh, false);

    let threeScale = mesh.scale;
    triangleShape.setLocalScaling(new Ammo.btVector3(threeScale.x, threeScale.y, threeScale.z));
    return triangleShape;
}

/**
 * Based on /del5ammoShapes3/ammoShapeHelpers3.js
 */
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

