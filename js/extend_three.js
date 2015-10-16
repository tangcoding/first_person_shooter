// how to extend object on three.js
function AI(){
	this.texture = new THREE.ImageUtils.loadTexture('images/face1.jpg');
	this.material = new THREE.MeshBasicMaterial({map: this.texture});
	this.geometry = new THREE.BoxGeometry(40, 40, 40);	
	this.shapeType = "ai";
	this.freezeStart = Date.now() ;
	this.lastRandomX = -0.1;
	this.lastRandomZ = 0.1;	
	this.glow = {};	
	THREE.Mesh.call( this, this.geometry, this.material);
};

AI.prototype = Object.create(THREE.Mesh.prototype);

AI.prototype.add2scence = function(camera,map){
	var c = camera.position;
	do {
		var x = getRandBetween(0, mapW-1);
		var z = getRandBetween(0, mapH-1);
	} while (map[x][z] > 0 || (x == c.x && z == c.z) || distance(x,z,c.x,c.z) < 2);
	x = Math.floor(x - mapW/2) * UNITSIZE;
	z = Math.floor(z - mapW/2) * UNITSIZE;
	this.position.set(x, UNITSIZE * 0.2, z);
	aiParent.add(this);
	// console.log("lala:", aiParent.children.length);
};