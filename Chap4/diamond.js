"use strict";

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
var world_to_camera = scalem(1/6, 1/6, -1/6);
var translation = vec3(-4, 0, 0);
var rotX = 0;
var rotY = 0;
var rotZ = 0;
var ctm;

var t_increment = 0.1;
var r_increment = 5;

var vertices = [
    vec4(  0.0,  0.0,  2.0, 1.0 ), // 0 left
    vec4(  3.0,  6.0,  0.0, 1.0 ), // 1 top
    vec4(  6.0,  0.0,  2.0, 1.0 ), // 2 right
    vec4(  3.0, -6.0,  0.0, 1.0 ), // 3 bottom 
    vec4(  3.0,  0.0, -4.0, 1.0 ), // 4 front
];

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

    diamond();

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

function diamond()
{
    //vec4(  0.0,  0.0,  2.0, 1.0 ), // 0 left
    //vec4(  3.0,  6.0,  0.0, 1.0 ), // 1 top
    //vec4(  6.0,  0.0,  2.0, 1.0 ), // 2 right
    //vec4(  3.0, -6.0,  0.0, 1.0 ), // 3 bottom 
    //vec4(  3.0,  0.0, -4.0, 1.0 ), // 4 front
    // add pyramid
    triangle(0, 1, 2, 6); // top back
    triangle(0, 3, 2, 2); // bot back
    triangle(0, 1, 4, 3); // top left
    triangle(0, 3, 4, 4); // bot left
    triangle(2, 1, 4, 5); // top right
    triangle(2, 3, 4, 6); // bot right
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    ctm = world_to_camera;
    ctm = mult(ctm, translate(translation));
    ctm = mult(ctm, rotateX(rotX));
    ctm = mult(ctm, rotateY(rotY));
    ctm = mult(ctm, rotateZ(rotZ));
    //ctm = mult(ctm, scalem(1/6, 1/6, 1));
    
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    
    gl.drawArrays( gl.TRIANGLES, 0, points.length );

    requestAnimFrame( render );
}
