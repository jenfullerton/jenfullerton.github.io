/* Jennifer Fullerton
 * CMPM 163, Homework 2
 * February 16, 2018
 * skybox.js
 * mimicking Lucas's skybox.js
 */


// *** SHADERS *** //
var skyVertShader = `
	varying vec3 v_pos;

	void main(){
		v_pos = position;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}`;

var skyFragShader = `
	varying vec3 v_pos;
	uniform samplerCube skyBox;

	void main(){
		gl_FragColor = textureCube(skyBox, v_pos);
		//gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
	}`;

// *** SKYBOX OBJECT *** //
function createSkyBox(size, textureImgArray) {
	// create a big ol' cube
	var cube = new THREE.BoxGeometry(size, size, size);
	// load cubemap texture array
	var tex = new THREE.CubeTextureLoader().load(textureImgArray);

	// create shader input uniforms
	var shaderInput = {
		skyBox: { type: "t", value: tex }
	}

	// create material for the cube
	var material = new THREE.ShaderMaterial({
		uniforms: shaderInput,
		vertexShader: skyVertShader,
		fragmentShader: skyFragShader
	});

	// make sure it textures the inside of the cube
	material.side = THREE.BackSide;

	// create the mesh object to be passed back to the scene
	var mesh = new THREE.Mesh(cube, material);

	// *** SKYBOX METHODS *** //
	// Start() - initalizes the cubebox in the engine
	mesh.Start = function(){
		mesh.position.z = -5;
	}

	// Update() - updates values for "animation"
	mesh.Update = function(){
		// mesh.rotation.x += 0.001;
		// mesh.rotation.y += 0.001;
		// mesh.rotation.z += 0.01;
	}

	return mesh;
}