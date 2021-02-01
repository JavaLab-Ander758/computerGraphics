let camera, scene, renderer, clock, spotLight;

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
    camera.position.set( 0, 1, 1 );

    scene = new THREE.Scene();
    camera.lookAt( scene.position );

    clock = new THREE.Clock();

    //

    const geometry = new THREE.PlaneBufferGeometry();
    const material = new THREE.MeshStandardMaterial();

    const mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = - Math.PI * 0.5;
    scene.add( mesh );

    //

    const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add( ambientLight );

    spotLight = new THREE.SpotLight( 0xcccccc, 0.6 );
    spotLight.position.set( 0, 1, 0 );
    scene.add( spotLight );
    scene.add( spotLight.target ); // add target to the scene

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const controls = new THREE.OrbitControls( camera, renderer.domElement );

}

function animate() {

    requestAnimationFrame( animate );

    const time = clock.getElapsedTime();

    spotLight.target.position.x = Math.sin( time );
    spotLight.target.position.z = Math.cos( time );


    renderer.render( scene, camera );

}