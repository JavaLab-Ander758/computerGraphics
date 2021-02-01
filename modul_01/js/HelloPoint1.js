// HelloPoint1.js
// Tegner et punkt...

// Vertex shader program
var VSHADER_SOURCE =
   'void main() {\n' +
   '  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' + 	// Koordinater.
   '  gl_PointSize = 10.0;\n' +             		// Setter punktstørrelse.
   '}\n';

// Fragment shader program
var FSHADER_SOURCE =
   'void main() {\n' +
   '  gl_FragColor = vec4(0.6, 1.0, 0.4, 1.0);\n' + // Fargeverdi.
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
	
	// Set the color for clearing <canvas>
	gl.clearColor(0.0, 7.0, 0.4, 1.0);
	// Clear <canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Tegner et punkt:
	gl.drawArrays(gl.POINTS, 0, 1);
}