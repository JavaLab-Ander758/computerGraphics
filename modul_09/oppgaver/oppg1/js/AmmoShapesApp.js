import * as THREE from "../../../../lib/three/build/three.module.js";
import { TrackballControls } from '../../../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem} from "../../../../lib/three/wfa-coord.js";
import Stats from '../../../../lib/three/examples/jsm/libs/stats.module.js';
import {PhysicsSphere} from "./Physics/PhysicsSphere.js";
import {PhysicsWorld} from "./PhysicsWorld.js";
import * as dat from "../../../../lib/three/datgui/build/dat.gui.module.js";

let datGUIs;
let dirLight1;

/**
 * Based on /del3-2020-OO from Modul 7
 */
export class AmmoShapesApp {
	constructor() {
		this.clock = new THREE.Clock();
		this.scene = undefined;
		this.renderer = undefined;
		this.controls = undefined;
		this.currentlyPressedKeys = [];
		//NB! Legg merke til .bind(this)
		document.addEventListener('keyup', this.handleKeyUp.bind(this), {passive: false});
		document.addEventListener('keydown', this.handleKeyDown.bind(this), {passive: false});
		//Håndterer endring av vindusstørrelse:
		document.addEventListener('resize', this.onWindowResize.bind(this), {passive: false});

		// Stats:
		this.stats = new Stats();
		this.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
		document.body.appendChild( this.stats.dom );

		// Physics world:
		this.physicsWorld = new PhysicsWorld();
		let gravitationalAcceleration = -150; // Setter høy verdi for mer realistisk fysikk på ballen slik det er i virkeligheten
		this.physicsWorld.setup(gravitationalAcceleration);

		this.physicsMazeTerrain = undefined;
		this.physicsSphere = undefined;

		// datGUI
		initDatGUI()
	}

	start() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xffffff );
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
		this.camera.position.set( /*0*/5, 5, /*0*/5);
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		// Zoom out if browser allows it
		window.parent.document.body.style.zoom = 0.9

		//Add directional light
		dirLight1 = new THREE.DirectionalLight( 0xffffff , 1);
		dirLight1.color.setHSL( 0.1, 1, 0.95 );
		dirLight1.position.set( 5, 10.75, 5.1 );
		dirLight1.position.multiplyScalar( 100 );
		dirLight1.castShadow = true;
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

		// this.physicsMazeTerrain = new PhysicsLabyrinth(this.physicsWorld, this.scene, this.camera);
		// this.physicsMazeTerrain.create();
		this.physicsSphere = new PhysicsSphere(this.physicsWorld, this.scene)
		this.physicsSphere.create(1, {x:0, y:0, z:0}, undefined, 0)

		this.animate();
	}

	animate() {
		requestAnimationFrame(this.animate.bind(this)); //Merk bind()

		this.stats.begin();

		let deltaTime = this.clock.getDelta();
		this.physicsWorld.update(deltaTime);

		//Sjekker input:
		this.keyCheck(deltaTime);

		//Tegner scenen med gitt kamera:
		this.render();

		//Oppdater trackball-kontrollen:
		if (this.controls)
			this.controls.update();

		// Oppdater parametre fra datGUI
		dirLight1.intensity = datGUIs.lightIntensity;

		this.stats.end();
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
		this.currentlyPressedKeys[event.keyCode] = false;
	}

	handleKeyDown(event) {
		this.currentlyPressedKeys[event.keyCode] = true;
	}

	keyCheck(elapsed) {
		if (this.physicsMazeTerrain)
			this.physicsMazeTerrain.keyCheck(elapsed, this.currentlyPressedKeys);
	}

	//Legger til roter/zoom av scenen:
	addControls() {
		this.controls = new TrackballControls(this.camera, this.renderer.domElement);
		this.controls.addEventListener( 'change', this.render);
		this.controls.rotateSpeed = 1.0;
		this.controls.zoomSpeed = 10;
		this.controls.panSpeed = 0.8;
		this.controls.noZoom = false;
		this.controls.noPan = false;
		this.controls.staticMoving = true;
		this.controls.dynamicDampingFactor = 0.3;
	}
}

/**
 * Initialize the datGUI
 * Kode for dat-gui er basert fra eksempel i DatGUIDemo1.html
 */
function initDatGUI() {
	let datGuiMenuElements = function () {
		this.message = "Change params :)";
		this.lightIntensity = 1;
	}
	datGUIs = new datGuiMenuElements();  //Instansierer

	// Oppretter en dat.GUI(): Legger menyelementene inn i datGUIs:
	let gui = new dat.GUI({
		resizable : true,
	});
	gui.add(datGUIs, 'message');
	gui.add(datGUIs, 'lightIntensity', 0.5, 10);
}