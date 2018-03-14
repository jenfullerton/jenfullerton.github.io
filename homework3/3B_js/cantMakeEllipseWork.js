/* Jennifer Fullerton
 * CMPM 163, Homework 3, Part B
 * March 3, 2018
 * engine.js
 * mimicking Lucas's plane_sdf.js
 */

// just passes position through
var basicSDFVertShader = `
	precision mediump float;
	varying vec3 v_pos;

	void main()
	{
		v_pos = position;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}`;

// orbiting circles
var basicSDFFragShader = `
	precision mediump float;

	const int MAX_STEPS = 255;
	const float EPISILON = 0.0001;
	const float START = 0.0;
	const float END = 100.0;

	varying vec3 v_pos;
	uniform vec2 resolution;
	uniform float time;

	// === SDF TRANSFOMATIONS AND SHAPING FUNCTIONS === //

	// = PRE-PRIMITIVE - operates on vec3 points = //

	// ROTATE: allows you to rotate a shape 
	//		rotates the sample point and returns it to be
	//		used as input in an SDF
	// notes: MUST BE DONE BEFORE TRANSLATION 
	//		I AM TOO LAZY TO MAKE IT WORK ARBITRARILY
	vec3 rotate(vec3 point, float x, float y, float z){

		// rotation about x axis
		float cx = cos(x);
		float sx = sin(x);
		mat4 rotMatX = mat4(
			1,  0,   0, 0,
			0, cx, -sx, 0,
			0, sx,  cx, 0,
			0,  0,   0, 1
		);

		// rotation about y axis
		float cy = cos(y);
		float sy = sin(y);
		mat4 rotMatY = mat4(
			 cy, 0, sy, 0,
			  0, 1,  0, 0,
			-sy, 0, cy, 0,
			  0, 0,  0, 1
		);

		// rotation about z axis
		float cz = cos(z);
		float sz = sin(z);
		mat4 rotMatZ = mat4(
			cz, -sz, 0, 0,
			sz,  cz, 0, 0,
			0,   0,  1, 0,
			0,   0,  0, 1
		);

		mat4 totalRot = rotMatX * rotMatY * rotMatZ;

		// might need to do some sort of inversion
		vec3 rotatedPoint = (totalRot * vec4(point, 1.0)).xyz;

		return rotatedPoint;
	}

	// TRANSLATE: allows you to move basic SDF shapes around
	//		translates the sample point and returns it to be
	//		used as input for an SDF
	vec3 translate(vec3 point, vec2 translation){
		return vec3( point.xy - translation, point.z);
	}

	// BEND: bends the shape, returns point to be used as input
	vec3 cheapBend(vec3 point){
		float c = cos(20.0*point.y);
		float s = sin(20.0*point.y);
		mat2 m = mat2(c, -s, s, c);

		return vec3(m*point.xy, point.z);
	}


	// = POST-PRIMITIVE: operates on floats = //

	// MERGE: merge SDF shapes
	float merge(float shape1, float shape2){
		return min(shape1, shape2);
	}

	// CARVE: carve shape1 out of shape2
	float carve(float shape1, float shape2){
		return max(-shape1, shape2);
	}

	// INTERSECT: use only the intersection of 2 shapes
	float intersect(float shape1, float shape2){
		return max(shape1, shape2);
	}

	// BLEND: blend 2 shapes using a smooth minimum function
	//	r = radius
	float blend(float shape1, float shape2, float r){
		// polynomial smin function from IQ
		float h = clamp( 0.5 + 0.5*(shape2-shape1)/r, 0.0, 1.0 );
		return mix(shape2, shape1, h) - r*h*(1.0-h);
	}

	// circularOrbit -- calculates a circular
	//		path for objects to follow based on time
	// used alongside TRANSLATE to make shapes follow the path
	// 	VARS:
	// 		focalPt	- point around which to orbit
	// 		radius	- how large the rotation is
	// 		speed 	- large number = slower, smaller = faster
	//		offset	- starting position on unit circle for rotation (in radians)
	vec2 circularOrbit(vec2 focalPt, float radius, float speed, float offset){
		float x = focalPt.x - cos(time/speed + offset) * radius;
		float y = focalPt.y - sin(time/speed + offset) * radius;
		return vec2(x,y);
	}


	// === SDF SHAPES and SCENE === //

	//* sphere *//
	float sphereSDF(vec3 point, float radius)
	{	
		return length(point) - radius;
	}

	//* ellipse *//
	float ellipseSDF(vec3 point, vec3 r)
	{
		return (length( point/r )-1.0) * (min( min(r.x,r.y), r.z) );
	}


	//* sceneSDF *//
	// combines ALL SDFs in the scene, used by shortDistFunct()
	//		in order to calculate raymarching
	// based on / copied from jamie wong's Ray Marching Part 2
	// <https://www.shadertoy.com/view/lt33z7>
	float sceneSDF(vec3 point)
	{

		float speed = 1000.0;
		vec2 orbitA = circularOrbit( vec2(0.0, 0.0), 0.5, speed, 0.0);
		
		// orbit around another orbit
		vec2 orbitB = circularOrbit( orbitA, 0.5, speed/2.0, 0.0);
		vec3 centerA = translate(point, orbitA);
		float sphereA = sphereSDF(centerA, 0.3);

		vec3 centerB = translate(point, orbitB);
		float sphereB = sphereSDF(centerB, 0.1);

		float wiggle = (cos(time/(speed/3.0)) )/2.0;
		
		// cycle rotation around z from 0 -> 1 continuously
		//	I. CAN'T. FIGURE. OUT. WHY. IT. PAUSES.
		float rz = 3.14;
		if(cos(time/speed) >= 0.0 )
			rz *= (sin(time/speed)+1.0)/2.0;
		else
			rz *= (-sin(time/speed)+1.0)/2.0;
		
		vec3 eCenter = rotate(point, 0.0, 0.0, rz);
		// vec2 orbitC = circularOrbit(vec2(0.0, 0.0), 0.75, speed, 3.14);
		//eCenter = translate(eCenter, orbitC);
		float ellipse = ellipseSDF(eCenter, vec3(0.2, 0.3, 0.4));


		float finalShape = blend(sphereB, sphereA, 0.5);
		return merge(finalShape, ellipse);
	}

	// === LIGHTING === //

	// estimates the normal for the...entire SDF? wild. based on gradients
	// function courtesy of Jamie Wong's tutorial < https://www.shadertoy.com/view/lt33z7 >
	vec3 estimateNormal(vec3 p)
	{
		return normalize(vec3(
			sceneSDF( vec3(p.x + EPISILON, p.y, p.z) ) - sceneSDF(vec3(p.x - EPISILON, p.y, p.z) ),
			sceneSDF( vec3(p.x, p.y + EPISILON, p.z) ) - sceneSDF(vec3(p.x, p.y - EPISILON, p.z) ),
			sceneSDF( vec3(p.x, p.y, p.z + EPISILON) ) - sceneSDF(vec3(p.x, p.y, p.z - EPISILON) )
		));
	}

	// PHONG ILLUMINATION - BASIC CALCULATION
	// Thank you again to Jamie Wong
	vec3 phongSingleLight(vec3 k_d, vec3 k_s, float gloss, vec3 point, vec3 eye, vec3 posL, vec3 intensityL)
	{

		vec3 N = estimateNormal(point);
		vec3 L = normalize(posL - point);
		vec3 V = normalize(eye - point);
		vec3 R = normalize( reflect(-L,N) );

		float LdotN = dot(L,N);
		float RdotV = dot(R,V);

		if(LdotN < 0.0)
		{	// light is not visible, return black
			return vec3(0.0, 0.0, 0.0);
		} else {	// lighting is visible
			vec3 shading = k_d * LdotN;	// basic diffuse

			if(RdotV >= 0.0){
				// if specular is visible, add its contribution
				shading += k_s * pow(RdotV, gloss);

			}

			return shading * intensityL;
		}
	}

	// LIGHT SCENE
	// Jamie Wong I owe you my life
	vec3 sceneIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float gloss, vec3 point, vec3 eye)
	{
		vec3 ambientLight = vec3(1.0, 1.0, 1.0) * 0.5;
		vec3 color = ambientLight * k_a;	// basic ambient

		vec3 posL1 = vec3(0.5, 0.5, 4.0);
		vec3 intensityL1 = vec3(1.0, 1.0, 1.0);

		color += phongSingleLight(k_d, k_s, gloss, point, eye, posL1, intensityL1);

		return color;
	}

	// === RAYMARCHING FUNCTIONS === //

	//* basic raymarch function *//
	float shortDistFunct(vec3 cam, vec3 dir, float start, float end)
	{
		float step = start;

		for(int i=0; i < MAX_STEPS; i++){

			// get the distance of stuff in the scene
			float dist = sceneSDF( cam + step * dir);

			if(dist<EPISILON){
				return step;
			}

			step += dist;
			if(step > end){
				return end;
			}
		}

		return end;
	}

	//* calculate direction of ray *//
	vec3 rayDirection(float fieldOfView, vec2 size, vec2 fragCoord)
	{
		// get the basic xy coordinate
		vec2 xy = fragCoord;

		// not sure what this meeeeeans but okay
		float z = size.y / tan( radians(fieldOfView) / 2.0 );
		
		return normalize(vec3(xy, -z));
	}

	// === MAIN === //
	void main()
	{
		// set up a "camera"
		vec3 eye = vec3(0.0, 0.0, 5.0);
		vec3 dir = rayDirection(50.0, resolution, v_pos.xy);

		// march thems rays
		float dist = shortDistFunct(eye, dir, START, END);

		// if distance is outside of a shape, color black
		if(dist > END - EPISILON)
		{
			gl_FragColor = vec4(0.5, 0.5, 0.5, 1.0);
		} else {
			vec3 ka, kd, ks, point;
			ka = vec3(0.0, 0.0, 0.2);
			kd = vec3(0.8, 0.0, 0.0);
			ks = vec3(0.8, 1.0, 0.8);
			point = eye+dist*dir;
			float glossiness = 20.0;

			vec3 color = sceneIllumination(ka, kd, ks, glossiness, point, eye);
			//vec3 color = sceneIllumination(vec3(0.0, 0.0, 0.2), vec3(0.9,0.0,0.0), vec3(0.0,0.5,0.0), 10.0, (eye+dist*dir), eye);
			gl_FragColor = vec4(color, 1.0);
		}
	}`;

/* createPlaneSDF
creates a fullscreen quad upon which we can do a frag-shader-only
	image
*/
function createPlaneSDF(w, h) {

var geometry = new THREE.PlaneGeometry(w, h);

// information for the shaders
var shaderInput = {
	resolution: { type: "f", value: new THREE.Vector2(w,h)},
	time: 		{ type: "f", value: 0.0	}
};

// material -- link input and shaders
var material = new THREE.ShaderMaterial({
	uniforms: shaderInput,
	vertexShader: basicSDFVertShader,
	fragmentShader: basicSDFFragShader
});

var mesh = new THREE.Mesh(geometry, material);

// Start() - initialize object
mesh.Start = function(){
	// empty for now
	mesh.position.z = -5;
}

// Update() - adjust object over time
mesh.Update = function(){
	// empty for now
	mesh.material.uniforms.time.value = performance.now();
	
}

// return the mesh to be added to scene and engine
return mesh;
}