/* Jennifer Fullerton
 * CMPM 163, Homework1 Pt. C
 * "hw1A.js"
 * main functionality for HW1C
 * based on "w2_gol_pingpong.js" from class examples
 */

 function scene_setup(){
	//This is the basic scene setup
	scene = new THREE.Scene();
	var width = window.innerWidth;
	var height = window.innerHeight;

	//orthographic camera can be used for 2D
	camera = new THREE.OrthographicCamera( width / -2, width / 2, height / 2, height / -2, 0.1, 1000 );
	camera.position.z = 0.2;

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
}

function FBO_setup(){
	//Create off-screen buffer scene
	bufferScene = new THREE.Scene();
	
	//Create 2 buffer textures
	//FBO_A = new THREE.WebGLRenderTarget( resX, resY );
	//FBO_B = new THREE.WebGLRenderTarget( resX, resY ); 
	FBO_A = new THREE.WebGLRenderTarget( resX, resY, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter});
	FBO_B = new THREE.WebGLRenderTarget( resX, resY, { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter} );


	
	//Begin by passing an initial "seed" texture to shader, containing randomly placed cells
	var dataTexture = createDataTexture();

	bufferMaterial = new THREE.RawShaderMaterial( {
		uniforms: {
			bufferTexture: { type: "t", value: dataTexture },
			textureSize : {type: "v2", value: new THREE.Vector2( resX, resY )}  //shader doesn't have access to these global variables, so pass in the resolution
		},
		vertexShader: document.getElementById( 'vertexShader' ).innerHTML,
		fragmentShader: document.getElementById( 'fragmentShader' ).innerHTML
	} );

	//we can use a Three.js Plane Geometry along with the orthographic camera to create a "full screen quad"
	plane = new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight )

	bufferObject = new THREE.Mesh( plane, bufferMaterial );
	bufferScene.add(bufferObject);


	//Draw textureB to screen 
	fullScreenQuad = new THREE.Mesh( plane, new THREE.MeshBasicMaterial() );
	scene.add(fullScreenQuad);
}

function render() {

	requestAnimationFrame( render );

	
	//Draw to the active offscreen buffer (whatever is stored in FBO_B), that is the output of this rendering pass will be stored in the texture associated with FBO_B
	renderer.render(bufferScene, camera, FBO_B);
	
	//grab that texture and map it to the full screen quad
	fullScreenQuad.material.map = FBO_B.texture;

	//Then draw the full sceen quad to the on screen buffer, ie, the display
	renderer.render( scene, camera );


	//Now prepare for the next cycle by swapping FBO_A and FBO_B, so that the previous frame's *output* becomes the next frame's *input*
	var t = FBO_A;
	FBO_A = FBO_B;
	FBO_B = t;
	bufferMaterial.uniforms.bufferTexture.value = FBO_A.texture;
}




function createDataTexture() {

	// create a buffer with color data

	var size = resX * resY;
	var data = new Uint8Array( 4 * size );

/*	// black and white
	for ( var i = 0; i < size; i++ ) {

		var stride = i * 4;

		if (Math.random() < 0.5) {
			data[ stride ] = 255;
			data[ stride + 1 ] = 255;
			data[ stride + 2 ] = 255;
			data[ stride + 3 ] = 255;
		}
		else {
			data[ stride ] = 0;
			data[ stride + 1 ] = 0;
			data[ stride + 2 ] = 0;
			data[ stride + 3 ] = 255;
		}
	}
*/
	for ( var i = 0; i < size; i++ ) {

		var stride = i * 4;
		var r = Math.random();

		if ( r < 0.25 ) {
			data[ stride ] = 255;		// r
			data[ stride + 1 ] = 0;		// g
			data[ stride + 2 ] = 0;		// b
			data[ stride + 3 ] = 255;	// a
		}
		else if( r < 0.5 ){
			data[ stride ] = 0;			// r
			data[ stride + 1 ] = 255;	// g
			data[ stride + 2 ] = 0;		// b
			data[ stride + 3 ] = 255;	// a
		}
		else if( r < 0.75 ){
			data[ stride ] = 0;			// r
			data[ stride + 1 ] = 0;		// g
			data[ stride + 2 ] = 255;	// b
			data[ stride + 3 ] = 255;	// a
		}
		else {
			data[ stride ] = 0;			// r
			data[ stride + 1 ] = 0;		// g
			data[ stride + 2 ] = 0;		// b
			data[ stride + 3 ] = 255;	// a
		}
	}


	// used the buffer to create a DataTexture

	console.log(data);
	var texture = new THREE.DataTexture( data, resX, resY, THREE.RGBAFormat );
	
	texture.needsUpdate = true; // just a weird thing that Three.js wants you to do after you set the data for the texture

	return texture;

}