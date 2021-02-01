/**
 * Camera.js er basert på klassen 'Del3_4_5_6_7-KubemannOO\js\Bil1oo\Stack.js'
 * i eksempelkoden Del3_4_5_6_7-KubemannOO.zip under modul 3 i faget
 */
class Stack {
	constructor() {
		this.matrixStack = [];
	}

	pushMatrix(matrix) {
		let copyToPush = new Matrix4(matrix);
		this.matrixStack.push(copyToPush);
	}

	popMatrix() {
		if (this.matrixStack.length === 0)
			throw "Error in popMatrix - matrix stack is empty!";
		this.matrixStack.pop();
	}

	peekMatrix() {
		if (this.matrixStack.length === 0)
			throw "Errir in peekMatrix - matrix stack is empty!";
		return new Matrix4(this.matrixStack[this.matrixStack.length - 1]);
	}

	empty() {
		while (this.matrixStack.length > 0)
			this.matrixStack.pop();
	}
}
