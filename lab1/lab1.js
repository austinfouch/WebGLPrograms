"use strict";

var canvas;
var gl;
var points;
var colors;

var NumPoints = 100;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the vertices of our 3D gasket

    var vertices = [
        vec3( 0.0, 1.0, 0.0 ),
        vec3( 0.0, -1.0, 0.0 ),
        vec3( 1.0,  0.0,  0.0 ),
        vec3( -1.0, 0.0, 0.0 ),
    ];

    // initialize points and colors
    points = [ vec3( 0.0, 0.0, 0.0 ) ];
    colors = [ vec4( 1.0, 1.0, 1.0, 1.0) ];
    var theta = 0;
    var increment = (2 * Math.PI) / NumPoints;
    for ( var i = 0; (points.length - 1) <= NumPoints; ++i) {
        var x = Math.cos(theta);
        var y = Math.sin(theta);
        points.push(vec3(x, y, 0.0));
        colors.push(vec4( 
            (Math.sin(theta) + 1) / 2,
            (Math.cos(theta) + 1) / 2,
            (Math.sin(2* Math.PI - theta) + 1) / 2,
            1.0
        ));
        theta += increment;
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
    gl.enable( gl.DEPTH_TEST );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    // color data
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );
    
    render();
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, points.length );
}
