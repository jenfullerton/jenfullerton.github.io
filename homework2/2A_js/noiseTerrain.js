/* Jennifer Fullerton
 * CMPM 163, Homework 2
 * February 16, 2018
 * noiseTerrain.js
 * uses perlin noise to create a height map
 */

// *** SHADERS *** //
var nTerrainVertShader = `
	precision mediump float;
	//uniform mat4 modelViewMatrix;
	//uniform mat4 projectionMatrix;

	//attribute vec3 position;
	//attribute vec3 normal;
	//attribute vec2 uv;

	uniform float in_val; //a value that changes slowly over time...
	uniform float displaceAmt; //controls the amount of vertex displacement...

	varying float noiseVal, noiseVal2;
	varying vec2 v_UV;
	varying vec3 v_pos;

	// Perlin Noise Helpers
	vec3 mod289(vec3 x)
	{
	  return x - floor(x * (1.0 / 289.0)) * 289.0;
	}

	vec4 mod289(vec4 x)
	{
	  return x - floor(x * (1.0 / 289.0)) * 289.0;
	}

	vec4 permute(vec4 x)
	{
	  return mod289(((x*34.0)+1.0)*x);
	}

	vec4 taylorInvSqrt(vec4 r)
	{
	  return 1.79284291400159 - 0.85373472095314 * r;
	}

	vec3 fade(vec3 t) {
	  return t*t*t*(t*(t*6.0-15.0)+10.0);
	}

	// Classic Perlin noise, periodic variant
	float pnoise(vec3 P, vec3 rep)
	{
	  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
	  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
	  Pi0 = mod289(Pi0);
	  Pi1 = mod289(Pi1);
	  vec3 Pf0 = fract(P); // Fractional part for interpolation
	  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
	  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
	  vec4 iy = vec4(Pi0.yy, Pi1.yy);
	  vec4 iz0 = Pi0.zzzz;
	  vec4 iz1 = Pi1.zzzz;
	  
	  vec4 ixy = permute(permute(ix) + iy);
	  vec4 ixy0 = permute(ixy + iz0);
	  vec4 ixy1 = permute(ixy + iz1);
	  
	  vec4 gx0 = ixy0 * (1.0 / 7.0);
	  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
	  gx0 = fract(gx0);
	  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
	  vec4 sz0 = step(gz0, vec4(0.0));
	  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
	  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
	  
	  vec4 gx1 = ixy1 * (1.0 / 7.0);
	  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
	  gx1 = fract(gx1);
	  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
	  vec4 sz1 = step(gz1, vec4(0.0));
	  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
	  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
	  
	  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
	  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
	  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
	  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
	  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
	  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
	  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
	  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
	  
	  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
	  g000 *= norm0.x;
	  g010 *= norm0.y;
	  g100 *= norm0.z;
	  g110 *= norm0.w;
	  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
	  g001 *= norm1.x;
	  g011 *= norm1.y;
	  g101 *= norm1.z;
	  g111 *= norm1.w;
	  
	  float n000 = dot(g000, Pf0);
	  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
	  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
	  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
	  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
	  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
	  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
	  float n111 = dot(g111, Pf1);
	  
	  vec3 fade_xyz = fade(Pf0);
	  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
	  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
	  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
	  return 2.2 * n_xyz;
	}

	float turbulence( vec3 p ) {
	  float w = 100.0;
	  float t = -.5;
	  for (float f = 1.0 ; f <= 10.0 ; f++ ){
	    float power = pow( 2.0, f );
	    t += abs( pnoise( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
	  }
	  return t;
	}


	void main() {
		// get a 3d noise using the position, low frequency
		float lowFreq = pnoise( position.xyz + vec3(in_val), vec3(10.0) );

		// get a turbulent 3d noise using the normal, normal to high freq
		float highFreq = -.5 * turbulence( 0.7 * (position.xyz + vec3(in_val)) );

		//add high freq noise + low freq noise together
		//  float displacement = lowFreq;
		//  float displacement = highFreq;
		float displacement = (lowFreq + highFreq) * displaceAmt;

		noiseVal = highFreq;
		noiseVal2 = lowFreq;
		// move the position along the normal and transform it
		vec3 newPosition = (position.xyz + normal.xyz * displacement).xyz;
		// send new position to frag shader
		v_pos = newPosition;

		v_UV = uv;
		gl_Position = projectionMatrix  * modelViewMatrix  * vec4( newPosition, 1.0 );

	}`;

var nTerrainFragShader = `
	precision mediump float;

	uniform sampler2D tex0, tex1, tex2;
	varying vec2 v_UV;

	uniform float displaceAmt;
	varying vec3 v_pos;

	varying float noiseVal;
	varying float noiseVal2;

	void main()	{
		vec4 moss = texture2D(tex0, v_UV);
		vec4 sand = texture2D(tex1, v_UV);
		vec4 grass = texture2D(tex2, v_UV);

		float offset = (v_pos.z/10.0)+0.5;

		vec4 mix1 = mix(moss, sand, clamp(v_pos.z, 0.0, 1.0));
		vec4 mix2 = mix(sand, grass, clamp(v_pos.z, 0.0, 1.0));
		vec4 mix3 = mix(mix1, mix2, clamp(v_pos.z, 0.0, 1.0));

		gl_FragColor = vec4(mix3.rgb, 1.0);

	}`;

// *** SKYBOX OBJECT *** //
function createNoiseTerrain(w, h, resX, resY, img0, img1, img2, sceneOptions) {
	// create a big ol' plane
	var plane = new THREE.PlaneGeometry(w, h, resX, resY);
	// load textures
	// img0, img1, img2, img3
	var t0 = new new THREE.TextureLoader().load( img0 );
	var t1 = new new THREE.TextureLoader().load( img1 );
	var t2 = new new THREE.TextureLoader().load( img2 );
	//var t3 = new new THREE.TextureLoader().load( img3 );

	// create shader input uniforms
	var shaderInput = {
		in_val: { type: "f", value: 1.0 },
		displaceAmt: { type: "f", value: 2.0 },
		tex0: { type: "t", value: t0 },
		tex1: { type: "t", value: t1 },
		tex2: { type: "t", value: t2 },
	};

	// create material for the cube
	var material = new THREE.ShaderMaterial({
		uniforms: shaderInput,
		vertexShader: nTerrainVertShader,
		fragmentShader: nTerrainFragShader
	});

	// create the mesh object to be passed back to the scene
	var mesh = new THREE.Mesh(plane, material);

	// *** SKYBOX METHODS *** //
	// Start() - initalizes the cubebox in the engine
	mesh.Start = function(){
		mesh.rotation.x = -1.5;
	}

	// Update() - updates values for "animation"
	mesh.Update = function(){
		var time = performance.now();
		// change noise seed
		mesh.material.uniforms.in_val.value = sceneOptions.terrainSeed;

		// change total displacement amount
		mesh.material.uniforms.displaceAmt.value = sceneOptions.terrainDisplacement;

		// make it breathe--DEEPLY unsettling. i love it
		if(sceneOptions.landscapeBreathe){
			mesh.material.uniforms.displaceAmt.value += 0.1 * Math.sin(time * 0.001); //0.01;
		}
	}

	return mesh;
}