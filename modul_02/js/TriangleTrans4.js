// Globale variabler:

// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec3 a_Position;\n' +		//Dersom vec4 trenger vi ikke vec4(a_Position, 1.0) under.
  'uniform mat4 u_modelviewMatrix;\n' +
  'uniform mat4 u_projectionMatrix;\n' +
  'void main() {\n' +
  '  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' + 	// bruker prefiks u_ for � indikere uniform
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' + // Fargeverdi.
  '}\n';

var gl = null;
var canvas = null;

// Verteksbuffer:
var vertexBufferTriangle = null;
var vertexBufferCoord = null;
var COORD_BOUNDARY = 10;


// "Pekere" som brukes til � sende matrisene til shaderen:
var u_modelviewMatrix = null;
var u_projectionMatrix = null;
var u_FragColor = null;

// Matrisene:
var modelMatrix = null;
var viewMatrix = null;
var modelviewMatrix = null;
var projectionMatrix = null;

//Diverse
var rgba=[0,0,0,0];

function init() {
	// Hent <canvas> elementet
	canvas = document.getElementById('webgl');

	// Rendering context for WebGL:
	gl = getWebGLContext(canvas);
	if (!gl) {
		console.log('Fikk ikke tak i rendering context for WebGL');
		return false;
	}
	gl.viewport(0,0,canvas.width,canvas.height);
	modelMatrix = new Matrix4();
	viewMatrix = new Matrix4();
	modelviewMatrix = new Matrix4();
	projectionMatrix = new Matrix4();

	return true;
}

function initBuffers() {
	// 3 stk 3D vertekser:
	var triangleVertices = new Float32Array([
       -1, -1, 0,
       0, 1, 0,
       1, -1, 0
    ]);

	// Verteksbuffer:
	vertexBufferTriangle = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferTriangle);
	gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);

	vertexBufferTriangle.itemSize = 3; // NB!!
	vertexBufferTriangle.numberOfItems = 3; // NB!!
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	//KOORDINATSYSTEM:
	var coordVertices = new Float32Array([
		//x-aksen
		-COORD_BOUNDARY, 0.0, 0.0,
		COORD_BOUNDARY, 0.0, 0.0,

		//y-aksen:
		0.0, COORD_BOUNDARY, 0.0,
		0.0, -COORD_BOUNDARY, 0.0,

		//z-aksen:
		0.0, 0.0, COORD_BOUNDARY,
		0.0, 0.0, -COORD_BOUNDARY,
    ]);

	// Verteksbuffer for koordinatsystemet:
	vertexBufferCoord = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCoord);
	gl.bufferData(gl.ARRAY_BUFFER, coordVertices, gl.STATIC_DRAW);

	vertexBufferCoord.itemSize = 3; 		// NB!!
	vertexBufferCoord.numberOfItems = 6; 	// NB!!
	gl.bindBuffer(gl.ARRAY_BUFFER, null);	// NB!! M� kople fra n�r det opereres med flere buffer! Kopler til i draw().
}

function initShaderParameters() {
	// Kopler shaderparametre med Javascript-variabler:

	// Farge: u_FragColor (bruker samme farge p� alle piksler/fragmenter):
	u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

	// Matriser: u_modelviewMatrix & u_projectionMatrix
	u_modelviewMatrix = gl.getUniformLocation(gl.program, 'u_modelviewMatrix');
	u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');

	return true;
}

function drawCoord() {
	//NB! M� sette a_Position p� nytt ETTER at buffer er bundet:
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferCoord);
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	// Sl�r sammen modell & view til modelview-matrise:
	modelviewMatrix.set(viewMatrix).multiply(modelMatrix); // NB! rekkef�lge!

	// Sender matriser til shader:
	gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
	gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

	gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
	// Tegner koordinatsystem:
	gl.drawArrays(gl.LINES, 0, vertexBufferCoord.numberOfItems);
}

function drawTriangle() {
	//NB! M� sette a_Position p� nytt ETTER at buffer er bundet:
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferTriangle);
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);

	// Sl�r sammen modell & view til modelview-matrise:
	modelviewMatrix.set(viewMatrix).multiply(modelMatrix); // NB! rekkef�lge!

	// Sender matriser til shader:
	gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
	gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

	gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
	// Tegner trekant1:

	gl.drawArrays(gl.TRIANGLES, 0, vertexBufferTriangle.numberOfItems);
}

function setupCamera() {
	// Definerer en viewmatrise (kamera):
	// cuon-utils: Matrix4.prototype.setLookAt = function(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ)
	let eyeX=3, eyeY=3, eyeZ=5, centerX=0, centerY=0, centerZ=0, upX=0, upY=1, upZ=0;
	viewMatrix.setLookAt(eyeX, eyeY, eyeZ, centerX, centerY, centerZ, upX, upY, upZ);

	// Definerer en projeksjonsmatrise (frustum):
	// cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
	projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 10);
}

function draw() {

	gl.clear(gl.COLOR_BUFFER_BIT);
	//Enables depth testing
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    //Setter view & projection:
	setupCamera();

    //KOORDINATSYSTEM:
    modelMatrix.setIdentity();			//Model-matrisa.
	rgba = [ 0.0, 0.0, 0.0, 1.0 ]; 		//Farge.
	drawCoord();						//Tegn trekanten.

	// TREKANT0:
	modelviewMatrix.setIdentity();
	modelMatrix.setIdentity();
	//modelMatrix.setTranslate(0, 0, 0);
	rgba = [ 0.8, 0.3, 1.0, 1.0 ];
	drawTriangle();
}

function main() {

	if (!init())
		return;

	// Initialiser shadere (cuon-utils):
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Feil ved initialisering av shaderkoden.');
		return;
	}

	// Initialiserer verteksbuffer:
	initBuffers();

	// Binder shaderparametre:
	if (!initShaderParameters())
		return;

	// Setter bakgrunnsfarge:
	gl.clearColor(0.8549, 1.0, 0.498, 1.0); //RGBA

	// Tegn!
	draw();
}
