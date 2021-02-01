// MultiPoint.js
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

    //Initialiserer verteksbuffer:
    var n = initVertexBuffers(gl);

    //Koper punktstørrelse og farge:
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

    // Sender punktstørrelsen og farge til shaderen:
    gl.vertexAttrib1f(a_PointSize, 10.0);
    var rgba = [0.3, 0.5, 1.0, 1.0];
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.clearColor(0.0, 7.0, 0.4, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // Tegner n punkter:
    gl.drawArrays(gl.POINTS, 0, 10);
    gl.drawArrays(gl.LINES, endPOINTS, 4);
    gl.drawArrays(gl.LINE_STRIP, endLINES, 6);
    gl.drawArrays(gl.TRIANGLE_STRIP, endLINE_STRIP, 5);
}

var endPOINTS, endLINES, endLINE_STRIP, endTRIANGLE_STRIP;

function initVertexBuffers(gl) {
    const cacheVertices = [], verticesLength = 3;

    // Draw 10 random points
    for (i = 0, c = 0; i < 10; i++)
        for (j = 1; j <= 3; j++) {
            if (j !== 3)
                cacheVertices[c] = Math.random() * (0.9 - (-0.9)) + (-0.9);
            else
                cacheVertices[c] = 0.0; // z-value
            c++;
        }
    endPOINTS = cacheVertices.length / verticesLength;
    console.log("pointEnd=" + endPOINTS)

    // Draw 2 lines using LINES
    cacheVertices.push(
        -0.9, 0.9, 0.0,
        0.9, -0.9, 0.0);
    cacheVertices.push(
        -0.9, -0.9, 0.0,
        0.9, 0.9, 0.0);
    endLINES = cacheVertices.length / verticesLength;
    console.log("lineEnd=" + endLINES)

    // Draw 3 lines using LINES_STRIP
    cacheVertices.push(
        -0.9, 0.0, 0.0,
        -0.75, 0.0, 0.0,
        -0.75, 0.15, 0.0,
        -0.60, 0.15, 0.0,
        -0.60, 0.00, 0.0,
        -0.45, 0.00, 0.0
    );
    endLINE_STRIP = cacheVertices.length / verticesLength;
    console.log("lineStripEnd="+endLINE_STRIP)

    // Draw 3 connected triangles using TRIANGLE_STRIP
    cacheVertices.push(
        -0.50, 0.90, 0.0,
        -0.40, 0.80, 0.0,
        -0.30, 0.90, 0.0,

        -0.20, 0.80, 0.0,
        -0.10, 0.90, 0.0
    )
    endTRIANGLE_STRIP = cacheVertices.length / verticesLength;
    console.log("triangleStripEnd="+endTRIANGLE_STRIP)



    var vertices = new Float32Array(cacheVertices.length);
    for (i = 0; i < cacheVertices.length; i++)
        vertices[i] = cacheVertices[i];

    var n = vertices.length / 3; // Antall vertekser

    // Oppretter et bufferobjekt:
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Fikk ikke laget et bufferobjekt!?');
        return -1;
    }

    // Binder bufferobjektet:
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Skriver til bufferobjektet:
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // Finner posisjonen til a_Position i shaderen:
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Fant ikke parametret a_Position i shaderen!?');
        return -1;
    }

    // Kople posisjonsparametret til bufferobjektet:
    // 3=ant. Floats per verteks
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // Enabler bufret:
    gl.enableVertexAttribArray(a_Position);
    return n;
}

// function appendFloat32Array(float32ArrToCopy, extraSize) {
//     var cachefloat32Array = new Float32Array[float32ArrToCopy.length() + extraSize];
//     for (i = 0; i < float32ArrToCopy.length; i++)
//         cachefloat32Array[i] = float32ArrToCopy[i];
//     return cachefloat32Array;
// }