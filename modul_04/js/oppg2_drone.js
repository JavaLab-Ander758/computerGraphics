import * as THREE from '../../lib/three/build/three.module.js';
import {TrackballControls} from '../../lib/three/examples/jsm/controls/TrackballControls.js';
import {CylinderGeometry, Mesh, Object3D} from "../../lib/three/build/three.module.js";

//Globale varianbler:
let renderer;
let scene;
let camera;

//rotasjoner
let angle = 0.0;
let lastTime = 0.0;

let SIZE = 2000;

// Drone
let currentlyPressedKeys = {};
let drone;
let motorStopped = true;
let engineHoldSpeed = false;
let motorSpeed = 0.0;
let motorSpeedMax = 360 * 6;
let motorSpeedStep = 4;
let droneMinPosY = 50.5;
let droneMaxPosY = 2000;
let sound;
let droneCastShadows = true;
document.addEventListener('keyup', handleKeyUp, false);
document.addEventListener('keydown', handleKeyDown, false);

let controls; //rotere, zoone hele scenen.

export function main() {
    //Henter referanse til canvaset:
    let mycanvas = document.getElementById('webgl');


    //Lager en scene:
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    //Lager et rendererobjekt (og setter st?rrelse):
    renderer = new THREE.WebGLRenderer({canvas: mycanvas, antialias: true});
    renderer.setClearColor(0xBFD1FF, 0xff);  //farge, alphaverdi.
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.soft = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

    // Lys
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.3);
    ambientLight.castShadow = true
    scene.add(ambientLight);

    // Spotlight left
    let intensity = 1, distance = 2000, angle = degToRad(45), penumbra = 0.1, decay = 0.9;
    let x = 600, y = 500, z = 400;
    {
        const spotLightLeft = new THREE.SpotLight(0xffffff, intensity, distance, angle, penumbra, decay);
        spotLightLeft.position.set(x, y, z);

        spotLightLeft.castShadow = true;

        spotLightLeft.shadow.mapSize.width = 1024;
        spotLightLeft.shadow.mapSize.height = 1024;

        spotLightLeft.shadow.camera.near = 500;
        spotLightLeft.shadow.camera.far = 4000;
        spotLightLeft.shadow.camera.fov = 30;
        spotLightLeft.target = drone;
        scene.add(spotLightLeft);
    }
    // Spotlight right
    {
        const spotLightRight = new THREE.SpotLight(0xffffff, intensity, distance, angle, penumbra, decay);
        spotLightRight.position.set(x, y, -z);

        spotLightRight.castShadow = true;

        spotLightRight.shadow.mapSize.width = 1024;
        spotLightRight.shadow.mapSize.height = 1024;

        spotLightRight.shadow.camera.near = 500;
        spotLightRight.shadow.camera.far = 4000;
        spotLightRight.shadow.camera.fov = 30;
        spotLightRight.target = drone;
        scene.add(spotLightRight);
    }
    // Spotlight front
    {
        const spotLightFront = new THREE.SpotLight(0xffffff, intensity, distance, degToRad(5), penumbra, decay);
        spotLightFront.position.set(1500, 800, 0);

        spotLightFront.castShadow = true;

        spotLightFront.shadow.mapSize.width = 1024;
        spotLightFront.shadow.mapSize.height = 1024;

        spotLightFront.shadow.camera.near = 500;
        spotLightFront.shadow.camera.far = 4000;
        spotLightFront.shadow.camera.fov = 30;
        spotLightFront.target = drone;
        scene.add(spotLightFront);
    }

    controls = new TrackballControls(camera, renderer.domElement);
    controls.addEventListener('change', render);

    //H?ndterer endring av vindusst?rrelse:
    window.addEventListener('resize', onWindowResize, false);

    // Alert user of controls
    alert("Kontroller:\n\n" +
        "Start motor / land - A\n" +
        "Hastighet opp - Hold inne W\n" +
        "Stop motor - Klikk Q\n" +
        "Beveg kamera - Klikk og dra musa og zoom med scroll-hjul");

    animate();
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function addModels() {
    // XZ-plan
    let grass = geoTextureLoader(new THREE.PlaneGeometry(SIZE*4, SIZE*4),
        'images/drone/grass.png');
    grass.rotation.x = Math.PI / 2;
    grass.receiveShadow = true;
    scene.add(grass);

    // Grid
    scene.add(new THREE.GridHelper(SIZE * 2, 10));

    // Coord
    scene.add(new THREE.AxesHelper(SIZE * 10));

    // Drone
    drone = getDrone();
    scene.add(drone);
    setDroneSound();

    /**
     * https://threejs.org/docs/#api/en/audio/Audio
     * https://freesound.org/people/simeonradivoev/sounds/383852/
     */
    function setDroneSound() {
        // create an AudioListener and add it to the camera
        var listener = new THREE.AudioListener();
        camera.add(listener);
        // create a global audio source
        sound = new THREE.Audio(listener);
        // load a sound and set it as the Audio object's buffer
        var audioLoader = new THREE.AudioLoader();
        audioLoader.load('images/drone/Mini Quadcopter Flying Loop.mp3', function (buffer) {
            sound.setBuffer(buffer);
            sound.setLoop(true);
            sound.setVolume(0);
            sound.play();
        });
    }
}

function getDrone() {
    let droneToReturn = new THREE.Object3D();
    droneToReturn.castShadow = droneCastShadows;

    let mDrone = new THREE.MeshPhongMaterial({color: 0xddd4c9, side: THREE.DoubleSide});
    let resDrone = 20;

    // Body
    let body = new THREE.Mesh(createBoxWithRoundedEdges(90, 50, 20, 6, 3), mDrone);
    body.rotation.set(degToRad(90), 0, 0);
    body.castShadow = droneCastShadows;
    droneToReturn.add(body);

    // PCB
    let PCB = geoTextureLoader(new THREE.BoxGeometry(75, 2, 35), 'images/drone/pcb.jpg')  // https://www.myfreetextures.com/wp-content/uploads/2014/10/2010-04-26-07277.jpg
    PCB.position.y = 10;
    PCB.castShadow = droneCastShadows;
    droneToReturn.add(PCB)

    // Camera
    let gCameraYaw = new THREE.CylinderGeometry(2, 2, 10, resDrone);
    let cameraYaw = new THREE.Mesh(gCameraYaw, new THREE.MeshPhongMaterial({color: 0x000000}));
    cameraYaw.position.set(0, -15, 0)
    cameraYaw.castShadow = droneCastShadows;
    droneToReturn.add(cameraYaw)

    let cameraHousing = new THREE.Mesh(createBoxWithRoundedEdges(25, 25, 25, 6, 6), new THREE.MeshPhongMaterial({color: 0x00000}));
    cameraHousing.position.set(0, -15 - (25 / 2), 0)
    cameraHousing.castShadow = droneCastShadows;
    droneToReturn.add(cameraHousing)

    let cameraLens = geoTextureLoader(
        new THREE.CylinderGeometry(8, 8, 3, resDrone), 'images/drone/camera_lens.png') // https://opengameart.org/content/camera-lens
    cameraLens.position.set(25 / 2, -15 - (25 / 2), 0);
    cameraLens.rotation.set(degToRad(90), 0, degToRad(90))
    droneToReturn.add(cameraLens);

    // Arms
    let arm1 = getArm(1);
    arm1.castShadow = droneCastShadows;
    droneToReturn.add(arm1);
    let arm2 = getArm(2);
    arm2.castShadow = droneCastShadows;
    droneToReturn.add(arm2);
    let arm3 = getArm(3);
    arm3.castShadow = droneCastShadows;
    droneToReturn.add(arm3);
    let arm4 = getArm(4);
    arm4.castShadow = droneCastShadows;
    droneToReturn.add(arm4);

    droneToReturn.position.y = 90;

    droneToReturn.castShadow = true;
    droneToReturn.receiveShadow = true;
    return droneToReturn;


    /**
     * @param quadrant
     *   1--3
     *   |  |
     *   2--4
     */
    function getArm(quadrant) {
        let arm = new THREE.Object3D();
        arm.castShadow = droneCastShadows;

        let armDeg = 0;
        switch (quadrant) {
            case 1:
                armDeg = 45;
                break;
            case 2:
                armDeg = 45 + 90;
                break;
            case 3:
                armDeg = -45;
                break;
            case 4:
                armDeg = -45 - 90;
        }
        let armRectangle = geoColorLoader(new THREE.BoxGeometry(80, 5, 20), 0x8B0000);
        armRectangle.castShadow = droneCastShadows;
        armRectangle.translateY(-2.5);
        armRectangle.translateX(80 / 2)
        arm.add(armRectangle);

        let armOuterCylinder = geoColorLoader(new THREE.CylinderGeometry(10, 10, 5, 30), 0x8B0000)
        armOuterCylinder.castShadow = droneCastShadows;
        armOuterCylinder.translateY(-2.5)
        arm.add(armOuterCylinder);

        let armMotor = getMotor()
        arm.add(armMotor)

        arm.rotation.set(0, degToRad(armDeg), 0);
        arm.translateX(-100);
        arm.translateZ(quadrant === 1 || quadrant === 4 ? -5 : 5);

        let legHeight = 50, legRadius = 2.5;
        let leg = geoColorLoader(new CylinderGeometry(legRadius, legRadius, legHeight, 30), 0xFF6347)
        leg.castShadow = droneCastShadows;
        leg.position.set(10, -legHeight / 2, 0);
        leg.rotation.set(0, 0, degToRad(30))
        arm.add(leg);

        return arm;

        function getMotor() {
            let motor = new THREE.Object3D();
            motor.castShadow = droneCastShadows;

            let pointsPropellerMount = [];
            for (let x = 0; x < 1; x = x + 0.01) {
                let y = Math.pow(x, 2) * 2;
                pointsPropellerMount.push(new THREE.Vector2(x, y));
            }
            let propellerMount = geoTextureLoader(
                new THREE.LatheGeometry(pointsPropellerMount, resDrone, Math.PI, 0),
                'images/drone/Metal (Frying Pan).jpg'); // https://opengameart.org/content/metal-from-frying-pan
            propellerMount.rotation.set(0, 0, degToRad(180));
            propellerMount.scale.set(40, 40, 40);
            motor.add(propellerMount);

            let propeller = getPropeller()
            propeller.name = 'propeller' + quadrant;
            motor.add(propeller);

            motor.scale.set(0.1, 0.1, 0.1)
            motor.position.set(0, 0.1 / 0.0125, 0);

            let brushLessShroud = getBrushlessShroud();
            motor.add(brushLessShroud);

            motor.position.set(0, 22.8, 0)
            return motor;

            function getPropeller() {
                let tProp = new THREE.TextureLoader().load('images/drone/wood1.jpg'); // https://opengameart.org/content/wood-texture-tiles
                let mProp = new THREE.MeshPhongMaterial({map: tProp, side: THREE.DoubleSide});

                let propeller = new THREE.Object3D();
                propeller.castShadow = droneCastShadows;

                let propellerRight = new THREE.Object3D();
                propellerRight.castShadow = droneCastShadows;

                let propSize = 40, propHeight = propSize / 8;
                let gPropellerEnd = new THREE.CylinderGeometry(propSize / 2, propSize / 2, propHeight * 0.8, resDrone);
                let propellerEnd = new THREE.Mesh(gPropellerEnd, mProp);
                propellerRight.add(propellerEnd);
                let gPropellerBox = new THREE.BoxGeometry(propSize, propSize * 3, propHeight);
                let propellerBox = new THREE.Mesh(gPropellerBox, mProp);
                propellerBox.castShadow = droneCastShadows;
                propellerBox.position.set(0, 0, propSize * 2 - (propSize / 2));
                propellerBox.rotation.set(degToRad(90), 0, 0);
                propellerRight.position.set(0, -40, -propSize * 3);
                propellerRight.rotation.set(0, 0, degToRad(quadrant === 1 || quadrant === 4 ? 25 : -25));
                propellerRight.add(propellerBox);
                let propellerLeft = propellerRight.clone();
                propeller.add(propellerRight);

                propellerLeft.rotation.set(0, degToRad(180), degToRad(quadrant === 1 || quadrant === 4 ? 25 : -25));
                propellerLeft.position.set(0, -40, propSize * 3)
                propeller.add(propellerLeft);

                propeller.scale.set(1, 1, 1.8)
                return propeller;
            }

            function getBrushlessShroud() {
                let shroud = new THREE.Object3D();
                shroud.castShadow = droneCastShadows;

                let propMount = geoColorLoader(new THREE.CylinderGeometry(15, 15, 60, 30, 30), 0x000000);
                propMount.castShadow = droneCastShadows;
                propMount.position.set(0, -90, 0);
                shroud.add(propMount);

                let motorHousing = geoTextureLoader(new THREE.CylinderGeometry(80, 80, 120, 30, 30, true), 'images/drone/trak2_plate2b.png'); // https://opengameart.org/content/metal-plate
                motorHousing.castShadow = droneCastShadows;
                motorHousing.position.set(0, -90 - 80, 0);
                shroud.add(motorHousing);

                let copperWiring = geoTextureLoader(new THREE.CircleGeometry(77, 30), 'images/drone/copper.png'); // https://i.ytimg.com/vi/AimKJTIOqkU/maxresdefault.jpg
                copperWiring.castShadow = droneCastShadows;
                copperWiring.rotation.set(degToRad(-90), 0, 0)
                copperWiring.position.set(0, -115, 0);
                copperWiring.name = 'copperCoilWhine' + quadrant;
                shroud.add(copperWiring);

                // Copper bars
                {
                    let copperBar1 = geoColorLoader(new THREE.BoxGeometry(20, 105), 0xfffff)
                    copperBar1.castShadow = droneCastShadows;
                    copperBar1.rotation.set(degToRad(90 + 30), 0, 0);
                    copperBar1.position.set(0, -87, +33)
                    shroud.add(copperBar1);

                    let copperBar2 = copperBar1.clone();
                    copperBar2.position.set(0, -87, -33)
                    copperBar2.rotation.set(degToRad(-90 - 30), 0, 0);
                    shroud.add(copperBar2);

                    let copperBar3 = copperBar1.clone()
                    copperBar3.position.set(33, -87, 0)
                    copperBar3.rotation.set(degToRad(90), degToRad(-30), degToRad(90))
                    shroud.add(copperBar3);

                    let copperBar4 = copperBar1.clone()
                    copperBar4.position.set(-33, -87, 0)
                    copperBar4.rotation.set(degToRad(90), degToRad(30), degToRad(90))
                    shroud.add(copperBar4);
                }

                return shroud;
            }
        }
    }

    /**
     * https://discourse.threejs.org/t/round-edged-box/1402
     */
    function createBoxWithRoundedEdges(width, height, depth, radius0, smoothness) {
        let shape = new THREE.Shape();
        let eps = 0.00001;
        let radius = radius0 - eps;
        shape.absarc(eps, eps, eps, -Math.PI / 2, -Math.PI, true);
        shape.absarc(eps, height - radius * 2, eps, Math.PI, Math.PI / 2, true);
        shape.absarc(width - radius * 2, height - radius * 2, eps, Math.PI / 2, 0, true);
        shape.absarc(width - radius * 2, eps, eps, 0, -Math.PI / 2, true);
        let geometry = new THREE.ExtrudeBufferGeometry(shape, {
            depth: depth - radius0 * 2,
            bevelEnabled: true,
            bevelSegments: smoothness * 2,
            steps: 1,
            bevelSize: radius,
            bevelThickness: radius0,
            curveSegments: smoothness
        });
        geometry.center();

        return geometry;
    }
}

function geoTextureLoader(geometry, path) {
    let textureLoader = new THREE.TextureLoader().load(path);
    let meshPhongMaterial = new THREE.MeshPhongMaterial({map: textureLoader, side: THREE.DoubleSide});
    return new Mesh(geometry, meshPhongMaterial)
}

function geoColorLoader(geo, hexacode) {
    return new THREE.Mesh(geo, new THREE.MeshPhongMaterial({color: hexacode}));
}

function animate(currentTime) {
    requestAnimationFrame(animate);

    if (currentTime === undefined)
        currentTime = 0; //Udefinert f?rste gang.

    let elapsed = 0.0; 			// Forl?pt tid siden siste kall p? draw().
    if (lastTime !== 0.0) 		// F?rst gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime) / 1000; //Opererer med sekunder.

    lastTime = currentTime;
    // F?lgende gir 60 graders rotasjon per sekund og 6 sekunder for en hel rotasjon:
    let rotationSpeed = degToRad(motorSpeed); // Bestemmer rotasjonshastighet.
    angle = angle + (rotationSpeed * elapsed);
    angle %= (Math.PI * 2); // "Rull rundt" dersom angle >= 360 grader.

    //Oppdater trackball-kontrollen:
    controls.update();

    // Sjekk input
    keyCheck();

    // Roterer propeller
    let rotor1 = drone.getObjectByName("propeller1", true);
    let rotor2 = drone.getObjectByName("propeller2", true);
    let rotor3 = drone.getObjectByName("propeller3", true);
    let rotor4 = drone.getObjectByName("propeller4", true);
    let copperWireCoil1 = drone.getObjectByName("copperCoilWhine1", true)
    let copperWireCoil2 = drone.getObjectByName("copperCoilWhine2", true)
    let copperWireCoil3 = drone.getObjectByName("copperCoilWhine3", true)
    let copperWireCoil4 = drone.getObjectByName("copperCoilWhine4", true)
    if ((rotor1 && rotor2 && rotor3 && rotor4 && copperWireCoil1 && copperWireCoil2 && copperWireCoil3 && copperWireCoil4) !== undefined) {
        rotor1.rotation.y = -angle;
        copperWireCoil1.rotation.z = -angle;
        rotor2.rotation.y = angle;
        copperWireCoil2.rotation.z = angle;
        rotor3.rotation.y = angle;
        copperWireCoil3.rotation.z = angle;
        rotor4.rotation.y = -angle;
        copperWireCoil4.rotation.z = -angle;
    } else
        console.log("undefined motor part!")

    // Sett lydvolum på motor
    let volume = (1 - (motorSpeed / motorSpeedMax) * 100) / 100
    if (motorStopped)
        volume = 0
    sound.setVolume(volume / 6)

    //Tegner scenen med gitt kamera:
    render();
}

function keyCheck() {
    /**
     * Stop motor
     */
    if (currentlyPressedKeys[81]) { // Q
        motorStopped = true;
        motorSpeed = 0.0;
        engineHoldSpeed = false;
    }

    /**
     * Start engine / hold altitude
     */
    if (currentlyPressedKeys[65]) { // A
        engineHoldSpeed = true;
        motorStopped = false;
    }
    if (engineHoldSpeed) {
        if (motorSpeed <= motorSpeedMax/6)
            motorSpeed += motorSpeedStep;
    }

    /**
     * Øk motorhastighet
     */
    let posY = drone.position.y;
    if (currentlyPressedKeys[87]) { // W
        engineHoldSpeed = false;
        motorStopped = false;
        if (motorSpeed <= motorSpeedMax) {
            motorSpeed += motorSpeedStep;
            if (posY < droneMaxPosY)
                if (motorSpeed > motorSpeedMax / 2)
                    drone.translateY(motorSpeed / 500)
        }
    } else if (!engineHoldSpeed){
        if (motorSpeed > 0 && !motorStopped) {
            motorSpeed -= motorSpeedStep;
        }
        if (posY >= droneMinPosY && posY <= droneMaxPosY) {
            if (motorStopped)
                drone.translateY(-10);
            else
                drone.translateY(-motorSpeed / 500)
        }
    }
}


function render() {
    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    controls.handleResize();
    render();
}

function degToRad(degree) {
    return (degree) * (Math.PI / 180);
}