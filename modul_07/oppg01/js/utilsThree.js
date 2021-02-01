import * as THREE from '../../../../lib/three/build/three.module.js';


/**
 * Returnerer et rendererobjekt (og setter størrelse)
 */
export function getRenderer(_mycanvas) {
    let renderer = new THREE.WebGLRenderer({canvas:_mycanvas, antialias:true});
    renderer.setClearColor(0xBFD104, 0xff);  //farge, alphaverdi.
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; //NB!
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;
    return renderer;
}

export function getCamera() {
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.x = 130;
    camera.position.y = 200;
    camera.position.z = 150;
    camera.up = new THREE.Vector3(0, 1, 0);
    let target = new THREE.Vector3(0.0, 0.0, 0.0);
    camera.lookAt(target);
    return camera;
}

export function getSpotLight() {
    let spotLight = new THREE.SpotLight(0xffffff, 0.5); //hvitt lys
    spotLight.position.set( 1000, 3000, 2000 );
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.near = 200;
    spotLight.shadow.camera.far = 3500;
    return spotLight
}

export function getPointLight() {
    let pointLight = new THREE.PointLight( 0xffffff, 1, 2000 );
    pointLight.position.set( 0, 700, 0 );
    return pointLight;
}
