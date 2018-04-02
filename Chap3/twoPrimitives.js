"use strict";

var canvas;
var gl;

var theta1 = 0.0;
var theta2 = 0.0;
var thetaLoc;
var offsetLoc;

var vPosition;
var squareBuffer, triangleBuffer;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var square = [
        vec2(  0,  0.5 ),
        vec2(  -0.5,  0 ),
        vec2( 0.5,  0 ),
        vec2(  0, -0.5 )
    ];

    var triangle = [
       vec2(  0,  0.25 ),
       vec2(  -0.25,  -0.25 ),
       vec2( 0.25,  -0.25 )
    ];


    // Load the square vertex data into the GPU
    squareBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, squareBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(square), gl.STATIC_DRAW );

    // Load the triangle vertex data into the GPU
    triangleBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, triangleBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(triangle), gl.STATIC_DRAW );


    // Get the position reference, but no need to build the vertex attribute array yet.
    vPosition = gl.getAttribLocation( program, "vPosition" );
       
    thetaLoc = gl.getUniformLocation( program, "theta" );
    offsetLoc = gl.getUniformLocation( program, "offset" );

    render();
};


function activate(buffer) {
     gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
     gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
     gl.enableVertexAttribArray( vPosition );
}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    theta1 += 0.01;
    theta2 -= 0.02;
    
    activate(squareBuffer);
    gl.uniform1f( thetaLoc, theta1 );
    gl.uniform1f( offsetLoc, -0.5 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    activate(triangleBuffer);
    gl.uniform1f( thetaLoc, theta2 );
    gl.uniform1f( offsetLoc, 0.5 );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 3 );

    window.requestAnimFrame(render);
}
