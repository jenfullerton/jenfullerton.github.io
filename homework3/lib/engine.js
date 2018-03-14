/* Jennifer Fullerton
 * CMPM 163, Homework 3
 * March 3, 2018
 * engine.js
 * mimicking Lucas's cmgine.js
 */

// engine data type
 var CMENGINE = {};

 CMENGINE.Start = function(scene, renderer, camera){
 	// for every object in the scene
 	for (var i=0; i<scene.children.length; i++){
 		// if it has a Start() function
 		if(scene.children[i].Start != null){
 			// call that start function
 			scene.children[i].Start();
 		}
 	}
 	// assign stuff
 	CMENGINE.scene		= scene;
 	CMENGINE.renderer = renderer;
 	CMENGINE.camera	= camera;
 }

 CMENGINE.Update = function() {
 	// for every object in the scene
 	for (var i = 0; i < CMENGINE.scene.children.length; i++) {
 		// if it has a defined Update function
 		if( CMENGINE.scene.children[i].Update != null){
 			// call Update
 			CMENGINE.scene.children[i].Update();
 		}
 	}

 	// request animation frame, update positions, and render to screen
 	requestAnimationFrame(CMENGINE.Update);
 	CMENGINE.renderer.render(CMENGINE.scene, CMENGINE.camera);
 }