// Vertex shader program
// Her er point-size fjernet, kun aktuell når man tegner punkter.
let VSHADER_SOURCE =
   'attribute vec4 a_Position;\n' +
   'uniform mat4 u_modelMatrix;\n' +
   'void main() {\n' +
   '  gl_Position = u_modelMatrix * a_Position;\n' +
   '}\n';

// Fragment shader program
let FSHADER_SOURCE =
   'precision mediump float;\n' +
   'uniform vec4 u_FragColor;\n' +     //bruker prefiks u_ for � indikere uniform
   'void main() {\n' +
   '  gl_FragColor = u_FragColor;\n' + // Fargeverdi.
   '}\n';


//Globale variabler:
let coneVertices= null;
let coneIndices = null;
let indexBuffer = null;
let vertexBuffer = null;

function main() {
	// Hent <canvas> elementet
	let canvas = document.getElementById('webgl');

	// Rendering context for WebGL:
	let gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Fikk ikke tak i rendering context for WebGL');
		return;
	}
	// Initialiser shadere:
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Feil ved initialisering av shaderkoden.');
		return;
	}

	//Kopler farge:
	let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (u_FragColor < 0) {
		console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
		return;
	}
	let rgba = [0.3,0.5,1.0,1.0];
	gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
	gl.clearColor(0.0, 7.0, 0.4, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	//Initialiserer verteksbuffer:
	initBuffers(gl);

	//Kopler shadervariabler:
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	// Definerer en rotasjonsmatrise:
	let modelMatrix = new Matrix4();
	let tx = 0.8;
	let angle = 20;
	// Utfører: rotasjon x translasjon, dvs...
	// først translere for så å rotere om z-aksen: v' = R * T * v;
	//modelMatrix.setRotate(angle, 0, 0, 1);
	//modelMatrix.translate(tx, 0, 0);

	// Motsatt, translasjon x rotasjon,
	// dvs. først rotere og så translere: v' = T * R * v;
	modelMatrix.setTranslate(tx, 0, 0);
	modelMatrix.rotate(angle, 0, 0, 1);

	//Tester add & subtract:
	let u = Vector.create([5.0, 3.0, 0.0]);
	let v = Vector.create([4.0, -2.0 , 0.0]);
	let sumV = u.add(v);
	let diffV = u.subtract(v);

	//Kryssprod:
	let v1 = Vector.create([3.0, 0.0 , 0.0]);
	let v2 = Vector.create([0.0, 2.0, 0.0]);
	let w = v1.cross(v2); //= v2 x v1

	//Enhetsvektor og lengde:
	let v3 = Vector.create([5.0, 2.0 , 1.0]);
	let v3unit = v3.toUnitVector();
	let length = v3unit.distanceFrom([0,0,0]);

	//Prikkprodukt:
	//let u1 = Vector.create([1,2,3]);
	//let v1 = Vector.create([4,5,6]);
	//let u1 = Vector.create([1,0,0]);
	//let v1 = Vector.create([0,1,0]);
	let u1 = Vector.create([0.0, 5.0, 0.0]);
	v1 = Vector.create([5.0, 5.0, 0.0]);

	let dp1 = u1.dot(v1); //= 32?
	let u1L = u1.distanceFrom([0,0,0,]); 	//Lengden til u1
	let v1L = v1.distanceFrom([0,0,0,]);	//Lengden til v1
	let cosFi = dp1 / (u1L * v1L);			//Vinkelen mellom dem!
	// let angle = toDegrees(Math.acos(cosFi));

	//Tester scale:
	let a = Vector.create([9.0, 1.0, 0.0]);
	let fscale = 2.0;
	let vprod = a.multiply(fscale);

	// Kopler til shader:
	let u_modelMatrix = gl.getUniformLocation(gl.program, 'u_modelMatrix');
	// Sender xformMatrix til shader:
	gl.uniformMatrix4fv(u_modelMatrix, false, modelMatrix.elements);

	// Tegner firkanten vha. indeksbuffer og drawElements():
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.drawElements(gl.LINE_LOOP, coneIndices.length, gl.UNSIGNED_SHORT,0);
}

//NB! Legg merke til kall p� bindBuffer(..., null)
function initBuffers(gl) {
  //n stk 3D vertekser:
  coneVertices = new Float32Array([
	0.75, 0, 0,
	-0.75, 0.5, 0,
	-0.75, 0.4045085,  0.2938925,
	-0.75, 0.1545085,  0.4755285,
	-0.75, -0.1545085, 0.4755285,
	-0.75, -0.4045085, 0.2938925,
	-0.75, -0.5, 0.0,
	-0.75, -0.4045085, -0.2938925,
	-0.75, -0.1545085, -0.4755285,
	-0.75, 0.1545085,  -0.4755285,
	-0.75, 0.4045085,  -0.2938925
  ]);
  //Indekser som utgj�r en Cone:
  coneIndices = new Uint16Array([
     0, 1, 2,
     0, 2, 3,
     0, 3, 4,
     0, 4, 5,
     0, 5, 6,
     0, 6, 7,
     0, 7, 8,
     0, 8, 9,
     0, 9, 10,
     0, 10, 1
  ]);

  // Verteksbuffer:
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, coneVertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  //Indeksbuffer:
  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, coneIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}


