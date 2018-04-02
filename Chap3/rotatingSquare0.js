"use strict";

var canvas;
var gl;

var theta = 0.0;
var thetaLoc;

// Moved these to global so we can re-use them in render
var vertices = [
    vec2(  0,  1 ),
    vec2(  -1,  0 ),
    vec2( 1,  0 ),
    vec2(  0, -1 )
];
var bufferId;

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

    // Load the data into the GPU
    bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    thetaLoc = gl.getUniformLocation( program, "theta" );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_STRIP, 0, 4 );

    // change theta
    theta += 0.1;
    // recompute the vertices
    var s = Math.sin( theta ), c = Math.cos( theta );

    var transformed = vertices.map(function(v) {
      return vec2(-s * v[1] + c * v[0], s * v[0] + c * v[1]);
    });
    // resend them
    gl.bufferSubData( gl.ARRAY_BUFFER, 0, flatten(transformed));

    // Weeeeeeeee!!!!
    window.requestAnimFrame(render);
}
