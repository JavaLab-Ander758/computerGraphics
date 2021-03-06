/**
 * @author WestLangley / http://github.com/WestLangley
 *
 */


import { LineSegments2 } from "./LineSegments2.d.ts";
import { LineGeometry } from "./LineGeometry.d.ts";
import { LineMaterial } from "./LineMaterial.d.ts";

var Line2 = function ( geometry, material ) {

	LineSegments2.call( this );

	this.type = 'Line2';

	this.geometry = geometry !== undefined ? geometry : new LineGeometry();
	this.material = material !== undefined ? material : new LineMaterial( { color: Math.random() * 0xffffff } );

};

Line2.prototype = Object.assign( Object.create( LineSegments2.prototype ), {

	constructor: Line2,

	isLine2: true,

	copy: function ( /* source */ ) {

		// todo

		return this;

	}

} );

export { Line2 };
