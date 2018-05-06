// Author:  Austin Fouch
// Date:    04/17/2018
// CMPS 342 Homework 2
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

var fcolorLocation;
var modelViewMatrixLoc;
var world_to_camera = scalem(1, 1, -1);
var translation = vec3(0, 0, 0);
var rotX = 0;
var rotY = 0;
var rotZ = 0;
var ctm;
var theta = 0;
var thetaLoc;
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
    fcolorLocation = gl.getUniformLocation(program, "fColor");

    render();
}

function drawHouse(angle)
{
    var stack = [];
    var ctm = world_to_camera;
    var sixth = 1.0/6;
    var third = 1.0/3;
    var half = 1.0/2;
    var quart = 1.0/4;
    var eigth = 1.0/8;
    var tenth = 1.0/10;

    // determinig where to rotate and translate house based off angle
    ctm = mult(ctm, rotateZ(angle));
    if(angle == 180) {
        ctm = mult(ctm, translate(vec3(0, -half, 0)));
    }
    if(angle == 90) {
        ctm = mult(ctm, translate(vec3(.85, .85, 0)));
    }
    if(angle == -90) {
        ctm = mult(ctm, translate(vec3(1.33, .85, 0)));
    }

    stack.push(ctm);
    // sets up inital transform matrix
    ctm = mult(ctm, translate(vec3(-1, -third, 0)));
    ctm = mult(ctm, scalem(half,third, 1));
    
    //draw bottom window
    ctm = mult(ctm, translate(vec3(eigth, eigth, 0)));
    ctm = mult(ctm, scalem(third,quart, 1));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    gl.uniform4f(fcolorLocation, 0, 0, 1, 1);
    square.draw();
    
    //draw door
    stack.push(ctm);
    ctm = mult(ctm, translate(vec3(1.8, -half, 0)));
    ctm = mult(ctm, scalem(half, 2, 1));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    gl.uniform4f(fcolorLocation, 1, 1, 0, 1);
    square.draw();

    //draw top 3 windows
    ctm = stack.pop();
    stack.push(ctm);
    ctm = mult(ctm, translate(vec3(third, 2, 0)));
    ctm = mult(ctm, scalem(half,1, 1));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    gl.uniform4f(fcolorLocation, 0, 0, 1, 1);
    square.draw();

    ctm = mult(ctm, translate(vec3(1.5, 0, 0)));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    gl.uniform4f(fcolorLocation, 0, 0, 1, 1);
    square.draw();

    ctm = mult(ctm, translate(vec3(1.5, 0, 0)));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    gl.uniform4f(fcolorLocation, 0, 0, 1, 1);
    square.draw();

    //draw actual house
    ctm = stack.pop();
    ctm = stack.pop();
    stack.push(ctm);
    ctm = mult(ctm, translate(vec3(-1, -third, 0)));
    ctm = mult(ctm, scalem(half,third, 1));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    gl.uniform4f(fcolorLocation, 0, 1, 1, 1);
    square.draw();

    //draw roof
    ctm = stack.pop();
    stack.push(ctm);
    ctm = mult(ctm, translate(vec3(-1, 0, 0)));
    ctm = mult(ctm, scalem(half,eigth, 1));
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm) );
    gl.uniform4f(fcolorLocation, 1, 0, 0, 1);
    triangle.draw();    
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    drawHouse(0);
    drawHouse(180);
    drawHouse(90);
    drawHouse(-90);
}