// ColorPoin1.js

// Vertex shader program
var VSHADER_SOURCE =
   'attribute vec4 a_Position;\n' +
   'attribute float a_PointSize; \n' +
   'void main() {\n' +
   '  gl_Position = a_Position;\n' + 	// Verteksen.
   '  gl_PointSize = a_PointSize;\n' +
   '}\n';
 
// Fragment shader program
var FSHADER_SOURCE =
   'precision mediump float;\n' +
   'uniform vec4 u_FragColor;\n' +     //bruker prefiks u_ for å indikere uniform
   'void main() {\n' +
   '  gl_FragColor = u_FragColor;\n' + // Fargeverdi.
   '}\n';
 
function main() {
	// Hent <canvas> elementet
	var canvas = document.getElementById('webgl');

	// Rendering context for WebGL:
	var gl = getWebGLContext(canvas); 
	if (!gl) {
		console.log('Fikk ikke tak i rendering context for WebGL');
		return;
	}
	// Initialiser shadere:
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Feil ved initialisering av shaderkoden.');
		return;
	}
	
	// Get the storage location of attribute variable
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Fant ikke parametret a_Position i shaderen!?');
		return;
	}
	var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
	if (a_PointSize < 0) {
		console.log('Fant ikke parametret a_PoinSize i shaderen!?');
		return;
	}
	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (u_FragColor < 0) {
		console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
		return;
	}
	
	// Send vertexposisjonen til parametret a_Position i shaderen:
	gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
	gl.vertexAttrib1f(a_PointSize, 50.0);
	var rgba = [1.0, 1.0, 0.0, 1.0];
	gl.uniform4f(u_FragColor, rgba[0],rgba[1],rgba[2],rgba[3]);
	
	// Set the color for clearing <canvas>
	gl.clearColor(0.0, 7.0, 0.4, 1.0);
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Tegner et punkt:
	gl.drawArrays(gl.POINTS, 0, 1);
}