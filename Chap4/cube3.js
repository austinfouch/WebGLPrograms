"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var modelViewMatrixLoc;
var world_to_camera = scalem(1, 1, -1);
var translation = vec3(0, 0, 0);
var rotX = 0;
var rotY = 0;
var rotZ = 0;
var ctm;

var t_increment = 0.1;
var r_increment = 5;


window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

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


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );

    // add pyramid
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ), // 0 front, left, bottom
        vec4( -0.5,  0.5,  0.5, 1.0 ), // 1 front, left, top
        vec4(  0.5,  0.5,  0.5, 1.0 ), // 2 front, right, top
        vec4(  0.5, -0.5,  0.5, 1.0 ), // 3 front, right, bottom
        vec4( -0.5, -0.5, -0.5, 1.0 ), // 4 back, left, bottom
        vec4( -0.5,  0.5, -0.5, 1.0 ), // 5 back, left, top
        vec4(  0.5,  0.5, -0.5, 1.0 ), // 6 back, right, top
        vec4(  0.5, -0.5, -0.5, 1.0 )  // 7 back, right, bottom
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

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
      
        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    ctm = world_to_camera;
    ctm = mult(ctm, translate(translation));
    ctm = mult(ctm, rotateX(rotX));
    ctm = mult(ctm, rotateY(rotY));
    ctm = mult(ctm, rotateZ(rotZ));
    
    
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}
