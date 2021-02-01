// Globale variabler:

// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec3 a_Position;\n' +		//Dersom vec4 trenger vi ikke vec4(a_Position, 1.0) under.

    'attribute vec4 a_Color;\n' +		// Innkommende verteksfarge.


    'uniform mat4 u_modelviewMatrix;\n' +
    'uniform mat4 u_projectionMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' + 	// bruker prefiks u_ for å indikere uniform

    'varying vec4 v_Color;\n' +			// NB! Interpolert fargeverdi.

    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' + // Fargeverdi.
    '}\n';

var gl = null;
var canvas = null;

// Verteksbuffer:
var vertexBuffer = null;

// "Pekere" som brukes til å sende matrisene til shaderen:
var u_modelviewMatrix = null;
var u_projectionMatrix = null;
var u_FragColor = null;

// Matrisene:
var modelMatrix = null;
var viewMatrix = null;
var modelviewMatrix = null; //sammenslått modell- og viewmatrise.
var projectionMatrix = null;

function init() {
    // Hent <canvas> elementet
    canvas = document.getElementById('webgl');

    // Rendering context for WebGL:
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Fikk ikke tak i rendering context for WebGL');
        return false;
    }

    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelviewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    return true;
}
var endLinesVisualisation, endTriangles;
function initBuffer() {

    // Kube vertekser
    let COORD_BOUNDARY = 4;
    let cacheVertices = [
        //x-aksen
        -COORD_BOUNDARY, 0.0, 0.0,
        COORD_BOUNDARY, 0.0, 0.0,
        //y-aksen:
        0.0, COORD_BOUNDARY, 0.0,
        0.0, -COORD_BOUNDARY, 0.0,
        //z-aksen:
        0.0, 0.0, COORD_BOUNDARY,
        0.0, 0.0, -COORD_BOUNDARY,
    ];
    endLinesVisualisation = cacheVertices.length / 3;

    cacheVertices.push(
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        -1.0, -1.0, -1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
         1.0, -1.0,  1.0
    );
    endTriangles = (cacheVertices.length / 3) - endLinesVisualisation;



    vertices = new Float32Array(cacheVertices.length);
    for (i = 0; i < cacheVertices.length; i++)
        vertices[i] = cacheVertices[i];
    var colors = new Float32Array([
        0.0, 1.0, 0.0, 0.5
    ]);

    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
    let a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    // Kople posisjonsparametret til bufferobjektet: 4=ant. Floats per verteks
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);


    // Verteksbuffer:
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    vertexBuffer.itemSize = 3; // NB!!
    vertexBuffer.numberOfItems = 3; // NB!!

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function bindShaderParameters() {
    // Kopler shaderparametre med Javascript-variabler:

    // Farge: u_FragColor (bruker samme farge på alle piksler/fragmenter):
    var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (u_FragColor < 0) {
        console.log('Fant ikke uniform-parametret u_FragColor i shaderen!?');
        return false;
    }
    var rgba = [ 1.0, 1.0, 0.0, 1.0 ];
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Matriser: u_modelviewMatrix & u_projectionMatrix
    u_modelviewMatrix = gl.getUniformLocation(gl.program, 'u_modelviewMatrix');
    u_projectionMatrix = gl.getUniformLocation(gl.program, 'u_projectionMatrix');

    return true;
}

function draw() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Posisjon: a_Position
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Definerer modellmatrisa (translasjon):
    modelMatrix.setIdentity();//
    modelMatrix.translate(0, 0, 0);
    modelMatrix.scale(0.5, 0.5, 0.5);

    // Definerer en viewmatrise (kamera):

    var eyeX=2, eyeY=2, eyeZ=2;
    var lookX=1, lookY=1, lookZ=1;
    var upX=0, upY=1, upZ=0;
    viewMatrix.setLookAt(eyeX, eyeY, eyeZ, lookX, lookY, lookZ, upX, upY, upZ);


    // Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkefølge!
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 100);
    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    gl.drawArrays(gl.LINES, 0, endLinesVisualisation);
    gl.drawArrays(gl.TRIANGLES, endLinesVisualisation, endTriangles)
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
    initBuffer();

    // Binder shaderparametre:
    if (!bindShaderParameters())
        return;

    // Setter bakgrunnsfarge:
    gl.clearColor(0.3, 0.2, 0.4, 1.0); //RGBA

    // Tegn!
    draw();
}