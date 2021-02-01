/**
 * Terreng vha. heightmap (heightmap.png)
 */

//Globale variabler:
let renderer;
let scene;
let camera;
let controls; //rotere, zoone hele scenen.
let currentlyPressedKeys = [];
let clock = new THREE.Clock();
let cubePlaced = false;
let heliSpeed = 0;
let lastTime = 0.0;


let speedVector = new THREE.Vector3(0, 0.01, 0);
let positionVector = new THREE.Vector3(0,0,0);

let cube;
let cubeInitPosXYZ = [];
let cubeInitPosY;

// Terreng:
let TERRAIN_SIZE = 300;
let meshTerrain;
let isTerrainHeightLoaded = false;
let collidableMeshList = [];


import * as THREE from '../../../../lib/three/build/three.module.js';
import { TrackballControls } from '../../../../lib/three/examples/jsm/controls/TrackballControls.js';
import { getHeightData } from "../../../../lib/three/wfa-utils.js";
import * as utils from "./utils.js";
import * as utilsThree from "./utilsThree.js";

export function main() {
    //Henter referanse til canvaset:
    let mycanvas = document.getElementById('webgl');

    //Scene:
    scene = new THREE.Scene();

    // Setup renderer
    renderer = utilsThree.getRenderer(mycanvas);

    // Setup camera
    camera = utilsThree.getCamera();

    // Lys
    scene.add(utilsThree.getSpotLight())

    //Punktlys:
    scene.add(utilsThree.getPointLight())

    //Ambient:
    scene.add(new THREE.AmbientLight(0x221133));

    //Legg modeller til scenen:
    addTerrain();

    //Koordinatsystem:
    scene.add(new THREE.AxesHelper( TERRAIN_SIZE*2 ));

    //Roter/zoom hele scenen:
    addControls();

    //Håndterer endring av vindusstørrelse:
    window.addEventListener('resize', onWindowResize, false);

    // Listen for inputs
    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);

    animate();
}

//Legger til roter/zoom av scenen:
function addControls() {
    controls = new TrackballControls(camera);
    controls.addEventListener( 'change', render);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 10;
    controls.panSpeed = 0.8;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
}

function animate(currentTime) {
    requestAnimationFrame(animate);
    if (isTerrainHeightLoaded) {
        controls.update();
        render();
    }

    if (currentTime === undefined)
        currentTime = 0;

    let elapsed = 0.0;
    if (lastTime !== 0.0)
        elapsed = (currentTime - lastTime)/1000;
    lastTime = currentTime;

    if (currentTime)
        positionVector.y = positionVector.y + (speedVector.y * heliSpeed * elapsed)
    console.log('positionVector.y='+positionVector.y)
    console.log('speedVector.y='+speedVector.y)
    console.log('heliSpeed='+heliSpeed)
    console.log('elpased='+elapsed)

    if (cubePlaced) {
        updateCube();
    }

    // Check for input
    keyCheck();
}

function render()
{
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();
    if (isTerrainHeightLoaded)
        render();
}

/**
 * Return a randomly created Cube mesh
 */
function addRandomCube(_minSize, _maxSize) {
    let cubeSize = utils.getRandomInt(_minSize, _maxSize)

    // Create random cube
    let gCube = new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize);
    let mCube = new THREE.MeshPhongMaterial({color: '#'+(Math.random() * 0xFFFFFF << 0).toString(16).padStart(6, '0')});
    let meshCube = new THREE.Mesh(gCube, mCube);

    // Set random rotation
    meshCube.rotation.set(
        utils.degToRad(utils.getRandomInt(0, 90)),
        utils.degToRad(utils.getRandomInt(0, 90)),
        utils.degToRad(utils.getRandomInt(0, 90)));

    // Set random position
    //cubeInitPosXYZ = [utils.getRandomInt(-100, 100), 100, utils.getRandomInt(-100, 100)];
    cubeInitPosY = 100;
    meshCube.position.set(
        utils.getRandomInt(-100, 100),
        cubeInitPosY,
        utils.getRandomInt(-100, 100));

    cube = meshCube
    cubePlaced = true;
    scene.add(cube)
}

/**
 * Update the cube position by gravity
 */
function updateCube() {
    let v0 = 0;
    let a = 9.81;
    let t = clock.getElapsedTime();

    let s = v0 * t + (1/2) * a * (t*t);
    //cube.position.y = cubeInitPosXYZ[1]-s
    cube.position.y = cubeInitPosY - s;

    let v = v0 + a * t
    heliSpeed = v;
    speedVector.y = v
    collisionTest()

    /*if (cube.position.y <= 0) {
        cubePlaced = false;
        let msg = ('y=0 took ' + clock.getElapsedTime() + ' seconds...')
        alert(msg)
         clock.stop()
    }*/
}

//Fra: http://stackoverflow.com/questions/11473755/how-to-detect-collision-in-three-js
//Se referert lenke, koden er derfra:
function collisionTest() {
    /*
    let mCockpit = scene.getObjectByName("cockpit", true);  //Returnerer et Object3D-objekt
    collisionTestMesh(mCockpit);
    */
    let mBody = scene.getObjectByName("body", true);
    collisionTestMesh(cube/*mBody*/);
    /*
    let mRotor = scene.getObjectByName("rotor", true);
    collisionTestMesh(mRotor);
    let mBRotor = scene.getObjectByName("bakrotor", true);
    collisionTestMesh(mBRotor);
    */

}

//Kollisjonsvariabler:
let localVertex;
let globalVertex;
let directionVector;
let ray;
let collisionResults;
function collisionTestMesh(mesh) {
    //let originPoint = mesh.parent.position.clone();  //Returnerer helicopter-objektet (Object3D) f.eks. n?r mesh=cockpit.
    //Gjennoml?per alle vertekser til meshet:
    for (let vertexIndex = 0; vertexIndex < mesh.geometry.vertices.length; vertexIndex++)
    {
        //Modell/lokale koordinater for meshets vertekser:
        localVertex = mesh.geometry.vertices[vertexIndex].clone();
        //Transformerer modellkoordinat vha. meshets matrise:
        globalVertex = localVertex.applyMatrix4( mesh.matrix );
        //Lager en retningsvektpr, en RAY, fra meshets posisjon (globale koordinater) til transformert verteks:
        directionVector = globalVertex.sub( mesh.position );

        //Lager et Raycaster-objekt vha.
        ray = new THREE.Raycaster( positionVector /*originPoint*/, directionVector.clone().normalize() ); //fra, retning

        //Returnerer en liste med objekter som helikoptret kolliderer med (n?rmeste f?rst):
        collisionResults = ray.intersectObjects( collidableMeshList );

        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) {
            heliSpeed = 0;
            positionVector = new THREE.Vector3(0,0,0);
            //speedVector = new THREE.Vector3(0.3,0,0.1);
            alert('HIT')
        }
    }
}



function handleKeyUp(event) {currentlyPressedKeys[event.keyCode] = false;}

function handleKeyDown(event) {currentlyPressedKeys[event.keyCode] = true;}

function keyCheck() {
    if (currentlyPressedKeys[32]) { // SPACE
        console.log('SPACE')
        if (!cubePlaced) {
            addRandomCube(5, 15)
            clock.start()
        }
    }
}

//Denne kjøres når høydedata er ferdiga lastet og generert:
function terrainHeightLoaded(heightData) {
    //terrainArray = et array bestående av 16 bits heltall.
    for (let i = 0, len = meshTerrain.geometry.vertices.length; i < len; i++) {
        meshTerrain.geometry.vertices[i].z = heightData[i];
    }
    meshTerrain.geometry.computeVertexNormals();
    isTerrainHeightLoaded = true;
}

function addTerrain() {
    let heightMapUrl = 'images/heightMap_mount-everest_300x300.png';
    let mapSizeX = 300;
    let mapSizeY = 300;
    let planeNoTiles = mapSizeX-1; // Planet består av 5x5 ruter. Bruker høydedata fra en 6x6 .png
    /* FRA DOC:
        PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
        width — Width along the X axis. Default is 1.
        height — Height along the Y axis. Default is 1.
        widthSegments — Optional. Default is 1.
        heightSegments — Optional. Default is 1.
    */
    let planeGeometry = new THREE.PlaneGeometry( TERRAIN_SIZE, TERRAIN_SIZE, planeNoTiles, planeNoTiles );
    planeGeometry.computeVertexNormals();   // <== NB!
    // Alt 1: Enkelt materiale med farge og lys:
    /*
    let planeMaterial = new THREE.MeshLambertMaterial({ color: 0xff6611, side: THREE.DoubleSide, wireframe: false });
    meshTerrain = new THREE.Mesh( planeGeometry, planeMaterial);
    meshTerrain.translateY(-195.67);        // Basert på beregnet høydedata/z-verdi for gitt png.
    meshTerrain.rotation.x = -Math.PI / 2;
    scene.add(meshTerrain);
    //Laster fil med høydedata for planet (/lib/wfa-utils.js):
    getHeightData('images/heightMap_mount-everest_6x6.png', 6, 6, terrainHeightLoaded);
    */

    //Alt 2: Bruker teksturmateriale:
    // NB! Texture tiling er uavhengig av plan-rutenettet:
    let textureLoader = new THREE.TextureLoader();
    textureLoader.load( "images/tile2.png", function( textureMap ) {
        textureMap.wrapS = THREE.RepeatWrapping;
        textureMap.wrapT = THREE.RepeatWrapping;
        textureMap.repeat.x = 10;    // Økes dersom man ønsker texture tiling.
        textureMap.repeat.y = 10;
        let planeMaterial = new THREE.MeshLambertMaterial(
            {
                side: THREE.DoubleSide,
                map: textureMap,
                shading: THREE.SmoothShading,
                wireframe: false,
            });
        meshTerrain = new THREE.Mesh( planeGeometry, planeMaterial);
        meshTerrain.translateY(-250);
        meshTerrain.rotation.x = -Math.PI / 2;
        scene.add(meshTerrain);
        collidableMeshList.push(meshTerrain);



        //Laster fil med høydedata for planet (/lib/wfa-utils.js):
        getHeightData(heightMapUrl, mapSizeX, mapSizeY, terrainHeightLoaded);
    });
}