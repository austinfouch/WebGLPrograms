// Elliott Barinberg
"use strict";

var canvas;
var gl;

var NumVertices  = 104;

var positions = [];
var colors = [];

var positionIndexes = [];
var colorIndexes = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var modelViewMatrixLoc;
var world_to_camera = scalem(1, 1, -1);
var translation = vec3(0, 0, 0);
var rotX = -75;
var rotY = 75;
var rotZ = -60;
var ctm;

var t_increment = 0.1;
var r_increment = 5;


var positions = [
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 ),
    vec4( 0.0, 1.0, 0.0, 1.0 )
];

var colors = [
    [ 1.0, 0.0, 0.0, 1.0 ],  // red
    [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
    [ 0.0, 1.0, 0.0, 1.0 ],  // green
    [ 0.0, 0.0, 1.0, 1.0 ],  // blue
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
    [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
    [ 0.0, 1.0, 1.0, 1.0 ]   // cyan
];

function MakeTheThing()
{
    quad( 1, 0, 3, 2, 0 );
    quad( 2, 3, 7, 6, 1 );
    quad( 3, 0, 4, 7, 2 );
    quad( 4, 5, 6, 7, 4 );
    quad( 5, 4, 0, 1, 5 );
    quad(6, 5, 1, 2, 3);
    tri( 8, 1, 2, 3 );
    tri( 8, 5, 6, 0 );
    tri( 8, 2, 6, 4 );
    tri( 8, 5, 1, 2 );
}


// build a triangle from points a,b,c with a color
function tri(a, b, c, color_index)
{

    var base = vertex_data.positions.length;

    var color = colors[color_index];

    var vertices = [a, b, c];
    for ( var i = 0; i < vertices.length; ++i ) {
        var position = positions[vertices[i]];
        vertex_data.positions.push(position);
        vertex_data.colors.push(color);
    }

    var indices = [ 0, 1, 2 ];
    for ( var i = 0; i < indices.length; ++i ) {
        vertex_data.indices.push(base + indices[i]);
    }
}

// build a square from points a-d and a color
function quad(a, b, c, d, color_index)
{

    var base = vertex_data.positions.length;

    var color = colors[color_index];

    var vertices = [a, b, c, d];
    for ( var i = 0; i < vertices.length; ++i ) {
        var position = positions[vertices[i]];
        vertex_data.positions.push(position);
        vertex_data.colors.push(color);
    }

    var indices = [ 0, 1, 2, 0, 2, 3 ];
    for ( var i = 0; i < indices.length; ++i ) {
        vertex_data.indices.push(base + indices[i]);
    }
}

// storage for data
var vertex_data = {
    positions : [],
    colors :[],
    indices: []
}


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    // builds all the cubes and triangles
    MakeTheThing();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );




    var colorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertex_data.colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );



    var positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, positionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertex_data.positions), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vertex_data.indices), gl.STATIC_DRAW);



    // obtain the model matrix uniform location from the shader
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );

    console.log(vertex_data);
    render();
}

window.onkeypress = function( event ) {
    var key = String.fromCharCode(event.keyCode);
    switch(key) {
        case 'a':
            translation[0] -= t_increment;
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

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    ctm = world_to_camera;
    ctm = mult(ctm, translate(translation));
    ctm = mult(ctm, rotateX(rotX));
    ctm = mult(ctm, rotateY(rotY));
    ctm = mult(ctm, rotateZ(rotZ));

    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );

    gl.drawElements(gl.TRIANGLES, vertex_data.indices.length, gl.UNSIGNED_SHORT, 0);

    requestAnimFrame( render );
}
