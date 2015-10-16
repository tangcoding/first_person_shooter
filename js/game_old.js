
// --------------------------------------------- //
// ------- 3D Shoot Game built with Three.JS --------- //
// -------- built with Three.JS ----------- //
// --------  by Wenjie Tang --------- //
// --------------------------------------------- //

$(document).ready(function(){
	setup();

	// set audio
	shot_gun = document.getElementById("shot_gun");
	blast = document.getElementById("blast");
	// console.log(shot_gun);
	// console.log(blast);


	$(".new_game").click( function(event){		
		event.stopPropagation()
		new_game();
	});

	// resume game
	$("#resume").click( function(event){
		event.stopPropagation()
		runAnim = true;	
		aiShoot = true;
		$("#pause").hide();
		// render
		redrawMap();
		draw();
	});

	// update map 
	setInterval(redrawMap, 500);

    
    //pause game when mouse out of page
	$("body").mouseleave(function(){
		// console.log("mouse out");
		pauseGame();
	});


    // look around when mouse move
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	// document.addEventListener( 'mouseout', onDocumentMouseOut, false );
	// controls.addEventListener( 'mousemove', onDocumentMouseMove ); 

	// shoot bullet by mouse click
	$(document).click(function(e) {
		e.preventDefault();
		if (e.which === 1) { // Left click only
			createBullet(camera);
		}
	});

	// key down event for player to walk
	$(document).keydown(function(e) {
	  e.preventDefault();
	  if(e.which == 32){
	  	pauseGame();
	  }
	  else{
	  	playerWalk(e);
	  }
	 });
});

// ------------------------------------- //
// ------- GLOBAL VARIABLES ------------ //
// ------------------------------------- //

// scene object variables
var renderer, scene, camera, pointLight, spotLight;

// field variables
var fieldWidth = 300, fieldHeight = 300;

// cube variables
var cubeX = 10, cubeY = 10, cubeZ = 30;

// score variables
var score = 0 ;

// wall grid
var gridSizeX = 30, gridSizeY = 30, wallGrid = [];

// map
var map = [ // 1  2  3  4  5  6  7  8  9
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 0
           [1, 0, 0, 0, 0, 0, 0, 1, 0, 1,], // 1
           [1, 1, 0, 0, 2, 0, 0, 0, 0, 1,], // 2
           [1, 0, 0, 0, 0, 2, 0, 0, 0, 1,], // 3
           [1, 0, 0, 2, 0, 0, 2, 0, 0, 1,], // 4
           [1, 1, 0, 0, 2, 0, 0, 0, 1, 1,], // 5
           [1, 0, 0, 0, 0, 0, 0, 1, 0, 1,], // 6
           [1, 0, 0, 0, 0, 1, 0, 0, 0, 1,], // 7
           [1, 1, 0, 1, 1, 0, 0, 0, 1, 1,], // 8
           [1, 1, 1, 1, 1, 1, 1, 1, 1, 1,], // 9
           ], mapW = map.length, mapH = map[0].length;

// Semi-constants
var WIDTH = window.innerWidth,
	HEIGHT = window.innerHeight,
	ASPECT = WIDTH / HEIGHT,
	UNITSIZE = 250,
	WALLHEIGHT = UNITSIZE / 3,
	AISPEED = 5;
	MOVESPEED = 20,
	LOOKSPEED = 0.075,
	BULLETMOVESPEED = MOVESPEED * 25,
	NUMAI = 5,
	SAFEDISTANCE = 50,
	PROJECTILEDAMAGE = 20;

var YGLOW_COLOR = "#ffdb00", BGLOW_COLOR = "#2fcbff";

var t = THREE, scene, camera, renderer, controls, clock, projector, model, skin;
var runAnim = true, aiShoot = false;
var  mouse = new THREE.Vector2();
var gameTime = time_left = 60000 *0.5;
var endTime;
var health = 100;
mouse.x = 0; mouse.y = 0;

// audio
var shot_gun, blast;

// ------------------------------------- //
// ------- GAME FUNCTIONS -------------- //
// ------------------------------------- //

// start a new game
function new_game(){
	// now reset score 
	score = 0;
	$("#score").text(score);
	$("#scoreboard").show();

	var starting_time = Date.now();

	// play for 3 minutes
	// endTime = starting_time + gameTime;
	// $("#time_left").text("03:00");
	// $("#time_left").css("color", "#757575");

	// reset health
	health = 100;
	$("#health").text("100");
	$("#health_status").width($("#health_bar").width());
	$("#health").text("100");
	$("#health").css("color", "#757575");

    // hide instruction page
	$("#instruction").hide();

	projector = new t.Projector(); 

	runAnim = true;	
	aiShoot = true;
	// render
	redrawMap();
	draw();
}

function setup()
{

	projector = new t.Projector(); 
	var starting_time = Date.now();

	// play for 3 minutes
	// endTime = starting_time + gameTime;
	// $("#time_left").text("03:00");

	// set up all the 3D objects in the scene	
	createScene();
	setupAI();
	drawMiniMap();
	// var aa = new THREE.Vector3(-20,35,-20);
	// createFireBall(aa);

	// now reset score and health
	score = 0;
	$("#score").text(score);
	$("#health").text("100");

	// render
	draw();
	// renderer.render(scene, camera);

}

function draw()
{	
	if(runAnim){
		// draw THREE.JS scene
		renderer.render(scene, camera);
		// loop draw function call
		requestAnimationFrame(draw);
		// playerWalk();
		updateBullets();
		updateAI();
		if(fireball_list.length > 0){ updateFireBall(); }
		// checkTime();
		checkHealth();

	}
}

// check if running out of time
function checkTime(){
	time_left= (endTime - Date.now())/1000;
	var seconds = Math.round(time_left%60);
	var minutes = Math.floor(time_left/60);

	if(seconds < 10){ $("#time_left").text("0" + minutes+":0"+seconds);}
	else{ $("#time_left").text("0" + minutes+":"+seconds); }
	if( time_left < 15) {
		$("#time_left").css("color", "red");
	}

	if( time_left < 0.1) {
		runAnim = false;
		$("#instruction").show();
		$("#result").text("You Final Score: " + score);
		$("#scoreboard").hide();
	}
}

// check health
function checkHealth(){
	var new_width = Math.round($("#health_bar").width()*health/100);
	// console.log($("#health_bar").width());
	// console.log(new_width);
	$("#health_status").width(new_width);

	$("#health").text(health);

	if( health < 15) {
		$("#health").css("color", "red");
	}

	if( health < 5) {
		runAnim = false;
		$("#instruction").show();
		$("#result").text("You Final Score: " + score);
		$("#scoreboard").hide();
	}
}

// pause game during play
function pauseGame() {
	if(! $("#instruction").is(":visible")){
		runAnim = false;
		$("#pause").show();
	}	
}


function createScene()
{
	scene = new t.Scene(); // The "world" environment. Holds all other objects.
	// Add fog to the world. Helps with depth perception. Params are color (in hex) and density
	scene.fog = new t.FogExp2(0xD6F1FF, 0.0005); 
	//scene.fog = new THREE.Fog( 0xcce0ff, 1, 2000 );
 
	// Set up camera so we know from where to render the scene
	camera = new t.PerspectiveCamera(60, ASPECT, 1, 10000); // Field Of Viw, aspect ratio, near, far
	camera.position.y = UNITSIZE * .2; // Raise the camera off the ground
	camera.position.z = 100;
	camera.position.x = 0;

	// move camera to get top view
	// camera.position.z = 0;
	// camera.position.x = 0;
	// camera.position.y = UNITSIZE * 3;
	// camera.rotation.x = -Math.PI/2;
	scene.add(camera); // Add the camera to the scene


	// Handle drawing as WebGL (faster than Canvas but less supported by browsers)
	renderer = new t.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT); // Give the renderer the canvas size explicitly



	// Add the canvas to the document
	renderer.domElement.style.backgroundColor = '#D6F1FF'; // Make it easier to see that the canvas was added. Also this is the sky color
	document.body.appendChild(renderer.domElement); // Add the canvas to the document

	// Lighting
	var directionalLight1 = new t.DirectionalLight( "#ffffff", 0.6 );
	directionalLight1.position.set( -1.5, 1, -1.5 );
    scene.add( directionalLight1 );
	var directionalLight2 = new t.DirectionalLight( "#ffffff", 1.2);
	// var directionalLight2 = new THREE.HemisphereLight( 0x0000ff, 0x00ff00, 0.6 ); 
	directionalLight2.position.set( 100, 100, 100 );
	scene.add( directionalLight2 );


	var units = mapW;
 
	// Geometry: floor
	// THREE.ImageUtils.crossOrigin = '';
	var floorTexture = THREE.ImageUtils.loadTexture('./images/floor-3.jpg');
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(units, units);
    floorTexture.anisotropy = 36;

	var floor = new t.Mesh(
			new t.CubeGeometry(units * UNITSIZE, 10, units * UNITSIZE),
			// new t.MeshLambertMaterial({color: 0xEDCBA0})
			// new THREE.MeshBasicMaterial({map : floorTexture})
			new THREE.MeshLambertMaterial({map : floorTexture})
	);
	scene.add(floor);
 
	// Geometry: walls
	var cube = new t.CubeGeometry(UNITSIZE, WALLHEIGHT, UNITSIZE);
	var wallTexture1 = t.ImageUtils.loadTexture('./images/wall-1.jpg');
	var wallTexture2 = t.ImageUtils.loadTexture('./images/wall-1.jpg');
	var materials = [
	                 new t.MeshLambertMaterial({map: wallTexture1}),
	                 new t.MeshLambertMaterial({map: wallTexture1}),
	                 ];
	for (var i = 0; i < mapW; i++) {
		for (var j = 0, m = map[i].length; j < m; j++) {
			if (map[i][j]) {
				var wall = new t.Mesh(cube, materials[map[i][j]-1]);
				// wall.castShadow = true;
				// wall.receiveShadow = true;
				wall.position.x = (i - units/2) * UNITSIZE;
				wall.position.y = WALLHEIGHT/2;
				wall.position.z = (j - units/2) * UNITSIZE;
				wall.castShadow = true;
				scene.add(wall);
			}
		}
	}

	// add axis arrowhelper 
	// var dir = new THREE.Vector3( 1, 0, 0 );
	// var origin = new THREE.Vector3( 0, 0, 0 );
	// var length = 100;

	// var xArrow = new THREE.ArrowHelper( dir, origin, length, "red" );
	// scene.add( xArrow );

	// dir = new THREE.Vector3( 0, 1, 0 );
	// origin = new THREE.Vector3( 0, 0, 0 );

	// var yArrow = new THREE.ArrowHelper( dir, origin, length, "darkgreen" );
	// scene.add( yArrow );

	// dir = new THREE.Vector3( 0, 0, 1 );
	// origin = new THREE.Vector3( 0, 0, 0 );

	// var zArrow = new THREE.ArrowHelper( dir, origin, length, "blue" );
	// scene.add( zArrow );


    // shadows
	renderer.shadowMapEnabled = true;
	directionalLight1.castShadow = true;
	directionalLight2.castShadow = true;
	floor.castShadow = true;
	floor.receiveShadow = true;

}

function createGlow(obj, colorString){
	// create custom material from the shader code in html

	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: 
		{ 
			"c":   { type: "f", value: 0.1 },
			"p":   { type: "f", value: 1.2 },
			glowColor: { type: "c", value: new THREE.Color(colorString) },
			viewVector: { type: "v3", value: camera.position }
		},
		vertexShader:   $('#vertexShader').text(),
		fragmentShader: $('#fragmentShader').text(),
		side: THREE.FrontSide,
		blending: THREE.AdditiveBlending,
		transparent: true
	});

	// var sphereGeom = new THREE.SphereGeometry(35, 32, 16);
	var cubeGeom = new THREE.CubeGeometry(55,55,55,2,2,2);
	var modifier = new THREE.SubdivisionModifier( 2 );
	modifier.modify( cubeGeom ); 

	var cubeGlow = new THREE.Mesh( cubeGeom, customMaterial);
    cubeGlow.position = obj.position;
    obj.glow = cubeGlow;
	scene.add( cubeGlow );
}

// my test to make fireball with simple random noise
// var fireball_list = [];
// var  uniforms; 

// function createFireBall(position){
// 	// create custom material from the shader code in html

// 	var attributes = {
// 	  displacement: {
// 	    type: 'f', // a float
// 	    value: [] // an empty array
// 	  }
// 	};

//     uniforms=
// 	{ 
// 		glowColor: { type: "c", value: new THREE.Color("#ffcf00") },
// 		// glowColor: { type: "c", texture: THREE.ImageUtils.loadTexture( 'explosion.png' ) },
// 		viewVector: { type: "v3", value: new THREE.Vector3( 0,0,0)},
// 		amplitude: { type: 'f', value: (2*Math.random()-1)}
// 	};


// 	var customMaterial = new THREE.ShaderMaterial( 
// 	{
// 	    uniforms: uniforms,
// 		attributes:     attributes,
// 		vertexShader:   $('#fb_vertexShader').text(),
// 		fragmentShader: $('#fb_fragmentShader').text(),
// 		// transparent: true
// 	});

// 	var sphereGeom = new THREE.SphereGeometry(12, 16, 16);

// 	var fireball = new THREE.Mesh( sphereGeom, customMaterial);
// 	fireball.startTime = Date.now();
//     fireball.position = position;
//     fireball_list.push(fireball);


// 	var verts = fireball.geometry.vertices;
// 	var values = attributes.displacement.value;
// 	for (var v = 0; v < verts.length; v++) {
// 	  values.push((2*Math.random()-1) * 30);
// 	}


// 	scene.add( fireball );
// }

// function updateFireBall(){
// 	uniforms.amplitude.value = 2*Math.random()-1;
// 	for(var i = 0; i<fireball_list.length; i++){
// 		var fb = fireball_list[i];
// 		if(Date.now()-fb.startTime >= 2000){
// 			fireball_list.splice(i,1);
// 			scene.remove(fb);
// 		}
// 	}
// }


var fireball_list = [];
var  uniforms; 

function createFireBall(position){
	// create custom material from the shader code in html

    uniforms = { 
	    tExplosion: { 
	      type: "t", 
	      value: 0,
	      // texture: THREE.ImageUtils.loadTexture( './images/explosion.png' )
	    },
	    time: { 
	      type: "f", 
	      value: 0.0 
	    }
    };


	var customMaterial = new THREE.ShaderMaterial( 
	{
	    uniforms: uniforms,
		vertexShader:   $('#perlin_vertexShader').text(),
		fragmentShader: $('#perlin_fragmentShader').text(),
		// transparent: true
	});

	// var sphereGeom = new THREE.SphereGeometry(12, 16, 16);
	var icoGeom = new THREE.IcosahedronGeometry( 15, 4 )

	var fireball = new THREE.Mesh(icoGeom, customMaterial);
	fireball.startTime = Date.now();
    fireball.position = position;
    fireball_list.push(fireball);

	scene.add( fireball );
}

function updateFireBall(){
	uniforms.time.value = .00025 * ( Date.now() - fireball_list[0].startTime );
	for(var i = 0; i<fireball_list.length; i++){

		var fb = fireball_list[i];
		// only show 2s
		if(Date.now()-fb.startTime >= 2000){
			fireball_list.splice(i,1);
			scene.remove(fb);
		}
	}
}

// add randomly generate walls
function mazeArray(){
	for(var i = 0; i < gridSizeX; i++){
		for(var j = 0; j < gridSizeY; j++){
			if(Math.random() < 0.3){
				wallGrid[ j*gridSizeY + i] = 1;
				var cubeMaterial =
				  new THREE.MeshLambertMaterial(
					{
					  color: "blue"
					});

				var cube = new THREE.Mesh(
					new THREE.CubeGeometry( cubeX,  cubeY, cubeZ), cubeMaterial);
				cube.position.x = i*cubeX -150;
				cube.position.y = j*cubeY -150;
				cube.position.z = cubeZ;

				scene.add(cube);
				// console.log(i,j);
			}
			else{
				wallGrid[ j*gridSizeY + i] = 0;
			}
		}
	}
}

// draw the target cubes 

var ai = [];
var aiGeo = new t.CubeGeometry(40, 40, 40);
function setupAI() {
	for (var i = 0; i < NUMAI; i++) {
		addAI("ai");
	}
	addAI("health");
	addAI("ice");
}

function addAI(aiType) {
	// console.log(aiType);
	if(aiType == "ai" ) {
		var aiTexture = new t.ImageUtils.loadTexture('images/face6.png');
	}
	else if(aiType == "health"){
		var aiTexture = new t.ImageUtils.loadTexture('images/medicine.png');
	}
	else if(aiType == "ice"){
		var aiTexture = new t.ImageUtils.loadTexture('images/ice.jpg');
	}

	var c = getMapSector(camera.position);
	var aiMaterial = new t.MeshBasicMaterial({/*color: "gold",*/map: aiTexture});

	var o = new t.Mesh(aiGeo, aiMaterial);
	o.castShadow = true;
	// o.receiveShadow = true;

	do {
		var x = getRandBetween(0, mapW-1);
		var z = getRandBetween(0, mapH-1);
	} while (map[x][z] > 0 || (x == c.x && z == c.z) || distance(x,z,c.x,c.z) < 2);
	x = Math.floor(x - mapW/2) * UNITSIZE;
	z = Math.floor(z - mapW/2) * UNITSIZE;
	o.position.set(x, UNITSIZE * 0.2, z);
	o.health = 100;
	//o.path = getAIpath(o);
	o.pathPos = 1;
	o.lastRandomX = Math.random();
	o.lastRandomZ = Math.random();
	o.lastShot = Date.now(); // Time for last shot
	o.aiType = aiType;
	o.freezeStart = Date.now()-10000;
	// console.log(aiType);
	// console.log(typeof(aiType));
	ai.push(o);
	scene.add(o);

	if(aiType == "health"){
		createGlow(o, YGLOW_COLOR);
	}
	if(aiType == "ice"){
		createGlow(o, BGLOW_COLOR);
	}
}


function playerWalk(event)
{
	//current position
	var v={};
	v.x = camera.position.x;
	v.z = camera.position.z;
	//move left
	if ( event.which == 37 ) 		
	{
		v.x -=MOVESPEED;
		if( !checkWallCollision(v)){
			camera.translateX(-MOVESPEED);
		}
	}	
	// move right
	else if ( event.which == 39 ) 
	{
		v.x +=MOVESPEED;
		if( !checkWallCollision(v)){
			camera.translateX(MOVESPEED);
		}
	}
	// move backward
	else if ( event.which == 40 ) 
	{
		v.z +=MOVESPEED;
		if( !checkWallCollision(v)){
			// camera.position.z += 10;
			camera.translateZ(MOVESPEED);
		}
	}
	// move forward
	else if ( event.which == 38 ) 
	{
		v.z -=MOVESPEED;
		if( !checkWallCollision(v)){
			camera.translateZ(-MOVESPEED);
		}
	}
	// console.log(camera.position);
	// else don't move paddle
}


// get the distance between two objects
function distance(x1, y1, x2, y2) {
	return Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
}

// get the position in 2D map
function getMapSector(v) {
	var x = Math.floor((v.x + UNITSIZE / 2) / UNITSIZE + mapW/2);
	var z = Math.floor((v.z + UNITSIZE / 2) / UNITSIZE + mapW/2);
	return {x: x, z: z};
}

/**
 * Check whether a Vector3 overlaps with a wall.
 *
 * @param v
 *   A THREE.Vector3 object representing a point in space.
 *   Passing cam.position is especially useful.
 * @returns {Boolean}
 *   true if the vector is inside a wall; false otherwise.
 */
function checkWallCollision(v) {
	var c = getMapSector(v);
	return map[c.x][c.z] > 0;
}

// rotate camera when mousemove
var mouseX = WIDTH/2;
var angleX = -Math.PI/4;
var incrementD = 2*Math.PI/WIDTH;

function onDocumentMouseMove(e) {
	// e.preventDefault();
	// console.log("width: "+WIDTH+"; height:"+HEIGHT+";");
	// console.log(e.clientX+"; "+e.clientY);
	// console.log(e.pageX+"; "+e.pageY);
	// console.log("--------------------");

    // calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = (e.clientX / WIDTH) * 2 - 1;
	mouse.y = - (e.clientY / HEIGHT) * 2 + 1;


	// degree for the view to rotate
	// angleX = (e.pageX - WIDTH/2) * 2*Math.PI/WIDTH;
    difference = mouseX-e.clientX;
    angleX-=incrementD*difference;
    mouseX = e.clientX;
    if(mouseX<=WIDTH/2-100&&difference>0){
        angleX-=incrementD*2.5;
    }
    if(mouseX>=WIDTH/2+100&&difference<0){
        angleX+=incrementD*2.5;
    }

	var targetPosition = new THREE.Vector3( 0, 0, 0 );

	targetPosition.x = camera.position.x + 10 * Math.cos( angleX );
	targetPosition.y = camera.position.y ;
	targetPosition.z = camera.position.z + 10  * Math.sin( angleX );

	camera.lookAt( targetPosition );
};

function onDocumentMouseOut(e) {
	// console.log("mouse out");
	runAnim = false;
	$("#pause").show();
}

//Get a random integer between lo and hi, inclusive.
//Assumes lo and hi are integers and lo is lower than hi.
function getRandBetween(lo, hi) {
 return parseInt(Math.floor(Math.random()*(hi-lo+1))+lo, 10);
}

function updateAI(){
	// console.log(ai[0].position);
	
	// Update AI.
	var t1 = new THREE.Vector3( 0, 0, 0 );
	var t2 = new THREE.Vector3( 0, 0, 0 );
	var t3 = new THREE.Vector3( 0, 0, 0 );
	var t4 = new THREE.Vector3( 0, 0, 0 );

	for (var i = ai.length-1; i >= 0; i--) {
		var a = ai[i];
		// if (a.health <= 0) {
		// 	ai.splice(i, 1);
		// 	scene.remove(a);
		// 	kills++;
		// 	$('#score').html(kills * 100);
		// 	addAI();
		// }


		if(a.aiType == "ai"){
			// Move AI
			if(Date.now() - a.freezeStart > 10000) {
				if(a.glow){ 
					scene.remove(a.glow); 
					a.glow = undefined;
				}

				var r = Math.random();
				if (r > 0.995) {
					a.lastRandomX = Math.random() * 2 - 1;
					a.lastRandomZ = Math.random() * 2 - 1;
				}
				
				t1.x =t2.x = t3.x = t4.x = a.position.x + AISPEED * a.lastRandomX;
				t1.y =t2.y = t3.y = t4.y= a.position.y;
				t1.z =t2.z = t3.z = t4.z= a.position.z + AISPEED * a.lastRandomZ;

				// var c = getMapSector(tmp_position);
		        t1.x += 20; t1.z +=20;
		        t2.x -=20; t2.z +=20;
		        t3.x +=20; t3.z -=20;
		        t2.x -=20; t4.z +=20;

				if (checkWallCollision(t1)|| checkWallCollision(t2)|| checkWallCollision(t3)|| checkWallCollision(t4)) {
					a.translateX(-2 * AISPEED * a.lastRandomX);
					a.translateZ(-2 * AISPEED * a.lastRandomZ);
					if(a.glow){
						a.glow.translateX(-2 * AISPEED * a.lastRandomX);
						a.glow.translateZ(-2 * AISPEED * a.lastRandomZ);					
					}
					a.lastRandomX = Math.random() * 2 - 1;
					a.lastRandomZ = Math.random() * 2 - 1;	
				}
				else{
					a.translateX(AISPEED * a.lastRandomX);
					a.translateZ(AISPEED * a.lastRandomZ);	
					if(a.glow){
						a.glow.translateX(AISPEED * a.lastRandomX);
						a.glow.translateZ(AISPEED * a.lastRandomZ);						
					}						
				}


				var c = getMapSector(a.position);
				if (c.x < -1 || c.x > mapW || c.z < -1 || c.z > mapH) {
					ai.splice(i, 1);
					setTimeout(function(){addAI("ai");}, 5000); 
					scene.remove(a);
				}
			}
	

			// Make AI shoot bullet
			// var cc = getMapSector(camera.position);
			// if (Date.now() > a.lastShot + 750 && distance(c.x, c.z, cc.x, cc.z) < 2 && aiShoot) {
			// 	createBullet(a);
			// 	a.lastShot = Date.now();
			// }

			// AI collision with player
			if(distance(a.position.x, a.position.z, camera.position.x, camera.position.z) <= SAFEDISTANCE){
				// decrease player's health
				$('#hurt').fadeIn(75);
				health -= 5;
				if (health < 0) health = 0;
                
                // remove this AI and randomly add a new one after 5s
				ai.splice(i, 1);
				setTimeout(function(){addAI("ai");}, 5000); 
				if(a.glow){scene.remove(a.glow);}
				scene.remove(a);

				$('#hurt').fadeOut(350);			
			}
		}

		// for medicine box
		else if(a.aiType == "health"){
			// rotate medicine box
			a.rotation.y += 0.05;
			a.glow.rotation.y += 0.05;

           // box picked up by player
			var c = getMapSector(a.position);
			if(distance(a.position.x, a.position.z, camera.position.x, camera.position.z) <= SAFEDISTANCE){

				// update health
				// console.log('pickup health');

				$('#heal').fadeIn(75);
				health = Math.min(100, health + 10);

				ai.splice(i, 1);
				setTimeout(function(){addAI("health");}, 5000); 
				if(a.glow){scene.remove(a.glow);}
				scene.remove(a);

				$('#heal').fadeOut(350);
			}
		}

		// pick up ice cube with freeze AI for 10s
		else if(a.aiType == "ice"){
			// rotate medicine box
			a.rotation.y += 0.05;
			a.glow.rotation.y += 0.05;

           // box picked up by player
			var c = getMapSector(a.position);
			if(distance(a.position.x, a.position.z, camera.position.x, camera.position.z) <= SAFEDISTANCE){

				// update health
				// console.log('pickup health');

				$('#heal').fadeIn(75);
				$('#heal').fadeOut(350);

				ai.splice(i, 1);
				setTimeout(function(){addAI("ice");}, 5000); 
				if(a.glow){scene.remove(a.glow);}
				scene.remove(a);

				for (var k = ai.length-1; k >= 0; k--){
					console.log(k);
					if(ai[k].aiType == "ai"){
					    createGlow(ai[k], BGLOW_COLOR);
						ai[k].freezeStart = Date.now();
						console.log(ai[k].freezeStart);
					}
				}

			}
		}

	}

}

var bullets = [];
var sphereMaterial = new t.MeshBasicMaterial({color: 0x333333});
var sphereGeo = new t.SphereGeometry(2, 6, 6);
// var raycaster = new THREE.Raycaster();
function createBullet(obj) {

	shot_gun.currentTime=0;
	shot_gun.play();

	if (obj === undefined) {
		obj = camera;
	}

	var sphere = new t.Mesh(sphereGeo, sphereMaterial);
	sphere.position.set(obj.position.x, UNITSIZE * 0.2, obj.position.z);

	if (obj instanceof t.Camera) {
		// raycaster.setFromCamera( mouse, camera );
		// sphere.ray = raycaster.ray;
		var vector = new t.Vector3(mouse.x, mouse.y, 1);
		projector.unprojectVector(vector, obj);
		sphere.ray = new t.Ray(
				obj.position,
				vector.sub(obj.position).normalize()
		);
	}
	else {
		var vector = camera.position.clone();
		sphere.ray = new t.Ray(
				obj.position,
				vector.sub(obj.position).normalize()
		);
	}
	sphere.owner = obj;

	bullets.push(sphere);
	scene.add(sphere);

	// return sphere;
}

function updateBullets() {
	// Update bullets. Walk backwards through the list so we can remove items.
	for (var i = bullets.length-1; i >= 0; i--) {
		var b = bullets[i], p = b.position, d = b.ray.direction;
			// console.log(p);
		if (checkWallCollision(p)) {
			bullets.splice(i, 1);
			scene.remove(b);
			continue;
		}

		// Bullet hits AI
		var hit = false;
		for (var j = ai.length-1; j >= 0; j--) {
			var a = ai[j];
			var v = a.geometry.vertices[0];
			var c = a.position;
			var x = Math.abs(v.x), z = Math.abs(v.z);
			// var low = c.x-x; var high =  c.x+x;
			// console.log(p.x + " " + low + " " + high);
			// low = c.z-z;  high =  c.z+z;
			// console.log(p.z + " " + low + " " + high);
			//console.log(Math.round(p.x), Math.round(p.z), c.x, c.z, x, z);
			if (p.x < c.x + x && p.x > c.x - x &&
					p.z < c.z + z && p.z > c.z - z && 
					a.aiType=="ai" && b.owner != a) {
			// if (distance(p.x, p.z, c.x, c.z) < 20 && b.owner != a) {	
				bullets.splice(i, 1);
				ai.splice(j, 1);

				// play sound
				blast.currentTime=0;
				blast.play();

				// wait for 5s to add a new AI
				setTimeout( function(){
					addAI("ai");
				}, 5000);
				// if(a.aiType == "health" && health < 100){health = Math.min(100, health+10);}
				scene.remove(b);

				createFireBall(a.position);

				// remove glow associated with the cube
				if(a.glow){scene.remove(a.glow);}
				scene.remove(a);


				hit = true;
				score += 100;
				$("#score").text(score);
				break;
			}
		}
		// // Bullet hits player
		// if (distance(p.x, p.z, camera.position.x, camera.position.z) < SAFEDISTANCE && b.owner != camera) {
		// 	$('#hurt').fadeIn(75);
		// 	health -= 5;
		// 	if (health < 0) health = 0;
		// 	// val = health < 25 ? '<span style="color: darkRed">' + health + '</span>' : health;
		// 	// $('#health').html(val);
		// 	bullets.splice(i, 1);
		// 	scene.remove(b);
		// 	$('#hurt').fadeOut(350);
		// }

		if (!hit) {
			b.translateX(BULLETMOVESPEED/5 * d.x);
			//bullets[i].translateY(speed * bullets[i].direction.y);
			b.translateZ(BULLETMOVESPEED/5 * d.z);
		}
	}	
}

// draw the mini map on screen with d3.js

var svg = d3.select("#mini_map").append("svg")
            .attr("width", 200)
            .attr("height", 200);

function drawMiniMap() {

    var obj_list = getMovingData();

	svg.selectAll("circle")
          .data(obj_list)
          .enter()
          .append("circle")
          .attr("cx", function (d) { return d.x*20 + 5; })
          .attr("cy", function (d) { return d.y*20 + 5; })
          .attr("r", 5)
          .style("fill", function(d) { return d.color; });

	wall_list = [];

	for (var i = 0; i < mapW; i++) {
		for (var j = 0, m = map[i].length; j < m; j++) {
			if (map[i][j] > 0) {
				wall_list.push({"x": i * 20, "y": j * 20});
		     }
		 }
	}
	// console.log(wall_list);

	svg.selectAll("rect")
	   .data(wall_list)
	   .enter()
	   .append("rect")
	   .attr("x", function(d){return d.x})
	   .attr("y", function(d){return d.y})
	   .attr("width", 20)
	   .attr("height", 20)
	   .style("fill", "grey");
}

function redrawMap(){

	var obj_list = getMovingData();
	// console.log(obj_list);

	// Make the changes
    var circles = svg.selectAll("circle")
	        .data(obj_list);

    circles.transition()
     .attr("cx", function(d) { return d.x*20 + 5; })
     .attr("cy", function(d) { return d.y*20 + 5; })
     .style("fill", function(d) { return d.color; });     

    circles.enter()
     .append("circle")
     .attr("r", 5)
     .attr("cx", function(d) { return d.x*20 + 5; })
     .attr("cy", function(d) { return d.y*20 + 5; })
     .style("fill", function(d) { return d.color; });

    circles.exit()
     .remove();
}

// get the position for player and targets
function getMovingData(){

	var obj_list = [];

	var c = getMapSector(camera.position);
	obj_list.push({"x":c.x, "y":c.z, "color" : "black"});

	for (var k = 0, n = ai.length; k < n; k++) {
		var e = getMapSector(ai[k].position);
		if(ai[k].aiType == "health"){
			obj_list.push({"x":e.x, "y":e.z, "color" : "white"});
		}
		else if(ai[k].aiType == "ice"){
			obj_list.push({"x":e.x, "y":e.z, "color" : "lightblue"});
		}
		else{
			obj_list.push({"x":e.x, "y":e.z, "color" : "red"});
		}
	}

	return obj_list;	
}

// Handle window resizing
$(window).resize(function() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	ASPECT = WIDTH / HEIGHT;
	if (camera) {
		camera.aspect = ASPECT;
		camera.updateProjectionMatrix();
	}
	if (renderer) {
		renderer.setSize(WIDTH, HEIGHT);
	}
	$('#instruction, #hurt').css({width: WIDTH, height: HEIGHT,});
});
