/* Jennifer Fullerton
 * CMPM 163, Homework 2
 * February 16, 2018
 * water.js
 * uses perlin noise to create a height map
 */

 // *** WATER SHADERS *** //

var waterVertShader = `
	precision mediump float;

	uniform mat4 modelMatrix;
	uniform mat4 viewMatrix;
	uniform mat4 projectionMatrix;

	uniform vec3 cameraPosition;

	attribute vec3 position;
	attribute vec3 normal;

	varying vec3 vI;
	varying vec3 vWorldNormal;

	void main(){
		vec4 pos = viewMatrix * modelMatrix * vec4(position, 1.0);
		vec4 worldPosition = modelMatrix * vec4(position, 1.0);

		vWorldNormal = normalize( mat3(modelMatrix[0].xyz,
			modelMatrix[1].xyz, modelMatrix[2].xyz) * normal );

		vI = worldPosition.xyz - cameraPosition.xyz;

		gl_Position = projectionMatrix * pos;
	}`;

var waterFragShader = `
	precision mediump float;

	uniform samplerCube envsMap;

	varying vec3 vI, vWorldNormal;

	void main(){
		vec3 reflection = reflect(vI, vWorldNormal);
		vec4 envColor = textureCube( envsMap,
			vec3(-reflection.x, reflection.yz)
		);

		gl_FragColor = vec4(envColor);
		// gl_FragColor = vec4(0.1, 0.5, 1.0, 1.0);
	}`;

// *** SIMPLEBOX OBJECT CREATION *** //

function createWater(w,h,resX, resY, cubeMapImgArray) {
	// *** CREATE OBJECT *** //
	// create geometry
	// create a big ol' plane
	var plane = new THREE.PlaneGeometry(w, h, resX, resY);

	var tex = new THREE.CubeTextureLoader().load(cubeMapImgArray);

	// create shader input uniforms
	var shaderInput = {
		envsMap: { type: "t", value: tex }
	}

	// create the material, link uniforms and shaders
	var material = new THREE.RawShaderMaterial({
		uniforms: shaderInput,
		vertexShader: waterVertShader,
		fragmentShader: waterFragShader
	});

	// create the mesh with geometry and material
	var mesh = new THREE.Mesh(plane, material);

	// *** SIMPLEBOX METHODS *** //
	// engine requires a Start and Update function for animations
	
	// Start() - gives starter values and positions
	mesh.Start = function(){
		mesh.position.y = -0.1;
		mesh.rotation.x = -1.5;
	}

	// Update() - updates position and uniform data
	//		typically used for animation
	mesh.Update = function(){
		mesh.position.y = sceneOptions.seaLevel;
	}

	return mesh;
}
