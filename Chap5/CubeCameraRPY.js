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


var modelMatrix;
var ctMatrixLoc;

var make_camera = function() {
    
    var params = {
        eye : vec3(0, 0, 10),
        u : vec3(1, 0, 0),
        v : vec3(0, 1, 0),
        n : vec3(0, 0, 1),
        near : -10,
        far : 10,
        left : -1.0,
        right : 1.0,
        ytop : 1.00,
        bottom : -1.0    
    }
    

    return {
        params: params,
        pan : function(dx, dy, dz) {
            params.eye[0] += dx;
            params.eye[1] += dy;
            params.eye[2] += dz;
        } ,
        pitch : function (angle) {
            var cs = Math.cos(Math.PI / 180 * angle);
            var sn = Math.sin(Math.PI / 180 * angle);
            params.n = normalize(vec3(cs*params.n[0] - sn*params.v[0], cs*params.n[1] - sn*params.v[1], cs*params.n[2] - sn*params.v[2]));
            params.v = normalize(vec3(sn*params.n[0] + cs*params.v[0], sn*params.n[1] + cs*params.v[1], sn*params.n[2] + cs*params.v[2]));
        }, 
        yaw : function(angle) {
            var cs = Math.cos(Math.PI / 180 * angle);
            var sn = Math.sin(Math.PI / 180 * angle);
            params.u = normalize(vec3(cs*params.u[0] - sn*params.n[0], cs*params.u[1] - sn*params.n[1], cs*params.u[2] - sn*params.n[2]));
            params.n = normalize(vec3(sn*params.u[0] + cs*params.n[0], sn*params.u[1] + cs*params.n[1], sn*params.u[2] + cs*params.n[2]));    
        }, 
        roll : function(angle) {
            var cs = Math.cos(Math.PI / 180 * -angle);
            var sn = Math.sin(Math.PI / 180 * -angle);
            params.u = normalize(vec3(cs*params.u[0] - sn*params.v[0], cs*params.u[1] - sn*params.v[1], cs*params.u[2] - sn*params.v[2]));
            params.v = normalize(vec3(sn*params.u[0] + cs*params.v[0], sn*params.u[1] + cs*params.v[1], sn*params.u[2] + cs*params.v[2]));   
        }, 
        view : function() {
            return mat4(
                vec4( params.u, -dot(params.u, params.eye) ),
                vec4( params.v, -dot(params.v, params.eye) ),
                vec4( params.n, -dot(params.n, params.eye) ),
                vec4()
            )
        }, 
        projection : function() {
            return ortho( params.left, params.right, params.bottom, params.ytop, params.near, params.far );
        }
    }
}


var camera = make_camera();



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
    ctMatrixLoc = gl.getUniformLocation( program, "ctMatrix" );
   
    // Create the model matrix (Y and Z rotation)
    modelMatrix = rotateY(30);
    modelMatrix = mult(modelMatrix, rotateZ(10));
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
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



window.onkeypress = function( event ) {
    var key = String.fromCharCode(event.keyCode);
    var angle = 5;
    switch( key ) {
        case 'x':
            camera.pan(0.5, 0, 0);
            break;
        case 'X':
            camera.pan(-0.5, 0, 0);
            break;
        case 'y':
            camera.pan(0.0, 0.5, 0);
            break;
        case 'Y':
            camera.pan(0.0, -0.5, 0);
            break;

        case 'z':
            camera.pan(0.0, 0, 0.5);
            break;
        case 'Z':
            camera.pan(0.0, 0, -0.5);
            break;

        case 'p':
            camera.pitch(5);
            break;
        case 'P':
            camera.pitch(-5);
            break;

        case 'w':
            camera.yaw(5);
            break;
        case 'W':
            camera.yaw(-5);
            break;

         case 'r':
            camera.roll(5);
            break;
        case 'R':
            camera.roll(-5);
            break;
            
    }
};


function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   
    
    var m = mult(mult(camera.projection(), camera.view()), modelMatrix);
    
    gl.uniformMatrix4fv( ctMatrixLoc, false, flatten(m) );
    
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

    requestAnimFrame( render );
}
