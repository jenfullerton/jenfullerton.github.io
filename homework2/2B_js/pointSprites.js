/* Jennifer Fullerton
 * CMPM 163, Homework 2 Part B
 * February 16, 2018
 * pointSprites.js
 */

var pointVertShader = `
	uniform float amplitude;
	attribute float size;
	attribute vec3 customColor;

	varying vec3 vColor;

	void main(){
		vColor = customColor;

		vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

		gl_PointSize = size * (300.0 / -mvPosition.z);
		
		// note: if this goes before gl_PointSize, stars
		// become blurry at max; if it goes after, it creates 
		// a colorful plasma effect
		mvPosition.z *= amplitude;
		

		gl_Position = projectionMatrix * mvPosition;
	}`;

var pointFragShader = `
	uniform vec3 color;
	uniform sampler2D texture;

	varying vec3 vColor;

	void main(){
		gl_FragColor = vec4(color * vColor, 1.0);
		gl_FragColor = gl_FragColor * texture2D(texture, gl_PointCoord);
	}`;

function createBoxOfPoints(amount, radius, texImgPath,x,y,z) {
	// create a big ol' cube
	var boxOfPoints;
	var textureImg = new THREE.TextureLoader().load( texImgPath );
	
	// create random arrays of sizes and colors
	var positions = new Float32Array(amount*3);
	var colors = new Float32Array( amount * 3 );
	var sizes = new Float32Array( amount );

	var vertex = new THREE.Vector3();
	var color = new THREE.Color( 0xffffff );

	// randomly seed positions and colors
	for ( var i = 0; i < amount; i ++ ) {
		vertex.x = ( Math.random() * 2 - 1 ) * radius;
		vertex.y = ( Math.random() * 2 - 1 ) * radius;
		vertex.z = ( Math.random() * 2 - 1 ) * radius;
		vertex.toArray( positions, i * 3 );

		var redFactor = vertex.x/radius;
		if (redFactor < 0) redFactor = -redFactor;
		var grnFactor = vertex.y/radius;
		if (grnFactor < 0) grnFactor = -grnFactor;
		var bluFactor = vertex.z/radius;
		if (bluFactor < 0) bluFactor = -bluFactor;

		//color.setHSL( 0.0 + 0.1 * ( i / amount ), 0.9, 0.5 );
		color.setRGB( redFactor, grnFactor, bluFactor );

		color.toArray( colors, i * 3 );

		sizes[ i ] = 20;
	}


	// define attributes manually
	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
	geometry.addAttribute( 'customColor', new THREE.BufferAttribute( colors, 3 ) );
	geometry.addAttribute( 'size', new THREE.BufferAttribute( sizes, 1 ) );


	// create shader input uniforms
	var shaderInput = {
		amplitude: { value: 1.0 },
		color:     { value: new THREE.Color( 0xffffff ) },
		texture:   { type: "t", value: textureImg },
	}

	// create material for the cube
	var material = new THREE.ShaderMaterial({
		uniforms: shaderInput,
		vertexShader: pointVertShader,
		fragmentShader: pointFragShader,
		blending:       THREE.AdditiveBlending,
		depthTest: 		false,
		transparent: 	true
	});

	boxOfPoints = new THREE.Points(geometry, material);

	// *** SKYBOX METHODS *** //
	// Start() - initalizes the cubebox in the engine
	boxOfPoints.Start = function(){
		boxOfPoints.position.x = x;
		boxOfPoints.position.y = y;
		boxOfPoints.position.z = z;
	}

	// Update() - updates values for "animation"
	boxOfPoints.Update = function(){

		var time = Date.now() * 0.005;

		var radiusChange;

		//boxOfPoints.rotation.z = 0.01 * time;
		radiusChange = Math.sin(time*0.3)+1.5;
		//radiusChange *= 2;

		var geometry = boxOfPoints.geometry;
		var attributes = geometry.attributes;

		for ( var i = 0; i < attributes.size.array.length; i++ ) {

			attributes.size.array[ i ] = 14 + 13; // * Math.sin( 0.1 * i + time );
			//attributes.position.array[i*3] += radiusChange;
		}

		// material.uniforms.light1_pos.value
		boxOfPoints.material.uniforms.amplitude.value = radiusChange;

		attributes.size.needsUpdate = true;
		//attributes.position.needsUpdate = true;
	}

	return boxOfPoints;
}