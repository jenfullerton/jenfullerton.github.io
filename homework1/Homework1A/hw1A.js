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
var mesh1, mesh2, mesh3;
var material, material2;
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


    // lights - phong shader
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
    //var geometry3 = new THREE.TorusKnotGeometry( 10, 3, 100, 16 );
    var geometry3 = new THREE.IcosahedronGeometry();


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

	// phong shader material
 	material = new THREE.RawShaderMaterial( {
		uniforms: uniforms,
		vertexShader: vs_ph,
		fragmentShader: fs_ph,	
	} );

	mesh1 = new THREE.Mesh( geometry1, material );
	mesh1.translateX(-2.5);
    scene.add( mesh1 );

	// texture stuff - mesh2
	texture1 = new THREE.TextureLoader().load( 'blueWave.png' );
	createTextureObject();

	mesh3 = new THREE.Mesh( geometry3, material );
	mesh3.translateX(2.5);
    scene.add( mesh3 );

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

	// mesh1 doing some slow circles
	mesh1.translateX(Math.cos(time*0.001)*0.005);
	mesh1.translateZ(Math.sin(time*0.001)*0.005);

	// mesh 2 rolling in space
	//mesh2.rotation.x = time * 0.0005;
	mesh2.rotation.y = time * 0.0005;

	// sin() generally controls cycle frequence
	// outer number generally controls how big the loop is
	// mesh 3 is having fun
	mesh3.translateY(Math.sin(time*0.005)*0.01);
	mesh3.rotation.z = time * 0.0005;

	// FUN LIGHTS!
	// light slowly increses over time, then drops back to black
	//var lightVariance = ((time * 0.05)%255)/255;
	// light slowly fluctuates between maximum brightness and darkness
	//var lightVariance = Math.sin(time*0.001)

	//if I want to update the lights, I acutally have to update the material used by each object in the scene. 
	//material.uniforms.light1_diffuse.value = new THREE.Vector3(lightVariance, 0.0,0.0);
	var lightPosAdjust = Math.sin(time*0.005)*5;
	// light1_pos = 0.0, 10.0, 0.0
	material.uniforms.light1_pos.value = new THREE.Vector3(lightPosAdjust, 10.0, 0.0);
	// light2_pos = -10.0,0.0,2.0
	material.uniforms.light2_pos.value = new THREE.Vector3(-10.0, -lightPosAdjust, 2.0);
	// light3_pos = 2.5,-10.0,-2.5
	material.uniforms.light3_pos.value = new THREE.Vector3(-2.5+lightPosAdjust/2, -10.0, -2.5+lightPosAdjust);



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


/* createTextureObject()
loads a texture and adds it to a mesh, then adds that to
the scene
*/
function createTextureObject() {
	
		var geometry = new THREE.BufferGeometry();

		var vertices = new Float32Array( [
			-1.0, -1.0, 0.0,
			+1.0, -1.0, 0.0,
			+1.0, +1.0, 0.0,
	 
			-1.0, -1.0, 0.0,
			+1.0, +1.0, 0.0,
			-1.0, +1.0, 0.0,

		] );

		var texCoords = new Float32Array( [
			0.0, 0.0,
			1.0, 0.0,
			1.0, 1.0,
			
			0.0, 0.0,
			1.0, 1.0,
			0.0, 1.0,
		] );



		// itemSize = 3 because there are 3 values (components) per vertex
		geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
		geometry.addAttribute( 'uv', new THREE.BufferAttribute( texCoords, 2 ) );


		// materials (ie, linking to the shader program)
		var uniforms = {
    			t1: { type: "t", value: texture1  },
		};
	

     	material2 = new THREE.RawShaderMaterial( {
			uniforms: 	uniforms,
            vertexShader: vs_tx,
            fragmentShader: fs_tx,	
		} );


	    mesh2 = new THREE.Mesh( geometry, material2 );
		mesh2.translateX(0.0);
		mesh2.material.side = THREE.DoubleSide; //to render both sides of triangle
        scene.add( mesh2 );
}
