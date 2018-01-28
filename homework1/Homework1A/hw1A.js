/* Jennifer Fullerton
 * CMPM 163, Homework1 Pt. A
 * "hw1A.js"
 * main functionality for HW1A
 * based on "w1_phongShader.html", "w2_texture.html" from class
 */


// --- GLOBAL VARIABLES --- //
var container;
var camera, scene, renderer;

// geometry objects
var mesh1, mesh2, mesh3, mesh;
var material;
var texture1;


// --- FUNCTIONS --- //

/* init()
initializes the scene, camera, lights, and geometry
*/
function init() {

	container = document.getElementById( 'container' );

	camera = new THREE.PerspectiveCamera( 60.0, window.innerWidth / window.innerHeight, 0.1, 50 );
	camera.position.z = 5;

	scene = new THREE.Scene();


    // lights
    var ambient = new THREE.Vector3(0.1,0.1,0.1);

	var light1_pos = new THREE.Vector3(0.0,10.0,0.0); //from above
	var light1_diffuse = new THREE.Vector3(1.0,0.0,0.0);
	//var light1_specular = new THREE.Vector3(1.0,0.0,1.0); // fun specular
	var light1_specular = new THREE.Vector3(1.0,1.0,1.0);

	var light2_pos = new THREE.Vector3(-10.0,0.0,2.0); //from the left
	var light2_diffuse = new THREE.Vector3(0.0,0.0,1.0);
	//var light2_specular = new THREE.Vector3(0.0,1.0,1.0); // fun specular
	var light2_specular = new THREE.Vector3(1.0,1.0,1.0);

	var light3_pos = new THREE.Vector3(2.5,-10.0,-2.5); //from bottom right
	var light3_diffuse = new THREE.Vector3(0.0,1.0,0.0);
	//var light3_specular = new THREE.Vector3(1.0,1.0,0.5); // fun specular
	var light3_specular = new THREE.Vector3(1.0,1.0,1.0);

	// geometry
	var geometry1 = new THREE.SphereGeometry( 1, 64, 64 );
    var geometry2 = new THREE.BoxGeometry( 1, 1, 1 );
    var geometry3 = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );

	// materials (ie, linking to the shader program)
    var uniforms =  {
		ambient: { type: "v3", value: ambient },
		light1_pos: { type: "v3", value: light1_pos },
		light1_diffuse: { type: "v3", value: light1_diffuse },
		light1_specular:  { type: "v3", value: light1_specular },
		light2_pos: { type: "v3", value: light2_pos },
		light2_diffuse: { type: "v3", value: light2_diffuse },
		light2_specular:  { type: "v3", value: light2_specular },
		light3_pos: { type: "v3", value: light3_pos },
		light3_diffuse: { type: "v3", value: light3_diffuse },
		light3_specular:  { type: "v3", value: light3_specular },
	};

 	material = new THREE.RawShaderMaterial( {
		uniforms: uniforms,
		vertexShader: vs_ph,
		fragmentShader: fs_ph,	
	} );

	mesh1 = new THREE.Mesh( geometry1, material );
	mesh1.translateX(-2.5);
    scene.add( mesh1 );

    mesh2 = new THREE.Mesh( geometry2, material );
	mesh2.translateX(0.0);
    scene.add( mesh2 );

    mesh3 = new THREE.Mesh( geometry3, material );
	mesh3.translateX(2.5);
	mesh3.scale.set(0.05, 0.05, 0.05);
    scene.add( mesh3 );

    texture1 = createDataTexture();
    var loader = new THREE.JSONLoader();
	loader.load( 'dragon.js', processBlenderObject );

	renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x999999 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	container.appendChild( renderer.domElement );


	//make it so that resizing the browser window also resizes the scene
    window.addEventListener( 'resize', onWindowResize, false );
}

			
/* animate()
animates the different objects
*/
function animate() {

	requestAnimationFrame( animate );
	render();

}

/* render()
render objects to the screen
*/
function render() {

	var time = performance.now();

	mesh2.rotation.x = time * 0.00005;
	mesh2.rotation.y = time * 0.0005;

	//if I want to update the lights, I acutally have to update the material used by each object in the scene. 
	//material.uniforms.light1_diffuse.value = new THREE.Vector3(0.0,1.0,0.0);

	renderer.render( scene, camera );
}

/* onWindowResize()
if the window is resized, adjust the scene rendering so
that everything is still in view
*/
function onWindowResize( event ) {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}


/* processBlenderObject
from class example "loadJSONObjectAndAddTexture.html"
loads a blender object saved as a JSON
*/
function processBlenderObject (geometry, materials) {

	//var useGeometry = new THREE.BufferGeometry().fromGeometry( geometry );
	var useGeometry = geometry;


	var uniforms = { t1: { type: "t", value: texture1  }};

	var material = new THREE.RawShaderMaterial( {
		uniforms: uniforms,
		vertexShader: vs_tx,
		fragmentShader: fs_tx,	
	} );


	mesh = new THREE.Mesh( useGeometry, material );


	//positioning and scaling blender obj so that it's in the center of the screen
	mesh.position.set( 0, -1.5, 0 );
	var s = 1.0;
	mesh.scale.set( s, s, s );
	mesh.rotation.y = -Math.PI / 4;

	scene.add( mesh );
}

function createDataTexture() {

	// create a buffer with color data

	var resX = 25;
	var resY = 25;

	var size = resX * resY;
	var data = new Uint8Array( 4 * size );

	for ( var i = 0; i < size; i++ ) {
		var stride = i * 4;

		data[ stride ] = Math.random() * 255;
		data[ stride + 1 ] = Math.random() * 255;;
		data[ stride + 2 ] = Math.random() * 255;;
		data[ stride + 3 ] = 255;
	}

	var texture = new THREE.DataTexture( data, resX, resY, THREE.RGBAFormat );
	texture.needsUpdate = true; // just a weird thing that Three.js wants you to do after you set the data for the texture

	return texture;
}
