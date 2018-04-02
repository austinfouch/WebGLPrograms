"use strict";

var canvas;
var gl;
var program;


class GlObject {
  constructor(init) {
    this.points = []; 
    this.colors = [];
    this.init = init;
  }
  
  draw() {
    gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBuffer );
    gl.vertexAttribPointer( this.colorAttribute, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( this.colorAttribute );

    gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer );
    gl.vertexAttribPointer( this.positionAttribute, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( this.positionAttribute );

    gl.drawArrays( gl.TRIANGLES, 0, this.points.length );
  }

  setup() {
    this.init();
    this.colorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.colors), gl.STATIC_DRAW );

    this.colorAttribute = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( this.colorAttribute, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( this.colorAttribute );

    this.positionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(this.points), gl.STATIC_DRAW );

    this.positionAttribute = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( this.positionAttribute, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( this.positionAttribute );
  }
}

var square = new GlObject(function ()
    {
        var vertices = [
            vec4(  0.0, 1.0, 0, 1.0 ),
            vec4(  1.0, 1.0, 0, 1.0 ),
            vec4(  1.0, 0.0, 0, 1.0 ),
            vec4(  0.0, 0.0, 0, 1.0 ),
        ];
        
        var indices = [ 1, 0, 3, 1, 3, 2 ];

        for ( var i = 0; i < indices.length; ++i ) {
            this.points.push( vertices[indices[i]] );
            this.colors.push(vec4(0, 0, 1, 1));
        }
    });


var triangle = new GlObject(function ()
    {
        var vertices = [
            vec4(  1, 0, 0, 1.0 ),
            vec4(  0.5, 1.0, 0, 1.0 ),
            vec4(  0, 0.0, 0, 1.0 ),
        ];
        
        var indices = [0, 1, 2];

        for ( var i = 0; i < indices.length; ++i ) {
            this.points.push( vertices[indices[i]] );
            this.colors.push(vec4(1, 0, 0, 1));
        }
    });

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

    

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    square.setup();
    triangle.setup();
       

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





function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var stack = [];
    var ctm = world_to_camera;
    var third = 1.0/3;
    stack.push(ctm); // good place to return to.

    ctm = mult(ctm, translate(vec3(0, third, 0)));
    ctm = mult(ctm, scalem(1,third, 1));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    square.draw();

    ctm = stack.pop();
    stack.push(ctm);
    ctm = mult(ctm, translate(vec3(0, 2*third, 0)));
    ctm = mult(ctm, scalem(third,third, 1));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    triangle.draw();    

    ctm = stack.pop();
    stack.push(ctm);
    ctm = mult(ctm, rotateZ(180));
    ctm = mult(ctm, translate(vec3(-1, -third, 0)));
    ctm = mult(ctm, scalem(third,third, 1));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    triangle.draw();    
    
    requestAnimFrame( render );
}
