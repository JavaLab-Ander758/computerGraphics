import * as THREE from "../../../lib/three/build/three.module.js";
import * as CONST from "../../Utils/Constants.js";
import { getHeightData} from "../../../lib/three/wfa-utils.js";


let terrainMesh;
let groundShape;
let isTerrainHeightLoaded = false;
let TERRAIN_SIZE = 300;
let ammoHeightData = null;

/**
 * Based on /del4-2020_NEW_VERSION/ammoTerrainDemo1.html
 * and /del4-2020_NEW_VERSION/kripkenTerrain.html
 */
export class PhysicsHeightMap {
    constructor(physicsWorld, scene) {
        this.scene = scene;
        this.physicsWorld = physicsWorld;

    }

    create(_terrainSize=300, _terrainPos={x:0, y:0, z:0}){
        TERRAIN_SIZE = _terrainSize
        this.terrainPos = _terrainPos
        this.addTerrain(this.scene, this.physicsWorld)
    }


    addTerrain(_scene, _physicsWorld) {
        myScene = _scene;
        myPhysicsWorld = _physicsWorld

        getHeightData("./assets/textures/heightmap3.png", 300, 300, this.terrainHeightLoaded);
    }

    terrainHeightLoaded(heightData) {
        let terrainGeometry = new THREE.PlaneBufferGeometry(TERRAIN_SIZE * 2, TERRAIN_SIZE * 2, SEGMENTS, SEGMENTS);
        terrainGeometry.rotateX(-Math.PI / 2);

        let vertices = terrainGeometry.attributes.position.array;
        for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            if (heightData[i] >= TERRAIN_MAX_HEIGHT)
                heightData[i] = TERRAIN_MAX_HEIGHT;
            if (heightData[i] <= TERRAIN_MIN_HEIGHT)
                heightData[i] = TERRAIN_MIN_HEIGHT;
            vertices[j + 1] = heightData[i];
        }

        terrainGeometry.computeVertexNormals();

        let groundMaterial = new THREE.MeshPhongMaterial({color: 0xC7C7C7, side: THREE.DoubleSide});
        terrainMesh = new THREE.Mesh(terrainGeometry, groundMaterial);
        terrainMesh.receiveShadow = true;

        myScene.add(terrainMesh);

        let textureLoader = new THREE.TextureLoader();
        textureLoader.load("./assets/textures/tile2.png", function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(SEGMENTS, SEGMENTS);
            groundMaterial.map = texture;
            groundMaterial.needsUpdate = true;

            // Physics
            groundShape = createTerrainAmmoShape(heightData, HEIGHT_MAP_SIZE, HEIGHT_MAP_SIZE);
            let groundTransform = new Ammo.btTransform();
            groundTransform.setIdentity();
            groundTransform.setOrigin(new Ammo.btVector3(0, (TERRAIN_MAX_HEIGHT + TERRAIN_MIN_HEIGHT) / 2, 0));

            let rigidBodyMass = 0;
            let localInertia = new Ammo.btVector3(0, 0, 0);
            groundShape.calculateLocalInertia(rigidBodyMass, localInertia);
            let groundMotionState = new Ammo.btDefaultMotionState(groundTransform);

            let rbInfo = new Ammo.btRigidBodyConstructionInfo(rigidBodyMass, groundMotionState, groundShape, localInertia);
            let rigidBodyTerrain = new Ammo.btRigidBody(rbInfo);
            rigidBodyTerrain.setRestitution(0.5);
            rigidBodyTerrain.setFriction(0.3);

            terrainMesh.userData.physicsBody = rigidBodyTerrain;

            // Add terrain to PhysicsWorld
            let colGroupSelf = CONST.CollisionGroups.Plane,
                colGroupToCollideWith = CONST.CollisionMasks.Plane;
            myPhysicsWorld.addRB(rigidBodyTerrain,
                colGroupSelf, colGroupToCollideWith)
        });
        isTerrainHeightLoaded = true;
    }
}


const HEIGHT_MAP_SIZE = 300, SEGMENTS = HEIGHT_MAP_SIZE - 1, TERRAIN_MAX_HEIGHT = 500,
    TERRAIN_MIN_HEIGHT = -500;
let myScene;
let myPhysicsWorld;
function createTerrainAmmoShape(heightData, terrainWidth, terrainDepth) {
    let heightScale = 1;
    let upAxis = 1;
    let hdt = "PHY_FLOAT";
    let flipQuadEdges = false;

    ammoHeightData = Ammo._malloc(4 * terrainWidth * terrainDepth);
    let p = 0, p2 = 0;
    for (let j = 0; j < terrainDepth; j++)
        for (let i = 0; i < terrainWidth; i++) {
            Ammo.HEAPF32[ammoHeightData + p2 >> 2] = heightData[p];
            p++;
            p2 += 4;
        }

    let heightFieldShape = new Ammo.btHeightfieldTerrainShape(
        terrainWidth,
        terrainDepth,
        ammoHeightData,
        heightScale,
        TERRAIN_MIN_HEIGHT,
        TERRAIN_MAX_HEIGHT,
        upAxis,
        hdt,
        flipQuadEdges
    );

    let scaleX = (TERRAIN_SIZE * 2) / (terrainWidth - 1);
    let scaleZ = (TERRAIN_SIZE * 2) / (terrainDepth - 1);
    heightFieldShape.setLocalScaling(new Ammo.btVector3(scaleX, 1, scaleZ));

    heightFieldShape.setMargin(0, 0);
    return heightFieldShape;
}

