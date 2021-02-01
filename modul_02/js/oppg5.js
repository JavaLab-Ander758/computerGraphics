"use strict";

// Verteksshader:
let VSHADER_SOURCE =
    'attribute vec3 a_Position;\n' +	// Innkommende verteksposisjon.
    'attribute vec4 a_Color;\n' +		// Innkommende verteksfarge.
    'uniform mat4 u_modelviewMatrix;\n' +
    'uniform mat4 u_projectionMatrix;\n' +
    'varying vec4 v_Color;\n' +			// NB! Bruker varying.
    'void main() {\n' +
    '  gl_Position = u_projectionMatrix * u_modelviewMatrix * vec4(a_Position,1.0);\n' +
    '  v_Color = a_Color;\n' + 			// NB! Setter varying = innkommende verteksfarge.
    '}\n';

// Fragmentshader:
let FSHADER_SOURCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +			// NB! Interpolert fargeverdi.
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' + 	// Setter gl_FragColor = Interpolert fargeverdi.
    '}\n';

let gl = null;
let canvas = null;

// Kameraposisjon:
let camPosX = 100;
let camPosY = 360;
let camPosZ = 700;
// Kamera ser mot ...
let lookAtX = 0;
let lookAtY = 100;
let lookAtZ = 0;
// Kameraorientering:
let upX = 0;
let upY = 1;
let upZ = 0;

// Tar vare på tastetrykk:
let currentlyPressedKeys = [];

// Verteksbuffer:
let xzplanePositionBuffer = null;
let xzplaneColorBuffer = null;

let cubePositionBuffer = null;
let cubeColorBufferRed = null;
let cubeColorBufferGreen = null;
let cubeColorBufferBlue = null;

let coordPositionBuffer = null;
let coordColorBuffer = null;

let COORD_BOUNDARY = 1000;
let width = 500;
let height = 500;

// "Pekere" som brukes til ? sende matrisene til shaderen:
let u_modelviewMatrix = null;
let u_projectionMatrix = null;
let u_FragColor = null;

// Matrisene:
let modelMatrix = null;
let viewMatrix = null;
let modelviewMatrix = null;
let projectionMatrix = null;

//Animasjon:
let yRot = 0.0;
let lastTime = 0.0;
let scale = 1.0;
let bluePrintEnabled = false;
let leftArmRotationAngle = 0;
let leftArmRotationEnabled = false;

let GPU_VENDOR = "N/A";

//Variabel for å beregne og vise FPS:
let fpsData = new Object(); //Alternativt: let fpsData = {};   //Setter fpsData til en tomt objekt.

function initContext() {
    // Hent <canvas> elementet
    canvas = document.getElementById("webgl");
    // document.write(getUnmaskedInfo(gl).renderer + "<br>");
    // GPU_VENDOR = gl.getParameter(dbgRenderInfo.UNMASKED_VENDOR_WEBGL);

    // Rendering context for WebGL:
    gl = getWebGLContext(canvas);
    if (!gl) {
        console.log("Fikk ikke tak i rendering context for WebGL");
        return false;
    }

    gl.viewport(0, 0, canvas.width, canvas.height);

    document.addEventListener('keyup', handleKeyUp, false);
    document.addEventListener('keydown', handleKeyDown, false);
    document.addEventListener("keypress", function(event) {
        if (event.code === 'Space') {
            if (bluePrintEnabled) {
                bluePrintEnabled = false;
                console.log("BLUEPRINT_DISABLED")
            }
            else {
                bluePrintEnabled = true;
                console.log("BLUEPRINT_ENABLED")
            }
        }
        if (event.code === 'KeyF') {
            // leftArmRotationAngle --;
            // console.log('F - ' + leftArmRotationAngle)
            if (leftArmRotationAngle > -45) {
                leftArmRotationAngle --;
                console.log('F - ' + leftArmRotationAngle)
            }
        }
        if (event.code === 'KeyG') {
            // leftArmRotationAngle ++;
            // console.log('G - ' + leftArmRotationAngle)
            if (leftArmRotationAngle < 45) {
                leftArmRotationAngle ++;
                console.log('G - ' + leftArmRotationAngle)
            }
        }
    });
    return true;
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}

function setupCamera() {
    // VIEW-matrisa:
    // cuon-utils: Matrix4.prototype.setLookAt = function(eyeX, eyeY, eyeZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ)
    viewMatrix.setLookAt(camPosX, camPosY, camPosZ, lookAtX, lookAtY, lookAtZ, upX, upY, upZ);

    // PROJECTION-matrisa:
    // cuon-utils: Matrix4.prototype.setPerspective = function(fovy, aspect, near, far)
    projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1.0, 10000);
}

function initXZPlaneBuffers() {
    let xzplanePositions = new Float32Array([
        -width / 2, 0, height / 2,
        width / 2, 0, height / 2,
        -width / 2, 0, -height / 2,
        width / 2, 0, -height / 2
    ]);
    // Farger:
    let xzplaneColors = new Float32Array([
        1, 0.222, 0, 0.6,
        1, 0.222, 0, 0.6,
        1, 0.222, 0, 0.6,
        1, 0.222, 0, 0.6
    ]);
    // Position buffer:
    xzplanePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xzplanePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xzplanePositions, gl.STATIC_DRAW);
    xzplanePositionBuffer.itemSize = 3; // NB!!
    xzplanePositionBuffer.numberOfItems = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    // Color buffer:
    xzplaneColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xzplaneColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, xzplaneColors, gl.STATIC_DRAW);
    xzplaneColorBuffer.itemSize = 4; // NB!!
    xzplaneColorBuffer.numberOfItems = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

// Pass RGB as values when generating colorArray
function initCubeBuffers() {
    cubePositionBuffer = gl.createBuffer();
    cubePositionBuffer.itemSize = 3;

    let cubePositions = new Float32Array([
        -10.0, -10.0, -10.0,
        -10.0, -10.0, 10.0,
        -10.0, 10.0, 10.0,

        10.0, 10.0, -10.0,
        -10.0, -10.0, -10.0,
        -10.0, 10.0, -10.0,

        10.0, -10.0, 10.0,
        -10.0, -10.0, -10.0,
        10.0, -10.0, -10.0,

        10.0, 10.0, -10.0,
        10.0, -10.0, -10.0,
        -10.0, -10.0, -10.0,

        -10.0, -10.0, -10.0,
        -10.0, 10.0, 10.0,
        -10.0, 10.0, -10.0,

        10.0, -10.0, 10.0,
        -10.0, -10.0, 10.0,
        -10.0, -10.0, -10.0,

        -10.0, 10.0, 10.0,
        -10.0, -10.0, 10.0,
        10.0, -10.0, 10.0,

        10.0, 10.0, 10.0,
        10.0, -10.0, -10.0,
        10.0, 10.0, -10.0,

        10.0, -10.0, -10.0,
        10.0, 10.0, 10.0,
        10.0, -10.0, 10.0,

        10.0, 10.0, 10.0,
        10.0, 10.0, -10.0,
        -10.0, 10.0, -10.0,

        10.0, 10.0, 10.0,
        -10.0, 10.0, -10.0,
        -10.0, 10.0, 10.0,

        10.0, 10.0, 10.0,
        -10.0, 10.0, 10.0,
        10.0, -10.0, 10.0
    ]);
    console.log(cubePositions.length / cubePositionBuffer.itemSize)

    var rColorCache = [], gColorCache = [], bColorCache = [];
    for (var i = 0; i < cubePositions.length / 3; i++) {
        rColorCache.push(1.0, 0.0, 0.0, 1.0);
        gColorCache.push(0.0, 1.0, 0.0, 1.0);
        bColorCache.push(0.0, 0.0, 1.0, 1.0);
    }
    var rTriangleColors = new Float32Array(rColorCache.length);
    var gTriangleColors = new Float32Array(gColorCache.length);
    var bTriangleColors = new Float32Array(bColorCache.length);
    for (i = 0; i < rColorCache.length; i++) {
        rTriangleColors[i] = rColorCache[i];
        gTriangleColors[i] = gColorCache[i];
        bTriangleColors[i] = bColorCache[i];
    }

    // Position buffer:
    gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, cubePositions, gl.STATIC_DRAW);
    cubePositionBuffer.numberOfItems = cubePositions.length / cubePositionBuffer.itemSize; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Color buffer:
    cubeColorBufferRed = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufferRed);
    gl.bufferData(gl.ARRAY_BUFFER, rTriangleColors, gl.STATIC_DRAW);
    cubeColorBufferRed.itemSize = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    cubeColorBufferGreen = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufferGreen);
    gl.bufferData(gl.ARRAY_BUFFER, gTriangleColors, gl.STATIC_DRAW);
    cubeColorBufferGreen.itemSize = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    cubeColorBufferBlue = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufferBlue);
    gl.bufferData(gl.ARRAY_BUFFER, bTriangleColors, gl.STATIC_DRAW);
    cubeColorBufferBlue.itemSize = 4; // NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initCoordBuffers() {
    let coordPositions = new Float32Array([
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
    coordPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coordPositions, gl.STATIC_DRAW);
    coordPositionBuffer.itemSize = 3; 		// NB!!
    coordPositionBuffer.numberOfItems = 6; 	// NB!!
    gl.bindBuffer(gl.ARRAY_BUFFER, null);	// NB!! M? kople fra n?r det opereres med flere buffer! Kopler til i draw().

    // Fargebuffer: oppretter, binder og skriver data til bufret:
    let coordColors = new Float32Array([
        1.0, 0.0, 0.0, 1,   // X-akse
        1.0, 0.0, 0.0, 1,
        0.0, 1.0, 0.0, 1,   // Y-akse
        0.0, 1.0, 0.0, 1,
        0.0, 0.0, 1.0, 1,   // Z-akse
        0.0, 0.0, 1.0, 1
    ]);
    coordColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordColorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, coordColors, gl.STATIC_DRAW);
    coordColorBuffer.itemSize = 4; 			// 4 float per farge.
    coordColorBuffer.numberOfItems = 6; 	// 6 farger.
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function bindShaderParameters() {
    // Kopler shaderparametre med Javascript-variabler:
    // Matriser: u_modelviewMatrix & u_projectionMatrix
    u_modelviewMatrix = gl.getUniformLocation(gl.program, "u_modelviewMatrix");
    u_projectionMatrix = gl.getUniformLocation(gl.program, "u_projectionMatrix");

    return true;
}

function drawCoord() {
    //NB! M? sette a_Position p? nytt ETTER at buffer er bundet:
    gl.bindBuffer(gl.ARRAY_BUFFER, coordPositionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, coordColorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    //Still inn kamera:
    setupCamera();

    modelMatrix.setIdentity();
    // Sl?r sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef?lge!

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // Tegner koordinatsystem:
    gl.drawArrays(gl.LINES, 0, coordPositionBuffer.numberOfItems);
}

function drawXZPlane() {
    //Binder buffer og parametre:
    gl.bindBuffer(gl.ARRAY_BUFFER, xzplanePositionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, xzplaneColorBuffer);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    setupCamera();
    //M=I*T*O*R*S, der O=R*T
    modelMatrix.setIdentity();
    // Slår sammen modell & view til modelview-matrise:
    modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef?lge!

    // Sender matriser til shader:
    gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
    gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);

    // Tegner:
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, xzplanePositionBuffer.numberOfItems);
}

function drawCubeMan() {
    let yPosStart = 280;

    //Binder buffer og parametre:
    gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionBuffer);
    let a_Position = gl.getAttribLocation(gl.program, "a_Position");
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufferBlue);
    let a_Color = gl.getAttribLocation(gl.program, "a_Color");
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    // HEAD
    {
        setupCamera();
        modelMatrix.setIdentity();
        modelMatrix.translate(0.0, yPosStart, 0.0);
        modelMatrix.scale(2, 2, 2)
        modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef?lge!
        gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
        gl.drawArrays(bluePrintEnabled ? gl.LINES : gl.TRIANGLE_STRIP, 0, cubePositionBuffer.numberOfItems);
    }

    // NECK
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufferGreen);
        a_Color = gl.getAttribLocation(gl.program, "a_Color");
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);
        setupCamera();
        modelMatrix.setIdentity();
        modelMatrix.translate(0.0, yPosStart-25, 0.0);
        modelMatrix.scale(1.2, 0.8, 1.2)
        modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef?lge!
        gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
        gl.drawArrays(bluePrintEnabled ? gl.LINES : gl.TRIANGLE_STRIP, 0, cubePositionBuffer.numberOfItems);
    }

    // TORSO
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufferBlue);
        a_Color = gl.getAttribLocation(gl.program, "a_Color");
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);
        setupCamera();
        modelMatrix.setIdentity();
        modelMatrix.translate(0.0, yPosStart-100, 0.0);
        modelMatrix.scale(5, 7, 2)
        modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef?lge!
        gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
        gl.drawArrays(bluePrintEnabled ? gl.LINES : gl.TRIANGLE_STRIP, 0, cubePositionBuffer.numberOfItems);
    }


    // Left arm
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufferRed);
        a_Color = gl.getAttribLocation(gl.program, "a_Color");
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);
        setupCamera();
        modelMatrix.setIdentity();
        modelMatrix.translate(-80, yPosStart-80, 0);
        modelMatrix.rotate(-45, 0, 0, 1)
        modelMatrix.rotate(leftArmRotationAngle, 1, 0, 0)
        modelMatrix.scale(1, 6, 1);
        modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef?lge!
        gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
        gl.drawArrays(bluePrintEnabled ? gl.LINES : gl.TRIANGLE_STRIP, 0, cubePositionBuffer.numberOfItems);
    }

    // Right arm
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufferRed);
        a_Color = gl.getAttribLocation(gl.program, "a_Color");
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);
        setupCamera();
        modelMatrix.setIdentity();
        modelMatrix.translate(80, yPosStart-80, 0);
        modelMatrix.rotate(45, 0, 0, 1)
        modelMatrix.scale(1, 6, 1);
        modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef?lge!
        gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
        gl.drawArrays(bluePrintEnabled ? gl.LINES : gl.TRIANGLE_STRIP, 0, cubePositionBuffer.numberOfItems);
    }

    // Left leg
    {
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorBufferRed);
        a_Color = gl.getAttribLocation(gl.program, "a_Color");
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);
        setupCamera();
        modelMatrix.setIdentity();
        modelMatrix.translate(-50, yPosStart-220, 0);
        modelMatrix.rotate(-20, 0, 0, 1)
        modelMatrix.scale(1, 6, 1);
        modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef?lge!
        gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
        gl.drawArrays(bluePrintEnabled ? gl.LINES : gl.TRIANGLE_STRIP, 0, cubePositionBuffer.numberOfItems);
    }

    // Right leg
    {
        setupCamera();
        modelMatrix.setIdentity();
        modelMatrix.translate(50, yPosStart-220, 0);
        modelMatrix.rotate(20, 0, 0, 1)
        modelMatrix.scale(1, 6, 1);
        modelviewMatrix = viewMatrix.multiply(modelMatrix); // NB! rekkef?lge!
        gl.uniformMatrix4fv(u_modelviewMatrix, false, modelviewMatrix.elements);
        gl.uniformMatrix4fv(u_projectionMatrix, false, projectionMatrix.elements);
        gl.drawArrays(bluePrintEnabled ? gl.LINES : gl.TRIANGLE_STRIP, 0, cubePositionBuffer.numberOfItems);
    }
}


function handleKeys(elapsed) {

    let camPosVec = vec3.fromValues(camPosX, camPosY, camPosZ);
    //Enkel rotasjon av kameraposisjonen:
    if (currentlyPressedKeys[65]) {    //A
        rotateVector(2, camPosVec, 0, 1, 0);  //Roterer camPosVec 2 grader om y-aksen.
    }
    if (currentlyPressedKeys[68]) {	//S
        rotateVector(-2, camPosVec, 0, 1, 0);  //Roterer camPosVec 2 grader om y-aksen.
    }
    if (currentlyPressedKeys[87]) {	//W
        rotateVector(2, camPosVec, 1, 0, 0);  //Roterer camPosVec 2 grader om x-aksen.
    }
    if (currentlyPressedKeys[83]) {	//D
        rotateVector(-2, camPosVec, 1, 0, 0);  //Roterer camPosVec 2 grader om x-aksen.
    }

    //Zoom inn og ut:
    if (currentlyPressedKeys[86]) { //V
        vec3.scale(camPosVec, camPosVec, 1.05);
    }
    if (currentlyPressedKeys[66]) {	//B
        vec3.scale(camPosVec, camPosVec, 0.95);
    }

    camPosX = camPosVec[0];
    camPosY = camPosVec[1];
    camPosZ = camPosVec[2];
    setupCamera();
}

function draw(currentTime) {

    //Sørger for at draw kalles på nytt:
    requestAnimFrame(draw);

    if (currentTime === undefined)
        currentTime = 0; 	//Udefinert f?rste gang.

    //Beregner og viser FPS:
    if (currentTime - fpsData.forrigeTidsstempel >= 1000) { //dvs. et sekund har forl?pt...
        //Viser FPS i .html ("fps" er definert i .html fila):
        document.getElementById("fps").innerHTML = fpsData.antallFrames;
        fpsData.antallFrames = 0;
        fpsData.forrigeTidsstempel = currentTime; //Brukes for ? finne ut om det har g?tt 1 sekund - i s? fall beregnes FPS p? nytt.
    }

    //Tar høyde for varierende frame rate:
    let elapsed = 0.0;			// Forl?pt tid siden siste kalle p? draw().
    if (lastTime !== 0.0)		// F?rst gang er lastTime = 0.0.
        elapsed = (currentTime - lastTime) / 1000; // Deler p? 1000 for ? operere med sekunder.
    lastTime = currentTime;						// Setter lastTime til currentTime.

    //Rensk skjermen:
    gl.clear(gl.COLOR_BUFFER_BIT);

    // GJENNOMSIKTIGHET:
    // Aktiverer fargeblanding (&indirekte gjennomsiktighet):
    gl.enable(gl.BLEND);
    // Angir blandefunksjon:
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // LESE BRUKERINPUT;
    handleKeys(elapsed);

    //TEGNER:
    drawCoord();
    // leftArmRotationAngle += 1;
    drawCubeMan();
    drawXZPlane();

    //Øker antall frames med 1
    fpsData.antallFrames++;
}

function main() {

    if (!initContext())
        return;

    document.getElementById("uri").innerHTML = document.baseURI;

    // Initialiser shadere (cuon-utils):
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("Feil ved initialisering av shaderkoden.");
        return;
    }

    // AKTIVERER DYBDETEST:
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);

    //Initialiserer matrisene:
    modelMatrix = new Matrix4();
    viewMatrix = new Matrix4();
    modelviewMatrix = new Matrix4();
    projectionMatrix = new Matrix4();

    // Initialiserer verteksbuffer:
    initXZPlaneBuffers();
    initCubeBuffers();
    initCoordBuffers();

    // Binder shaderparametre:
    if (!bindShaderParameters())
        return;

    // Setter bakgrunnsfarge:
    gl.clearColor(0.8, 0.8, 0.8, 1.0); //RGBA

    // Initialiserer variabel for beregning av FPS:
    fpsData.antallFrames = 0;
    fpsData.forrigeTidsstempel = 0;

    // Start animasjonsløkke:
    draw();
}
