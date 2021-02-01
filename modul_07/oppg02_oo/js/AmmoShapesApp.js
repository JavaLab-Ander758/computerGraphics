import * as THREE from "../../../../lib/three/build/three.module.js";
import { TrackballControls } from '../../../../lib/three/examples/jsm/controls/TrackballControls.js';
import { addCoordSystem} from "../../../../lib/three/wfa-coord.js";
import Stats from '../../../../lib/three/examples/jsm/libs/stats.module.js';
import {PhysicsTerrain} from "./PhysicsTerrain.js";
import {PhysicsBox} from "./PhysicsBox.js";
import {PhysicsWorld} from "./PhysicsWorld.js";
import {PhysicsHinge} from "./PhysicsHinge.js";
import * as dat from "../../../../lib/three/datgui/build/dat.gui.module.js";

let datGUIs;

/**
 * Objektorientert tankegang basert på /del3-2020-OOg
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
		this.physicsWorld.setup();

		this.physicsTerrain = undefined;
		this.physicsBox = undefined;
		this.physicsSphere = undefined;
		this.physicsHingeLeft = undefined;
		this.physicsHingeRight = undefined;

		// datGUI
		initDatGUI()
	}

	start() {
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0xffffff );
		this.camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.2, 5000 );
		this.camera.position.set( 15, 30, 50 );
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));

		//Add directional light
		let dirLight1 = new THREE.DirectionalLight( 0xffffff , 1);
		dirLight1.color.setHSL( 0.1, 1, 0.95 );
		dirLight1.position.set( 5, 1.75, 5.1 );
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

		dirLight1.shadow.mapSize.x = 1024 * 2;
		dirLight1.shadow.mapSize.y = 1024 * 2;

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

		this.physicsTerrain = new PhysicsTerrain(this.physicsWorld, this.scene);
		this.physicsTerrain.create();

		this.physicsBox = new PhysicsBox(this.physicsWorld, this.scene);
		this.physicsBox.create(undefined, {x:0, y:5, z:25}, undefined, 20, {width: 4, height: 4, depth: 4});

		let hingeDoorWidth = 10;
		let hingeDoorOriginPosY = 8;
		this.physicsHingeRight = new PhysicsHinge(this.physicsWorld, this.scene);
		this.physicsHingeRight.create({x:hingeDoorWidth, y:hingeDoorOriginPosY, z:0});
		this.physicsHingeLeft = new PhysicsHinge(this.physicsWorld, this.scene);
		this.physicsHingeLeft.create({x:-hingeDoorWidth, y:hingeDoorOriginPosY, z:0});



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

		// Sett parametre på PhysicsHinge fra datGUI
		for (let hingeArr = [this.physicsHingeLeft, this.physicsHingeRight], i = 0; i < hingeArr.length; i++) {
			hingeArr[i].updateHingeConstraint(
				datGUIs.hingeConstraint_maxHingeRot * Math.PI / 180,
				// Math.PI / datGUIs.hingeConstraint_maxHingePivot,
				datGUIs.softness,
				datGUIs.biasFactor,
				datGUIs.relaxationFactor);
			hingeArr[i].IMPULSE_FORCE_STICK = datGUIs.forceOnStickViaKeyboard;
		}


		this.stats.end();
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.controls.handleResize();
		this.animate();
	}

	render()
	{
		if (this.renderer)
			this.renderer.render(this.scene, this.camera);
	}

	handleKeyUp(event) {
		this.currentlyPressedKeys[event.keyCode] = false;
	}

	handleKeyDown(event) {
		//console.log(event);
		this.currentlyPressedKeys[event.keyCode] = true;
	}

	keyCheck(elapsed) {
		if (this.physicsBox)
			this.physicsBox.keyCheck(elapsed, this.currentlyPressedKeys);

		if (this.physicsSphere)
			this.physicsSphere.keyCheck(elapsed, this.currentlyPressedKeys);

		if (this.physicsTerrain)
			this.physicsTerrain.keyCheck(elapsed, this.currentlyPressedKeys);

		if (this.physicsHingeLeft)
			this.physicsHingeLeft.keyCheck(elapsed, this.currentlyPressedKeys);

		if (this.physicsHingeRight)
			this.physicsHingeRight.keyCheck(elapsed, this.currentlyPressedKeys);
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
 * Kode for dat-gui er basert fra Werners eksempel i DatGUIDemo1.html
 */
function initDatGUI() {
	let datGuiMenuElements = function () {
		this.message = "Velg parametre for PhysicsHinge";
		this.hingeConstraint_maxHingeRot = 75;
		this.hingeConstraint_softness = 0.9;
		this.hingeConstraint_biasFactor = 0.3;
		this.hingeConstraint_relaxationFactor = 1.0;
		this.forceOnStickViaKeyboard = 5;
	}
	datGUIs = new datGuiMenuElements();  //Instansierer

	// Oppretter en dat.GUI(): Legger menyelementene inn i datGUIs:
	let gui = new dat.GUI({
		resizable : true,
		width : 500,
		color : 0xffffff
	});
	gui.add(datGUIs, 'message');
	gui.add(datGUIs, 'hingeConstraint_maxHingeRot', 0, 170);
	gui.add(datGUIs, 'hingeConstraint_softness', 0, 5);
	gui.add(datGUIs, 'hingeConstraint_biasFactor', 0, 5);
	gui.add(datGUIs, 'hingeConstraint_relaxationFactor', 0, 5);
	gui.add(datGUIs, 'forceOnStickViaKeyboard', 0.1, 10);
}