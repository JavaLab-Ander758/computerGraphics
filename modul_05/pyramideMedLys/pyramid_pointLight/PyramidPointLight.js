/**
 * Changes from partB:
 * Changed lighting type from directional to point, changed light colors and used vertex shader from Helpers class
 */
let gl, canvas, helpers, transformations, fps;
let pyramidVertexBuffer, pyramidNormalBuffer, pyramidTextureBuffer, pyramidTexture, coordinateBuffer;
let a_Position, a_Color, a_TextureCord, u_Sampler, u_modelMatrix, u_modelViewMatrix, u_projectionMatrix;
// Normals
let a_Normal, u_normalMatrix;
// Lights
let u_lightPosition, u_ambientLightColor, u_diffuseLightColor;

function init() {
	canvas = document.getElementById("canvas");
	helpers = new Helpers();
	transformations = new Animation().trans;
	fps = new Animation().FPS;

	if (!(gl = getWebGLContext(canvas))) {
		console.log("No context");
		return false;
	}
	if (!(gl.coordShaderProgram = createProgram(gl, Helpers.VSHADER_SOURCE, Helpers.FSHADER_SOURCE))) {
		console.log("Error initializing coordinate shaders");
		return false;
	}
	if (!(gl.pyramidShaderProgram = createProgram(gl, Light.getPointVShaderSource("texture"), Light.getFShaderSource("texture")))) {
		console.log("Error initializing pyramid shaders");
		return false;
	}

	// Position
	a_Position = gl.getAttribLocation(gl.coordShaderProgram, "a_Position");
	a_Color = gl.getAttribLocation(gl.coordShaderProgram, "a_Color");
	u_modelMatrix = gl.getUniformLocation(gl.pyramidShaderProgram, "u_modelMatrix");
	// Texture
	a_TextureCord = gl.getAttribLocation(gl.pyramidShaderProgram, "a_TextureCord");
	u_Sampler = gl.getUniformLocation(gl.pyramidShaderProgram, "u_Sampler");
	// Normals
	a_Normal = gl.getAttribLocation(gl.pyramidShaderProgram, "a_Normal");
	u_normalMatrix = gl.getUniformLocation(gl.pyramidShaderProgram, "u_normalMatrix");
	// Lights
	u_lightPosition = gl.getUniformLocation(gl.pyramidShaderProgram, "u_lightPosition");
	u_ambientLightColor = gl.getUniformLocation(gl.pyramidShaderProgram, "u_ambientLightColor");
	u_diffuseLightColor = gl.getUniformLocation(gl.pyramidShaderProgram, "u_diffuseLightColor");

	transformations.axisRotFactor = 15;

	document.addEventListener("keyup", handleKeyUp, false);
	document.addEventListener("keydown", handleKeyDown, false);

	return true;
}

function textureLoadedContinue(textureImg) {
	initPyramidBuffers(textureImg);

	let coordinateSystem = new CoordinateSystem(100);
	coordinateBuffer = coordinateSystem.initBuffer(gl);

	draw();
}

function initPyramidBuffers(textureImg) {
	let pyramid = new Pyramid();
	pyramidVertexBuffer = pyramid.initBuffer(gl);

	let normals = Light.initNormals(pyramid.vertices);
	pyramidNormalBuffer = (new Shape()).initBuffer(gl, normals);
	pyramidNormalBuffer.itemSize = pyramidVertexBuffer.itemSize;
	pyramidNormalBuffer.numberOfItems = normals.length / 3;

	let texture = new Texture(textureImg);
	let bl = [0, 0];
	let br = [0, 0];
	let top = [-0.1, 1];
	let pyramidFaces = 5; // number of face textures
	while (pyramidFaces-- > 0) {
		bl[0] = br[0];
		br[0] += 0.2;
		top[0] += 0.2;
		bl[0] = Math.round(bl[0] * 100) / 100;
		br[0] = Math.round(br[0] * 100) / 100;
		top[0] = Math.round(top[0] * 100) / 100;
		texture.uvCoords = texture.uvCoords.concat(bl, br, top);
	}
	texture.uvCoords = texture.uvCoords.concat(bl, br, top); // add last texture to final face

	texture.objUVs = new Float32Array(texture.uvCoords);
	pyramidTexture = texture.initTexture(gl);
	pyramidTextureBuffer = texture.initTextureBuffer(gl, pyramid.numberOfItems);
}

function draw(currentTime) {
	requestAnimFrame(draw);
	
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LESS);
	// gl.enable(gl.CULL_FACE);
	// gl.cullFace(gl.BACK);
	// gl.frontFace(gl.CCW);

	if (currentTime === undefined)
		currentTime = 0;

	fps.elapsed = 0;
	if (fps.lastTime !== 0)
		fps.elapsed = (currentTime - fps.lastTime) / 1000;
	fps.lastTime = currentTime;

	transformations.axisRot += (transformations.axisRotFactor * fps.elapsed);
	transformations.axisRot %= 360;

	gl.clear(gl.COLOR_BUFFER_BIT);

	handleKeys(fps.elapsed);

	drawCoordinate();
	drawPyramid();
}

function drawCoordinate() {
	if (!bindShaderParameters(gl.coordShaderProgram))
		return;
	gl.useProgram(gl.coordShaderProgram);
	gl.bindBuffer(gl.ARRAY_BUFFER, coordinateBuffer);

	let floatsPerVertex = 3;
	let stride = (3 + 4) * 4;
	gl.vertexAttribPointer(a_Position, floatsPerVertex, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(a_Position);

	floatsPerVertex = 4;
	let colorOffset = 3 * 4;
	gl.vertexAttribPointer(a_Color, floatsPerVertex, gl.FLOAT, false, stride, colorOffset);
	gl.enableVertexAttribArray(a_Color);

	setCamera();
	helpers.modelMatrix.setIdentity();
	helpers.modelViewMatrix.set(helpers.viewMatrix).multiply(helpers.modelMatrix);

	gl.uniformMatrix4fv(u_modelViewMatrix, false, helpers.modelViewMatrix.elements);
	gl.uniformMatrix4fv(u_projectionMatrix, false, helpers.projectionMatrix.elements);
	gl.drawArrays(gl.LINES, 0, coordinateBuffer.numberOfItems);
}

function drawPyramid() {
	if (!bindShaderParameters(gl.pyramidShaderProgram))
		return;
	gl.useProgram(gl.pyramidShaderProgram);

	// Texture
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidTextureBuffer);
	gl.vertexAttribPointer(a_TextureCord, pyramidTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_TextureCord);
	// Activate texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, pyramidTexture);
	gl.uniform1i(u_Sampler, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Position
	let floatsPerVertex = 3;
	let stride = (3 + 4) * 4;
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexBuffer);
	gl.vertexAttribPointer(a_Position, floatsPerVertex, gl.FLOAT, false, stride, 0);
	gl.enableVertexAttribArray(a_Position);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Normals
	gl.bindBuffer(gl.ARRAY_BUFFER, pyramidNormalBuffer);
	gl.vertexAttribPointer(a_Normal, floatsPerVertex, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Normal);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// Lights
	let lights = new Light();
	lights.lightDirection = [-20, 20, 20];
	gl.uniform3fv(u_lightPosition, lights.lightDirection);
	gl.uniform3fv(u_ambientLightColor, lights.ambientLightColor);
	gl.uniform3fv(u_diffuseLightColor, lights.diffuseLightColor);

	setCamera();
	helpers.modelMatrix.setIdentity();
	helpers.modelMatrix.rotate(transformations.axisRot, 0, 1, 0);
	let tempModelMatrix = new Matrix4(helpers.modelMatrix);
	helpers.modelViewMatrix.set(helpers.viewMatrix).multiply(helpers.modelMatrix);
	gl.uniformMatrix4fv(u_modelMatrix, false, tempModelMatrix.elements);
	gl.uniformMatrix4fv(u_modelViewMatrix, false, helpers.modelViewMatrix.elements);
	gl.uniformMatrix4fv(u_projectionMatrix, false, helpers.projectionMatrix.elements);

	mat3.normalFromMat4(lights.normalMatrix, helpers.modelMatrix.elements);
	gl.uniformMatrix3fv(u_normalMatrix, false, lights.normalMatrix);

	gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexBuffer.numberOfItems);
}

function bindShaderParameters(shaderProgram) {
	u_modelViewMatrix = gl.getUniformLocation(shaderProgram, "u_modelViewMatrix");
	u_projectionMatrix = gl.getUniformLocation(shaderProgram, "u_projectionMatrix");
	return true;
}

function setCamera() {
	helpers.viewMatrix.setLookAt(
		helpers.camera.eyePos.x, helpers.camera.eyePos.y, helpers.camera.eyePos.z,
		helpers.camera.lookPos.x, helpers.camera.lookPos.y, helpers.camera.lookPos.z,
		helpers.camera.upPos.x, helpers.camera.upPos.y, helpers.camera.upPos.z);
	helpers.projectionMatrix.setPerspective(45, canvas.width / canvas.height, 1, 10000);
}

function main() {
	if (!init())
		return;

	gl.clearColor(0.8, 0.8, 0.8, 1.0);

	let textureName = "../img/pyramid.png";
	loadTexture(textureLoadedContinue, textureName);
}

function handleKeys() {
	let camPosVec = vec3.fromValues(helpers.camera.eyePos.x, helpers.camera.eyePos.y, helpers.camera.eyePos.z);
	if (helpers.keys['w']) // camera up
		rotateVector(-2, camPosVec, 1, 0, 0);
	if (helpers.keys['s']) // camera down
		rotateVector(2, camPosVec, 1, 0, 0);
	if (helpers.keys['a']) // camera left
		rotateVector(-2, camPosVec, 0, 1, 0);
	if (helpers.keys['d']) // camera right
		rotateVector(2, camPosVec, 0, 1, 0);
	if (helpers.keys['q']) // zoom in
		vec3.scale(camPosVec, camPosVec, 0.95);
	if (helpers.keys['e']) // zoom out
		vec3.scale(camPosVec, camPosVec, 1.05);

	helpers.camera.eyePos.x = camPosVec[0];
	helpers.camera.eyePos.y = camPosVec[1];
	helpers.camera.eyePos.z = camPosVec[2];
	setCamera();
}

function handleKeyUp(event) {
	helpers.keys[event.key.toLowerCase()] = false;
}

function handleKeyDown(event) {
	helpers.keys[event.key.toLowerCase()] = true;
}