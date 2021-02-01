// HelloCanvas.js 
// 
function main() {  
	// Hent <canvas> elementet
	var canvas = document.getElementById('webgl');
	// Rendering context for WebGL:
	var gl = getWebGLContext(canvas); //Ligger i cuon-utils.js ...
	//var gl = canvas.getContext("experimental-webgl");
	if (!gl) {
		console.log('Fikk ikke tak i rendering context for WebGL');
		return;
	}
	// Definerer fargen som brukes når skjermen renskes:
	gl.clearColor(0.3, 0.7, 0.0, 1.0);
	// Rensk skjermen/<canvas>
	gl.clear(gl.COLOR_BUFFER_BIT);
}