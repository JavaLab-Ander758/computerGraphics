// Vertex shader program.
// Her er point-size fjernet, kun aktuell når man tegner punkter.
var VSHADER_SOURCE =
   'attribute vec4 a_Position;\n' +
   'void main() {\n' +
   '  gl_Position = a_Position;\n' + 	// Verteksen.
   '}\n';

// Fragment shader program
var FSHADER_SOURCE =
   'precision mediump float;\n' +
   'uniform vec4 u_FragColor;\n' +     // Bruker prefiks u_ for å indikere uniform
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
	
	//Initialiserer verteksbuffer:
	var n = initVertexBuffers(gl);
	
	//Kopler til fargeattributt:
	var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
	if (u_FragColor < 0) {
		console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
		return;
	}
	var rgba = [0.3, 0.5, 1.0, 1.0];
    //Sender inn fargeverdi:
	gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    //Rensker skjermen:
	gl.clearColor(0.0, 7.0, 0.4, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Tegner trekanter:
	gl.drawArrays(gl.TRIANGLES, 0, n);
}

function initVertexBuffers(gl) {
	  //3 stk 2D vertekser:
	  var vertices = new Float32Array([
		0.7, 0.5, 0, 
		-0.5, -0.9, 0, 
		0.5, -0.5, 0,
		-0.3, 0.6, 0, 
		-0.1, -0.9, 0, 
		0.5, -0.8, 0
		]);
	  
	  var n = vertices.length / 3; // Antall vertekser, hver verteks består av 3 floats.
	  
	  // Oppretter et bufferobjekt:
	  var positionBuffer = gl.createBuffer();
	  if (!positionBuffer) {
		  console.log('Fikk ikke laget et bufferobjekt!?');
		  return -1;
	  }
	  
	  // Binder bufferobjektet:
	  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	  
	  // Skriver til bufferobjektet:
	  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

	  // Finner posisjonen til a_Position i shaderen:
	  var posAttrib = gl.getAttribLocation(gl.program, 'a_Position');
	  if (posAttrib < 0) {
		console.log('Fant ikke parametret a_Position i shaderen!?');
		return -1;
	  }
	  // Kople verteksattributtett til bufferobjektet:
	  var floatsPerVertex = 3;
	  gl.vertexAttribPointer(posAttrib, floatsPerVertex, gl.FLOAT, false, 0, 0);
	  
	  // Enabler verteksshaderattributtpekeren:
	  gl.enableVertexAttribArray(posAttrib);
		
	  // Kopler fra bufferobjektet:
	  gl.bindBuffer(gl.ARRAY_BUFFER, null);
	  
	  return n;
}

