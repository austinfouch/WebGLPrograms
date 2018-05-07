"use strict";

// Author: 	Austin Fouch
// Date:	04/02/2018
// Program Aspect of CG exam 2
// Note: This program (heavily) reuses code from:
//		1) WebGL/Chap4/cube3.js
//		2) Professor Scott Frees' cube3pyramid.js (done in-class)

var canvas;
var gl;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var modelViewMatrixLoc;

// changes to these variables made by Austin Fouch
var world_to_camera = scalem(1/6, 1/6, -1/6); 	// without scaling down, image clips into camera
var translation = vec3(-4, 0, 0);				// centers object on the x-axis
// end changes

var rotX = 0;
var rotY = 0;
var rotZ = 0;
var ctm;

var t_increment = 0.1;
var r_increment = 5;

// changes to these values made by Austin Fouch
var vertices = [
    vec4(  0.0,  0.0,  2.0, 1.0 ), // 0 left
    vec4(  3.0,  6.0,  0.0, 1.0 ), // 1 top
    vec4(  6.0,  0.0,  2.0, 1.0 ), // 2 right
    vec4(  3.0, -6.0,  0.0, 1.0 ), // 3 bottom 
    vec4(  3.0,  0.0, -4.0, 1.0 ), // 4 front
];
// end changes

var vertexColors = [
    [ 0.0, 0.0, 0.0, 1.0 ],  // black
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 1.0, 1.0, 1.0 ]   // white
];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

	// changes made by Austin Fouch, changes call from colorCube() to diamond()
    diamond();
	// end changes

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // obtain the model matrix uniform location from the shader
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );

    render();
}

window.onkeypress = function( event ) {
    var key = String.fromCharCode(event.keyCode);
    switch( key ) {
        case 'a':
            translation[0]-= t_increment;
            break;
        case 'd':
            translation[0]+= t_increment;
            break;
        case 's':
            translation[1]-= t_increment;
            break;
        case 'w':
            translation[1]+= t_increment;
            break;

        case 'Y':
            rotY-= r_increment;
            break;
        case 'y':
            rotY+= r_increment;
            break;

        case 'X':
            rotX-= r_increment;
            break;
        case 'x':
            rotX+= r_increment;
            break;

        case 'Z':
            rotZ-= r_increment;
            break;
        case 'z':
            rotZ+= r_increment;
            break;
    }
};

function triangle( p1, p2, p3, c) {
    points.push(vertices[p1]);
    points.push(vertices[p2]);
    points.push(vertices[p3]);
    colors.push(vertexColors[c]);
    colors.push(vertexColors[c]);
    colors.push(vertexColors[c]);
}

// changes to this function made by Austin Fouch (initially colorCube())
// also removed the quad() function as its not necessary to build squares here
function diamond()
{
	triangle(0, 1, 4, 4); // top left blue
    triangle(0, 1, 2, 1); // top back red
	triangle(2, 1, 4, 3); // top right green
	triangle(0, 3, 4, 1); // bot left red
    triangle(0, 3, 2, 3); // bot back green
    triangle(2, 3, 4, 4); // bot right blue
}
// end changes

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    ctm = world_to_camera;
    ctm = mult(ctm, translate(translation));
    ctm = mult(ctm, rotateX(rotX));
    ctm = mult(ctm, rotateY(rotY));
    ctm = mult(ctm, rotateZ(rotZ));
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    requestAnimFrame( render );
}