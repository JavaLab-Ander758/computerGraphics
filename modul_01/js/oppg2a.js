// Vertex shader program.
// Her er point-size fjernet, kun aktuell når man tegner punkter.
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +		// Innkommende verteksfarge.
    'varying vec4 v_Color;\n' +			// NB! Bruker varying.
    'void main() {\n' +
    '  gl_Position = a_Position;\n' + 	// Verteksen.
    '  v_Color = a_Color;\n' + 			// NB! Setter varying = innkommende verteksfarge.
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +			// NB! Interpolert fargeverdi.
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' + 		// Setter gl_FragColor = Interpolert fargeverdi.
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

    //Rensker skjermen:
    gl.clearColor(0.0, 7.0, 0.4, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tegner trekanter:
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawArrays(gl.TRIANGLES, 3, 3);
    gl.drawArrays(gl.TRIANGLES, 6, 3);
}

function initVertexBuffers(gl) {
    //3 stk 2D vertekser:
    var vertices = new Float32Array([
        0.7, 0.5, 0,
        -0.5, -0.9, 0,
        0.5, -0.5, 0,

        -0.3, 0.6, 0,
        -0.1, -0.9, 0,
        0.5, -0.8, 0,

        0.6, -0.3, 0,
        0.9, -0.8, 0,
        0.6, -0.8, 0
    ]);

    var colors = new Float32Array([
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,
        1.0, 1.0, 0.0, 1.0,

        0.0, 1.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0,
        0.0, 1.0, 1.0, 1.0,

        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0,
        0.0, 0.0, 0.0, 1.0
    ]);




    let n = 3; // Antall vertekser

    //Posjisjonbufret
    //Opretter buffer
    let vertextBuffer = gl.createBuffer();

    //Binderbuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, vertextBuffer);

    //Skriver data til buffret
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');

    //Koble posisjonsparametret til bufferobjektet:
    // 3= ant. Floats per vertekst
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    //Colorbufret
    //Opprette en buffer
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');

    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color)
    return n;
}

