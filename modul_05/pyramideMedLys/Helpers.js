class Helpers {
	static VSHADER_SOURCE =
		"attribute vec3 a_Position;\n" +
		"attribute vec4 a_Color;\n" +
		"uniform mat4 u_modelViewMatrix;\n" +
		"uniform mat4 u_projectionMatrix;\n" +
		"varying vec4 v_Color;\n" +
		"void main() {\n" +
		"  gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_Position, 1.0);\n" +
		"  v_Color = a_Color;\n" +
		"}\n";

	static FSHADER_SOURCE =
		"precision mediump float;\n" +
		"varying vec4 v_Color;\n" +
		"void main() {\n" +
		"  gl_FragColor = v_Color;\n" +
		"}\n";

	constructor() {
		this.initMatrices();
		this.initCamera();
		this.keys = [];
	}

	initMatrices() {
		this.modelMatrix = new Matrix4();
		this.viewMatrix = new Matrix4();
		this.modelViewMatrix = new Matrix4();
		this.projectionMatrix = new Matrix4();
	}

	initCamera() {
		this.camera = {
			eyePos: {"x": 5, "y": 7, "z": 10},
			lookPos: {"x": 0, "y": 0, "z": 0},
			upPos: {"x": 0, "y": 1, "z": 0}
		};
	}
}

class Animation {
	constructor() {
		this.initFPS();
		this.initTransformations();
	}

	initFPS() {
		this.FPS = {
			frames: 0,
			lastTime: 0,
			lastTimeStamp: 0,
			elapsed: 0
		}
	}

	initTransformations() {
		this.trans = {
			scale: 1,
			translate: 1,
			axisRot: 0,
			axisRotFactor: 0,
			objRot: 0,
			objRotFactor: 0
		}
	}
}

class CoordinateSystem {
	constructor(boundary) {
		this.boundary = boundary;
		this.vertices = new Float32Array([
			// x, red
			-this.boundary, 0, 0, 1, 0, 0, 1,
			this.boundary, 0, 0, 1, 0, 0, 1,
			// y, green
			0, -this.boundary, 0, 0, 1, 0, 1,
			0, this.boundary, 0, 0, 1, 0, 1,
			// z, blue
			0, 0, -this.boundary, 0, 0, 1, 1,
			0, 0, this.boundary, 0, 0, 1, 1,
		]);
	}

	setOffsetX(offsetX) {
		this.vertices[0] *= offsetX;
		this.vertices[7] *= offsetX;
	}

	setOffsetY(offsetY) {
		this.vertices[15] *= offsetY;
		this.vertices[22] *= offsetY;
	}

	setOffsetZ(offsetZ) {
		this.vertices[30] *= offsetZ;
		this.vertices[37] *= offsetZ;
	}

	initBuffer(gl) {
		let buffer = gl.createBuffer();
		buffer.numberOfItems = this.vertices.length / 7;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		return buffer;
	}
}

class Texture {
	static VSHADER_SOURCE =
		"attribute vec3 a_Position;\n" +
		"attribute vec2 a_TextureCord;\n" +
		"uniform mat4 u_modelViewMatrix;\n" +
		"uniform mat4 u_projectionMatrix;\n" +
		"varying vec2 v_Texture;\n" +
		"void main() {\n" +
		"  gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_Position, 1.0);\n" +
		"  v_Texture = a_TextureCord;\n" +
		"}\n";

	static FSHADER_SOURCE =
		"precision mediump float;\n" +
		"varying vec2 v_Texture;\n" +
		"uniform sampler2D u_Sampler;\n" +
		"void main() {\n" +
		"  gl_FragColor = texture2D(u_Sampler, vec2(v_Texture.s, v_Texture.t));\n" +
		"}\n";

	constructor(texture) {
		this.texture = texture;
		this.uvCoords = [];
		this.objUVs = [];
	}

	initTexture(gl) {
		let texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.texture);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.bindTexture(gl.TEXTURE_2D, null);

		return texture;
	}

	initTextureBuffer(gl, objNumberOfItems) {
		let buffer = gl.createBuffer();
		buffer.itemSize = 2; // x- and y-coordinates
		buffer.numberOfItems = objNumberOfItems;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, this.objUVs, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		return buffer;
	}
}

class Light {
	constructor() {
		this.normalMatrix = mat3.create();
		this.lightDirection = [-10, 6, 10];
		this.ambientLightColor = [0.2, 0.2, 0.2];
		this.diffuseLightColor = [0.1, 0.9, 0.3];
	}

	static getDirectionalVShaderSource(type = "") {
		let source =
			"attribute vec3 a_Position;\n" +
			"attribute vec3 a_Normal;\n" +
			"uniform mat3 u_normalMatrix;\n" +
			"uniform mat4 u_modelViewMatrix;\n" +
			"uniform mat4 u_projectionMatrix;\n" +
			"uniform vec3 u_lightDirection;\n" +
			"uniform vec3 u_ambientLightColor;\n" +
			"uniform vec3 u_diffuseLightColor;\n" +
			"varying vec3 v_lightWeighting;\n";
		// Optional parameters for color/texture
		source +=
			(type === "color" ? "attribute vec4 a_Color;\n" :
				(type === "texture" ? "attribute vec2 a_TextureCord;\nvarying vec2 v_Texture;\n" : ""));
		source +=
			"void main() {\n" +
			"  vec3 normal = normalize(u_normalMatrix * a_Normal);\n" +
			"  vec3 lightDirectionNorm = normalize(u_lightDirection);\n" +
			"  float diffuseLightWeighting = max(dot(normal, lightDirectionNorm), 0.0);\n" +
			"  v_lightWeighting = u_ambientLightColor + (u_diffuseLightColor * diffuseLightWeighting);\n" +
			"  gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_Position, 1.0);\n";
		// Optional parameters for color/texture
		source +=
			(type === "color" ? "  v_Color = a_Color;\n" :
				(type === "texture" ? "  v_Texture = a_TextureCord;\n" : "")) +
			"}\n";

		return source;
	}

	static getPointVShaderSource(type = "") {
		let source =
			"attribute vec3 a_Position;\n" +
			"attribute vec3 a_Normal;\n" +
				"uniform mat4 u_modelMatrix;\n" +
			"uniform mat3 u_normalMatrix;\n" +
			"uniform mat4 u_modelViewMatrix;\n" +
			"uniform mat4 u_projectionMatrix;\n" +
			"uniform vec3 u_lightPosition;\n" +
			"uniform vec3 u_ambientLightColor;\n" +
			"uniform vec3 u_diffuseLightColor;\n" +
			"varying vec3 v_lightWeighting;\n";
		// Optional parameters for color/texture
		source +=
			(type === "color" ? "attribute vec4 a_Color;\n" :
				(type === "texture" ? "attribute vec2 a_TextureCord;\nvarying vec2 v_Texture;\n" : ""));
		source +=
			"void main() {\n" +
			"  vec4 vertexPosition = u_modelMatrix * vec4(a_Position, 1.0);\n" +
			"  vec3 vectorToLightSource = normalize(u_lightPosition - vec3(vertexPosition));\n" +
			"  vec3 normal = normalize(u_normalMatrix * a_Normal);\n" +
			"  float diffuseLightWeighting = max(dot(normal, vectorToLightSource), 0.0);\n" +
			"  v_lightWeighting = u_ambientLightColor + (u_diffuseLightColor * diffuseLightWeighting);\n" +
			"  gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_Position, 1.0);\n";
		// Optional parameters for color/texture
		source +=
			(type === "color" ? "  v_Color = a_Color;\n" :
				(type === "texture" ? "  v_Texture = a_TextureCord;\n" : "")) +
			"}\n";

		return source;
	}

	static getFShaderSource(type = "") {
		let FSHADER_SOURCE =
			"precision mediump float;\n" +
			"varying vec3 v_lightWeighting;\n";
		// Optional parameters for color/texture
		FSHADER_SOURCE +=
			(type === "color" ? "varying vec3 v_Color;\n" :
				(type === "texture" ? "varying vec2 v_Texture;\nuniform sampler2D u_Sampler;\n" : "")) +
			"void main() {\n";
		// Optional parameters for color/texture
		FSHADER_SOURCE +=
			(type === "color" ? "  gl_FragColor = vec4(v_lightWeighting.rgb * v_Color.rgb, 1);\n" :
				(type === "texture") ? "  vec4 texelColor = texture2D(u_Sampler, vec2(v_Texture.s, v_Texture.t));\n  gl_FragColor = vec4(v_lightWeighting.rgb * texelColor.rgb, texelColor.a);\n" :
					"  gl_FragColor = vec4(v_lightWeighting.rgb, 1);\n") + "}\n";

		return FSHADER_SOURCE;
	}

	static initNormals(vertices) {
		let normals = [];
		for (let i = 0; i < vertices.length; i += 5) {
			let p0 = vec3.fromValues(vertices[i], vertices[++i], vertices[++i]);
			let p1 = vec3.fromValues(vertices[i += 5], vertices[++i], vertices[++i]);
			let p2 = vec3.fromValues(vertices[i += 5], vertices[++i], vertices[++i]);

			let u = vec3.create(), v = vec3.create();
			vec3.subtract(u, p1, p0);
			vec3.subtract(v, p2, p0);

			let cross = vec3.create();
			vec3.cross(cross, u, v);

			normals = normals.concat(cross[0], cross[1], cross[2],
				cross[0], cross[1], cross[2],
				cross[0], cross[1], cross[2]);
		}
		return new Float32Array(normals);
	}
}

class Shape {
	constructor() {
		this.numberOfObjects = 1;
		this.vertices = [];
	}

	initBuffer(gl, vertices) {
		let buffer = gl.createBuffer();
		buffer.itemSize = this.numberOfObjects;
		buffer.numberOfItems = vertices.length / 7;
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		this.vertices = vertices;

		return buffer;
	}
}

class Sphere extends Shape {
	constructor(radius = 30, latitudeBands = 30, longitudeBands = 30) {
		super();
		this.radius = radius;
		this.latitudeBands = latitudeBands;
		this.longitudeBands = longitudeBands;
	}

	initVertices(rgba, isMulticolored) {
		let vertices = [];
		for (let lat = 0; lat <= this.latitudeBands; lat++) {
			let theta = lat * Math.PI / this.latitudeBands;
			let sinTheta = Math.sin(theta);
			let cosTheta = Math.cos(theta);

			if (isMulticolored) {
				rgba[0] - 0.05 <= 0 ? rgba[0] = 1 : rgba[0] -= 0.05;
				rgba[1] + 0.05 >= 1 ? rgba[1] = 0 : rgba[1] += 0.05;
				rgba[2] + 0.1 >= 1 ? rgba[2] = 0 : rgba[2] += 0.1;
			}

			for (let long = 0; long <= this.longitudeBands; long++) {
				let phi = long * 2 * Math.PI / this.longitudeBands;
				let sinPhi = Math.sin(phi);
				let cosPhi = Math.cos(phi);

				let x = cosPhi * sinTheta;
				let y = cosTheta;
				let z = sinPhi * sinTheta;

				vertices.push(this.radius * x);
				vertices.push(this.radius * y);
				vertices.push(this.radius * z);
				vertices.push(rgba[2]);
				vertices.push(rgba[1]);
				vertices.push(rgba[0]);
				vertices.push(rgba[3]);
			}
		}
		return new Float32Array(vertices);
	}

	initIndices() {
		let indices = [];
		for (let lat = 0; lat < this.latitudeBands; lat++)
			for (let long = 0; long < this.longitudeBands; long++) {
				let first = (lat * (this.longitudeBands + 1)) + long;
				let second = first + this.longitudeBands + 1;

				indices.push(first);
				indices.push(second);
				indices.push(first + 1);
				indices.push(second);
				indices.push(second + 1);
				indices.push(first + 1);
			}
		return new Uint16Array(indices);
	}

	initVertexBuffer(gl, isMulticolored = true, rgba = [1, 0, 0, 1]) {
		let vertices = this.initVertices(rgba, isMulticolored);
		return super.initBuffer(gl, vertices);
	}

	initIndexBuffer(gl) {
		let indices = this.initIndices();
		let buffer = gl.createBuffer();
		buffer.itemSize = this.numberOfObjects;
		buffer.numberOfItems = indices.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		return buffer;
	}
}

class Cube extends Shape {
	constructor() {
		super();
	}

	initVertices() {
		return new Float32Array([
			// Triangle 1 (front)
			-1, -1, 1, 1.0, 1.0, 0.5, 1.0,
			1, -1, 1, 1.0, 1.0, 0.5, 1.0,
			1, 1, 1, 1.0, 1.0, 0.5, 1.0,
			// Triangle 2 (front)
			1, 1, 1, 1.0, 1.0, 0.5, 1.0,
			-1, 1, 1, 1.0, 1.0, 0.5, 1.0,
			-1, -1, 1, 1.0, 1.0, 0.5, 1.0,
			// Triangle 3 (back)
			-1, -1, -1, 1.0, 0.5, 1.0, 1.0,
			-1, 1, -1, 1.0, 0.5, 1.0, 1.0,
			1, 1, -1, 1.0, 0.5, 1.0, 1.0,
			// Triangle 4 (back)
			1, 1, -1, 1.0, 0.5, 1.0, 1.0,
			1, -1, -1, 1.0, 0.5, 1.0, 1.0,
			-1, -1, -1, 1.0, 0.5, 1.0, 1.0,
			// Triangle 5 (top)
			-1, 1, -1, 0.5, 1.0, 1.0, 1.0,
			-1, 1, 1, 0.5, 1.0, 1.0, 1.0,
			1, 1, 1, 0.5, 1.0, 1.0, 1.0,
			// Triangle 6 (top)
			1, 1, -1, 0.5, 1.0, 1.0, 1.0,
			1, 1, 1, 0.5, 1.0, 1.0, 1.0,
			-1, 1, -1, 0.5, 1.0, 1.0, 1.0,
			// Triangle 7 (bottom)
			-1, -1, -1, 0.5, 1.0, 0.5, 1.0,
			1, -1, -1, 0.5, 1.0, 0.5, 1.0,
			1, -1, 1, 0.5, 1.0, 0.5, 1.0,
			// Triangle 8 (bottom)
			1, -1, 1, 0.5, 1.0, 0.5, 1.0,
			-1, -1, -1, 0.5, 1.0, 0.5, 1.0,
			-1, -1, 1, 0.5, 1.0, 0.5, 1.0,
			// Triangle 9 (right)
			1, -1, -1, 1.0, 0.5, 0.5, 1.0,
			1, 1, -1, 1.0, 0.5, 0.5, 1.0,
			1, -1, 1, 1.0, 0.5, 0.5, 1.0,
			// Triangle 10 (right)
			1, 1, 1, 1.0, 0.5, 0.5, 1.0,
			1, -1, 1, 1.0, 0.5, 0.5, 1.0,
			1, 1, -1, 1.0, 0.5, 0.5, 1.0,
			// Triangle 11 (left)
			-1, -1, -1, 0.5, 0.5, 1.0, 1.0,
			-1, -1, 1, 0.5, 0.5, 1.0, 1.0,
			-1, 1, 1, 0.5, 0.5, 1.0, 1.0,
			// Triangle 12 (left)
			-1, 1, 1, 0.5, 0.5, 1.0, 1.0,
			-1, 1, -1, 0.5, 0.5, 1.0, 1.0,
			-1, -1, -1, 0.5, 0.5, 1.0, 1.0,
		]);
	}

	initBuffer(gl) {
		return super.initBuffer(gl, this.initVertices());
	}
}

class Pyramid extends Shape {
	constructor(hasBase = true) {
		super();
		this.hasBase = hasBase;
	}

	initVertices() {
		let vertices;
		if (this.hasBase) { // With base (bl, br, top, r, g, b, a)
			vertices = new Float32Array([
				// Front face
				-1, -1, 1, 1.0, 1.0, 0.5, 1.0,
				1, -1, 1, 1.0, 1.0, 0.5, 1.0,
				0, 1, 0, 1.0, 1.0, 0.5, 1.0,
				// Right face
				1, -1, 1, 1.0, 1.0, 0.5, 1.0,
				1, -1, -1, 1.0, 1.0, 0.5, 1.0,
				0, 1, 0, 1.0, 1.0, 0.5, 1.0,
				// Back face
				1, -1, -1, 1.0, 1.0, 0.5, 1.0,
				-1, -1, -1, 1.0, 1.0, 0.5, 1.0,
				0, 1, 0, 1.0, 1.0, 0.5, 1.0,
				// Left face
				-1, -1, -1, 1.0, 1.0, 0.5, 1.0,
				-1, -1, 1, 1.0, 1.0, 0.5, 1.0,
				0, 1, 0, 1.0, 1.0, 0.5, 1.0,
				// Triangle 5 (base)
				-1, -1, 1, 0.5, 1.0, 1.0, 1.0,
				-1, -1, -1, 0.5, 1.0, 1.0, 1.0,
				1, -1, 1, 0.5, 1.0, 1.0, 1.0,
				// Triangle 6 (base)
				1, -1, 1, 0.5, 1.0, 1.0, 1.0,
				-1, -1, -1, 0.5, 1.0, 1.0, 1.0,
				1, -1, -1, 0.5, 1.0, 1.0, 1.0,
			]);
		} else // No base
			vertices = new Float32Array([
				// Front face
				-1, -1, 1, 1.0, 1.0, 0.5, 1.0,
				1, -1, 1, 1.0, 1.0, 0.5, 1.0,
				0, 1, 0, 1.0, 1.0, 0.5, 1.0,
				// Right face
				1, -1, 1, 1.0, 1.0, 0.5, 1.0,
				1, -1, -1, 1.0, 1.0, 0.5, 1.0,
				0, 1, 0, 1.0, 1.0, 0.5, 1.0,
				// Back face
				1, -1, -1, 1.0, 1.0, 0.5, 1.0,
				-1, -1, -1, 1.0, 1.0, 0.5, 1.0,
				0, 1, 0, 1.0, 1.0, 0.5, 1.0,
				// Left face
				-1, -1, -1, 1.0, 1.0, 0.5, 1.0,
				-1, -1, 1, 1.0, 1.0, 0.5, 1.0,
				0, 1, 0, 1.0, 1.0, 0.5, 1.0,
			]);
		this.numberOfObjects = this.hasBase ? 6 : 4;

		return vertices;
	}

	initBuffer(gl) {
		return super.initBuffer(gl, this.initVertices());
	}
}