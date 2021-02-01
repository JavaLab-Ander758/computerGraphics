// Verteksshader:
var VSHADER_SOURCE =
	'attribute vec4 a_Position;\n'
	+ 'attribute vec4 a_Color;\n'
	+ 'varying vec4 v_Color;\n'
	+ 'void main() {\n'
	+ '  gl_Position = a_Position;\n'
	+ '  v_Color = a_Color;\n'
	+ '}\n';

// Fragmentshader:
var FSHADER_SOURCE =
	'precision mediump float;\n'
	+ 'varying vec4 v_Color;\n'
	+ 'void main() {\n'
	+ '  gl_FragColor = v_Color;\n'
	+ '}\n';


function main() {
	var gl;
	var vertexBuffer;
	var canvas = document.getElementById('webgl');
	gl = getWebGLContext(canvas);
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Feil ved initialisering av shaderkoden.');
		return;
	}
	//Initialiserer verteksbuffer:
	var vertices = new Float32Array([
		0.0, 0.5, 0.0,  0.0, 1.0, 0.0, 1.0, //x,y,z, rgba
		-0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 1.0, //x,y,z, rgba
		0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 1.0  //x,y,z, rgba
	]);
	//Oppretter verteksbuffer: binder og skriver data til bufret:
	vertexBuffer = gl.createBuffer();
	vertexBuffer.antallVertekser = vertices.length / 7;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	//Rensker skjermen:
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	// Kopler posisjonsparametret til bufferobjektet:
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	var stride = (3 + 4) * 4;
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(a_Position);
	// Kople fargeparametret til bufferobjektet:
	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	var colorOfset = 3 * 4;
	gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, stride, colorOfset);
	gl.enableVertexAttribArray(a_Color);
	// Tegner:
	gl.drawArrays(gl.TRIANGLES, 0, vertexBuffer.antallVertekser);
}

function initBuffers(gl) {
	  //3 stk 2D vertekser:
	  let vertices = new Float32Array([
		0.0, 0.5, 0,
		-0.5, -0.5, 0,
		0.5, -0.5, 0]);

	  //Farge til verteksene:
	  let colors = new Float32Array([
		1.0, 0.0, 0.0, 1.0,		//Rød  (RgbA)
	    0.0, 1.0, 0.0, 1.0,		//Grønn (rGbA)
	    0.0, 0.0, 1.0, 1.0]);	//Blå 	(rgBA)

	  let n = 3; // Antall vertekser

	  //POSISJONSBUFRET: oppretter, binder og skriver data til bufret:
	  let vertexBuffer = gl.createBuffer();
	  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	  let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	  // Kople posisjonsparametret til bufferobjektet:
	  // 3=ant. Floats per verteks
	  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	  gl.enableVertexAttribArray(a_Position);

	  //COLORBUFRET: oppretter, binder og skriver data til bufret:
	  let colorBuffer = gl.createBuffer();
	  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
	  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
	  let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	  // Kople posisjonsparametret til bufferobjektet: 4=ant. Floats per verteks
	  gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
	  gl.enableVertexAttribArray(a_Color);
	  return n;
}
