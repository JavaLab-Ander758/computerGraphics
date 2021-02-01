import * as THREE from 			'../lib/three/build/three.module.js';
import {OrbitControls} from 	"../lib/three/examples/jsm/controls/OrbitControls.js";
import { addCoordSystem} from 	'../lib/three/wfa-coord.js';
import Stats from 				'../lib/three/examples/jsm/libs/stats.module.js';
import * as dat from 			'../lib/three/datgui/build/dat.gui.module.js';

// Homemade imports
import {Skybox} from "./Skybox.js";
import {_playSound} from 		"./Utils/utilsThree.js";
import {PhysicsWorld} from 		'./Classes/Physics/PhysicsWorld.js';
import {PhysicsTube} from 		"./Classes/Physics/PhysicsTube.js";
import {PhysicsPlane} from 		"./Classes/Physics/PhysicsPlane.js";
import {PhysicsDominoEffect} from "./Classes/Physics/PhysicsDominoEffect.js";
import {PhysicsHeightMap} from 	"./Classes/Physics/PhysicsHeightMap.js";
import {PhysicsSpiral} from 	"./Classes/Physics/PhysicsSpiral.js";
import {PhysicsMazeWall} from 	"./Classes/Physics/PhysicsMazeWall.js";
import {PhysicsTrench} from 	"./Classes/Physics/PhysicsTrench.js";
import {PhysicsBoxHouse} from 	"./Classes/Physics/PhysicsBoxHouse.js";
import {PhysicsCylinder} from 	"./Classes/Physics/PhysicsCylinder.js";
import {GLTFLoader} from "../lib/three/examples/jsm/loaders/GLTFLoader.js";

let datGUIs;
let dirLight1;
let skybox;

/**
 * Based on /del3-2020-OO from Modul 7
 */
export class RubeGoldbergApp {
	constructor() {
		this.clock = new THREE.Clock();
		this.scene = undefined;
		this.renderer = undefined;
		this.controls = undefined;
		this.currentlyPressedKeys = [];

		document.addEventListener('keyup', this.handleKeyUp.bind(this), {passive: false});
		document.addEventListener('keydown', this.handleKeyDown.bind(this), {passive: false});
		document.addEventListener('resize', this.onWindowResize.bind(this), {passive: false});

		// Stats:
		this.stats = new Stats();
		this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild( this.stats.dom );

		// Physics world:
		this.physicsWorld = new PhysicsWorld();
		this.physicsWorld.setup();

		this.physicsTube = undefined;
		this.physicsPlane = undefined;

		// Background music
		this.audio_main = undefined

		// datGUI
		this.initDatGUI()
	}

	start() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xffffff );
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
		this.camera.position.set( /*0*/150, 190, /*0*/40);

		//Add directional light
		{
			dirLight1 = new THREE.DirectionalLight( 0xffffff , 1);
			dirLight1.color.setHSL( 0.1, 1, 0.95 );
			dirLight1.position.set( 5, 10.75, 5.1 );
			dirLight1.position.multiplyScalar( 100 );
			dirLight1.castShadow = true;
			dirLight1.receiveShadow = true;
			let dLight = 500;
			let sLight = dLight;
			dirLight1.shadow.camera.left = - sLight;
			dirLight1.shadow.camera.right = sLight;
			dirLight1.shadow.camera.top = sLight;
			dirLight1.shadow.camera.bottom = - sLight;

			dirLight1.shadow.camera.near = dLight / 30;
			dirLight1.shadow.camera.far = dLight;

			dirLight1.shadow.mapSize.x = 1024 * 10;
			dirLight1.shadow.mapSize.y = 1024 * 10;

			this.scene.add( dirLight1 );
		}

		//Setup the renderer
		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		this.renderer.setClearColor( 0xbfd1e5 );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( this.renderer.domElement );

		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;

		this.renderer.shadowMap.enabled = true;

		//Koordinatsystem:
		addCoordSystem(this.scene);

		this.addControls();


		// Add objects to the scene
		this.initRubeGoldbergScene()

		// Create terrain map
		// let physicsHeightMap = new PhysicsHeightMap(this.physicsWorld, this.scene);
		// physicsHeightMap.create()

		this.animate();
	}

	initRubeGoldbergScene() {
		// Create Skybox
		skybox = new Skybox(this.physicsWorld, this.scene);
		skybox.setSkybox(5);

		// Create tube
		this.physicsTube = new PhysicsTube(this.physicsWorld, this.scene, this.camera)
		this.physicsTube.create()

		// Create a floor plane
		this.physicsPlane = new PhysicsPlane(this.physicsWorld, this.scene);
		this.physicsPlane.create(150, 500, {x:-10,y:400,z:0})

		// Add background music
		this.audio_main = _playSound('./assets/sound/OpenGameArt/song_main/S31-Going Deep.ogg', this.camera, true)

		// Create domino bricks
		this.physicsDominoEffect = new PhysicsDominoEffect(this.physicsWorld, this.scene);
		this.physicsDominoEffect.create({x:-268, y:401.01, z:0})

		// Create maze wall, remove dominoes when maze-sequence started
		this.physicsMazeWall = new PhysicsMazeWall(this.physicsWorld, this.scene, this.camera);
		this.physicsMazeWall.create({x:250, y:354, z:0})

		// Create spiral for ball to drop into
		let physicsSpiral = new PhysicsSpiral(this.physicsWorld, this.scene)
		physicsSpiral.create({x:240,y:275,z:50})

		// Create trenches
		let physicsTrench = new PhysicsTrench(this.physicsWorld, this.scene)
		physicsTrench.create({x:238, y:235, z:48},{x:0, y:-45, z:3}, true)
		physicsTrench.create({x:219, y:233, z:25},{x:0, y:-55, z:3})
		physicsTrench.create({x:206, y:231, z:2},{x:0, y:-65, z:3})
		physicsTrench.create({x:195, y:229, z:-28},{x:0, y:-75, z:3})
		physicsTrench.create({x:190, y:227, z:-58},{x:0, y:-85, z:3})
		physicsTrench.create({x:189, y:225, z:-88},{x:0, y:-90, z:3})
		physicsTrench.create({x:124, y:199, z:-93},  {x:0, y:20, z:15}, true, 130)

		// Create cylinder above heightMap
		let physicsCylinder = new PhysicsCylinder(this.physicsWorld, this.scene)
		physicsCylinder.create({x:40,y:158,z:0})

		// Create heightMap
		let physicsHeightMap = new PhysicsHeightMap(this.physicsWorld, this.scene);
		physicsHeightMap.create(50, {x:0, y:-200, z:0})
		physicsTrench.create({x:-60, y:-35, z:100}, {x:0, y:90, z:10}, true, 200)
		for (let i=0, y=-35; i<5; i++, y+=8)
			physicsTrench.create({x:-75, y:20+y, z:0}, {x:0, y:90, z:10}, true, 70)

		// Create wall of christmas boxes
		let physicsBoxHouse = new PhysicsBoxHouse(this.physicsWorld, this.scene);
		physicsBoxHouse.createBoxHouse({x:-60,y:-70,z:260});
		physicsBoxHouse.createBoxWall({x:-60,y:-70,z:260});

		// Legger til juletre
		let tempScene = this.scene;
		let loader = new GLTFLoader();
		loader.load('assets/tree.gltf', function (gltf) {
			let scale = 15
			gltf.scene.scale.set(scale, scale, scale);
			gltf.scene.rotation.y = 0;
			gltf.scene.position.set(-60,-85,285);
			gltf.scene.name = "ChristmasTree";

			for (let i=0; i< gltf.scene.children.length-4; i++) {
				gltf.scene.children[i].material.color.r *=0.01;
				gltf.scene.children[i].material.color.g *=0.01;
				gltf.scene.children[i].material.color.b *=0.01;
			}

			tempScene.add(gltf.scene);
		}, undefined, function (error) {
			console.error(error);
		});
	}

	keyCheck(elapsed) {
		if (this.physicsPlane)
			this.physicsPlane.updateMaterial(elapsed)

		if (this.physicsTube)
			this.physicsTube.keyCheck(elapsed, this.currentlyPressedKeys)

		if (this.physicsMazeWall)
			this.physicsMazeWall.update(elapsed, this.currentlyPressedKeys);

		// Run cronjob to disable domino-physics every 2 seconds
		this.physicsDominoEffect.disablePhysicsCronjob()
	}

	/**
	 * Use values from DatGUI to update world
	 */
	updateParamsFromDatGUI() {
		// Sound and lightIntensity
		dirLight1.intensity = datGUIs.lightIntensity;
		this.audio_main.setVolume(datGUIs.musicVolume)
	}

	/**
	 * Initialize the datGUI
	 * Kode for dat-gui er basert fra eksempel i DatGUIDemo1.html
	 */
	initDatGUI() {
		let datGuiMenuElements = function () {
			this.message = "Change params :)";
			this.musicVolume = 0.6;
			this.lightIntensity = 1;
		}
		datGUIs = new datGuiMenuElements();

		// Create new DATGui
		let gui = new dat.GUI({
			resizable : true,
		});

		gui.add(datGUIs, 'message');

		// Sound and lightIntensity
		gui.add(datGUIs, 'musicVolume').min(0).max(1).step(0.1);
		gui.add(datGUIs, 'lightIntensity').min(0.5).max(10).step(0.25);

		// Skybox
		let datGuiSkybox = { changeSkybox:function (){skybox.nextSkybox()}}
		let folderSkybox = gui.addFolder('Skybox');
		folderSkybox.add(datGuiSkybox, 'changeSkybox');
	}

	animate() {
		requestAnimationFrame(this.animate.bind(this));

		this.stats.begin();

		let deltaTime = this.clock.getDelta();
		this.physicsWorld.update(deltaTime);

		this.keyCheck(deltaTime);

		this.render();

		if (this.controls)
			this.controls.update();

		this.updateParamsFromDatGUI();

		this.stats.end();
	}

	addControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.addEventListener( 'change', this.render);
		this.controls.rotateSpeed = 1.0;
		this.controls.zoomSpeed = 10;
		this.controls.panSpeed = 0.8;
		this.controls.noZoom = false;
		this.controls.noPan = false;
		this.controls.staticMoving = true;
		this.controls.dynamicDampingFactor = 0.3;
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.controls.handleResize();
		this.animate();
	}

	render() {
		if (this.renderer)
			this.renderer.render(this.scene, this.camera);
	}

	handleKeyUp(event) {
		if (event.defaultPrevented) return;
		this.currentlyPressedKeys[event.code] = false;
		event.preventDefault();
	}

	handleKeyDown(event) {
		if (event.defaultPrevented) return;
		this.currentlyPressedKeys[event.code] = true;
		event.preventDefault();
	}
}