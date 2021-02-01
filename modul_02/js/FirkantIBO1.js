// Vertex shader program
// Her er point-size fjernet, kun aktuell når man tegner punkter.
let VSHADER_SOURCE =
   'attribute vec4 a_Position;\n' +
   'void main() {\n' +
   '  gl_Position = a_Position;\n' + 	// Verteksen.
   '}\n';

// Fragment shader program
let FSHADER_SOURCE =
   'precision mediump float;\n' +
   'uniform vec4 u_FragColor;\n' +     //bruker prefiks u_ for � indikere uniform
   'void main() {\n' +
   '  gl_FragColor = u_FragColor;\n' + // Fargeverdi.
   '}\n';


//Globale variabler:
let squareVertices= null;
let squareIndices = null;
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

	// Tegner firkanten vha. indeksbuffer og drawElements():
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.drawElements(gl.TRIANGLES, squareIndices.length, gl.UNSIGNED_SHORT,0);
}

//NB! Legg merke til kall p� bindBuffer(..., null)
function initBuffers(gl) {
  //3 stk 3D vertekser:
  squareVertices = new Float32Array([
	-0.5,0.5,0.0, 	//�vre venstre hj�rne
	0.5,0.5,0.0,	//�vre h�yre hj�rne
	-0.5,-0.5,0.0,	//nedre venstre hj�rne
	0.5,-0.5,0.0	//nedre h�yre hj�rne
  ]);

  //Indekser som utgj�r 2 trekanter:
  squareIndices = new Uint16Array([0,2,3,0,3,1]); //NB! husk at en indeks refererer en "hel" verteks (tre verdier).

  // Verteksbuffer:
  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, squareVertices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  //Indeksbuffer:
  indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, squareIndices, gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
}
