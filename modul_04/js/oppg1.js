/**
 * Enkel roterende teksturert kube MED LYS.
 * Nå med rotasjon m.m. av hele scenen (trackballcontrol).
 *
 * Bruker trackball - Kontrollen
 * Endret på kameraparametre (lookat og up).
 *
 * Bruker hele vindusstørrelsen: renderer.setSize(window.innerWidth, window.innerHeight);
 * Legger til en render() funksjon som kaller renderer.render().
 * Legger til en controls.addEventListener( 'change', render);
 *   - ved endringer kalles render() metoden
 * Håndterer endring av vindusstørrelse: window.addEventListener('resize', onWindowResize, false);
 * Må kalle på controls.update(); i animate()
 */


import * as THREE from '../../lib/three/build/three.module.js';
import { TrackballControls } from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import {GLTFLoader} from "../../lib/three/examples/jsm/loaders/GLTFLoader.js";

//Globale varianbler:
let renderer;
let cube;
let scene;
let camera;

//rotasjoner
let angle = 0.0;
let lastTime = 0.0;

let SIZE = 200;

//Lys:
let light;

let controls; //rotere, zoone hele scenen.

export function main() {
    //Henter referanse til canvaset:
    let mycanvas = document.getElementById('webgl');
    //Lager en scene:
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xdddddd );

    //Lager et rendererobjekt (og setter st?rrelse):
    renderer = new THREE.WebGLRenderer({canvas:mycanvas, antialias:true});
    renderer.setClearColor(0xBFD1FF, 0xff);  //farge, alphaverdi.
    renderer.setSize(window.innerWidth, window.innerHeight);

    //Kamera:
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.x = 420;
    camera.position.z = 0;
    camera.position.y = 500;
    camera.up = new THREE.Vector3(0, 1, 0);			//Endrer p? kameraets oppretning.
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);

    //Modeller:
    addModels();

    //Lys:
    light = new THREE.DirectionalLight(0xffffff, 1.0); //farge, intensitet (1=default)
    light.position.set(2, 1, 4);
    scene.add(light);
    // Ambient lys
    scene.add(new THREE.AmbientLight( 0x404040, 2));

    controls = new TrackballControls(camera, renderer.domElement);
    controls.addEventListener( 'change', render);

    //H?ndterer endring av vindusst?rrelse:
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function addModels() {
    // Plan
    let gPlane = new THREE.PlaneGeometry( SIZE*2, SIZE*2 );
    let mPlane = new THREE.MeshPhongMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
    let meshPlane = new THREE.Mesh( gPlane, mPlane);
    meshPlane.rotation.x = Math.PI / 2;
    // scene.add(meshPlane);

    // Grid
    scene.add(new THREE.GridHelper(SIZE*2, 10));
    // Coord
    scene.add(new THREE.AxesHelper(SIZE*10));

    // Kube i hvert hjørne
    let cubeSize = 50;
    let gCube = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    let tCube = new THREE.TextureLoader().load( 'images/bird1.png' );
    let mCube = new THREE.MeshPhongMaterial({map : tCube});	//NB! MeshPhongMaterial
    {
        cube = new THREE.Mesh(gCube, mCube);
        cube.position.set(SIZE-(cubeSize/2), 0, SIZE-(cubeSize/2))
        scene.add(cube);
    }
    {
        let cube2 = cube.clone();
        cube2.position.set(-SIZE+(cubeSize/2), 0, -SIZE+(cubeSize/2))
        scene.add(cube2);
    }
    {
        let cube3 = cube.clone();
        cube3.position.set(+SIZE-(cubeSize/2), 0, -SIZE+(cubeSize/2))
        scene.add(cube3);
    }
    {
        let cube4 = cube.clone();
        cube4.position.set(-SIZE+(cubeSize/2), 0, +SIZE-(cubeSize/2))
        scene.add(cube4);
    }

    // Torus
    let geometryTorus = new THREE.TorusGeometry( 25, 10, 16, 100 );
    let tTorus = new THREE.TextureLoader().load('images/texture_sofa-pink_256x256.JPG');
    let materialTorus = new THREE.MeshPhongMaterial({map : tTorus});
    let torus = new THREE.Mesh( geometryTorus, materialTorus );
    torus.rotation.x = Math.PI / 2;
    torus.position.set(SIZE-25-10, 4, 0);
    scene.add( torus );

    // Kule
    let sphereRadius = 50;
    let gSphere = new THREE.SphereGeometry(sphereRadius, 50, 50);
    let tSphere = new THREE.TextureLoader().load('images/texture_gulv-altaskifer_512x512.JPG');
    let mSphere = new THREE.MeshPhongMaterial({map : tSphere});
    let sphere = new THREE.Mesh(gSphere, mSphere);
    sphere.position.set(0, sphereRadius, -SIZE+(sphereRadius));
    scene.add(sphere);

    // Kjegle
    let cylinderRadius = 50;
    let cylinderHeight = 200;
    let cylinderResolution = 4;
    let gCylinder = new THREE.CylinderGeometry(cylinderRadius, cylinderRadius, cylinderHeight, cylinderResolution);
    let tCylinder = new THREE.TextureLoader().load('images/dice2.png');
    let mCylinder = new THREE.MeshPhongMaterial({map : tCylinder});
    let cylinder = new THREE.Mesh(gCylinder, mCylinder);
    cylinder.position.set(-SIZE+(5), cylinderHeight / 2, 0);
    scene.add(cylinder);

    // Main
    let pyramidRadius = 50;
    let pyramidHeight = 100;
    let pyramidResolution = 4;
    let gPyramid = new THREE.ConeGeometry(pyramidRadius, pyramidHeight, pyramidResolution, pyramidResolution);
    let tPyramid = new THREE.TextureLoader().load('images/texture_sofa-metal_256x512.jpg');
    let mPyramid = new THREE.MeshPhongMaterial({map : tPyramid});
    let pyramid = new THREE.Mesh(gPyramid, mPyramid);
    pyramid.position.set(0, pyramidHeight / 2, SIZE - pyramidRadius);
    scene.add(pyramid);

    // Kaffekrus / kopp
    let loader = new GLTFLoader();
    loader.load( 'images/sofa.glb', function ( gltf ) {
        gltf.scene.scale.set(2,2,2);
        gltf.scene.rotation.y = 2/Math.PI;
        gltf.scene.position.set(-100,0,-70)
        scene.add( gltf.scene );
    }, undefined, function ( error ) {
        console.error( error );
    } );

    addCup();
}

function addCup() {
    let cup = new THREE.Object3D();
    let mCup = new THREE.MeshPhongMaterial( {color: 0xddd4c9, side: THREE.DoubleSide} );
    let cupResolution = 50;
    let cupScale = 0.8;

    // Bottom
    let gBottom = new THREE.CylinderGeometry(15, 15, 2.5, cupResolution)
    let bottom = new THREE.Mesh(gBottom, mCup);
    cup.add(bottom);

    // Wall
    let pointsWall = [];
    for (let x = 0; x < 1; x=x+0.01) {
        let y = Math.pow(x,5)*2;
        pointsWall.push(new THREE.Vector2(x,y));
    }
    let gWall = new THREE.LatheGeometry(pointsWall, cupResolution, Math.PI, 0);
    let wall = new THREE.Mesh(gWall, mCup);
    wall.scale.set(40, 40, 40);
    cup.add(wall);

    // Handle
    let gHandle = new THREE.TorusGeometry( 20, 6, cupResolution, cupResolution, Math.PI);
    let handle = new THREE.Mesh( gHandle, mCup);
    handle.position.set(0,40,-33);
    // handle.translateOnAxis(new THREE.Vector3(0, 1, -0.8), 60)
    handle.rotation.set(Math.PI/2, 90*(Math.PI/180),degToRad(170));
    cup.add(handle)

    // Coffee
    let tCoffee = new THREE.TextureLoader().load('images/coffee_01_bubbles.jpg');
    let mCoffee = new THREE.MeshPhongMaterial({map : tCoffee, side: THREE.DoubleSide});
    let gCoffee = new THREE.CircleGeometry(38.5, cupResolution);
    let coffee = new THREE.Mesh(gCoffee, mCoffee);
    coffee.rotation.set(Math.PI/2, 0,degToRad(55));
    coffee.position.set(0,70,0)
    cup.add(coffee);

    cup.scale.set(cupScale, cupScale, cupScale);
    scene.add(cup);

    function degToRad(degree) {
        return (degree)*(Math.PI/180);
    }
}

function animate(currentTime) {
    requestAnimationFrame(animate);
    if (currentTime === undefined)
        currentTime = 0; //Udefinert f?rste gang.

    let elapsed = 0.0; 			// Forl?pt tid siden siste kall p? draw().
    if (lastTime !== 0.0) 		// F?rst gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime)/1000; //Opererer med sekunder.

    lastTime = currentTime;
    // F?lgende gir 60 graders rotasjon per sekund og 6 sekunder for en hel rotasjon:
    let rotationSpeed = (Math.PI / 3); // Bestemmer rotasjonshastighet.
    angle = angle + (rotationSpeed * elapsed);
    angle %= (Math.PI * 2); // "Rull rundt" dersom angle >= 360 grader.

    //Transformerer (roterer) kuben:
    //cube.rotation.x = angle;
    //cube.rotation.y = angle;

    //Oppdater trackball-kontrollen:
    controls.update();

    //Tegner scenen med gitt kamera:
    render();
};

function render()
{
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();
    render();
}

