"use strict";

var canvas;
var gl;
var program;

var numTimesToSubdivide = 5;

var moveX = 0.0;
var moveY = 0.0;
var moveZ = 0.0;
var moveIn = 0.1;

var index = 0;

var pointsArray = [];
var normalsArray = [];

var materialColor = hex2vec4("#1697fa");



var materialColorLoc;


var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var lightPosition = vec4(1.0, 1.0, 1, 0.0 );

var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var use_flat = true;

var ambientProduct;
var diffuseProduct;
var specularProduct;

var angle, top_center, bottom_center, te1, te2, be1, be2;

function triangle(a, b, c) {

     // Since the circle is centered at (roughly) 0, 0, 0, the
     // true normal vector is simply the same as the point - but with 0
     // as it's fourth component rather than 1.
     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);

     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     index += 3;
}

window.onload = function init() {

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

    generateCylinder();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    materialColorLoc =  gl.getUniformLocation(program,"materialColor");

    render();
}

function generateCylinder()
{
  
    angle = (2 * Math.PI) / 12;
  

    for(var i = 0; i < 12; i++)
    {
        // Top Disk
        top_center = vec4(0, 80, 0);
        te1 = vec4(radius * Math.cos(angle * i),60,radius * Math.sin(angle * i));
        te2 = vec4(radius * Math.cos(angle * (i+1)),60,radius * Math.sin(angle * (i+1)));

        // Bottom Disk
        bottom_center = vec4(0, -60, 0);
        be1 = vec4(radius * Math.cos(angle * i),-60,radius * Math.sin(angle * i));
        be2 = vec4(radius * Math.cos(angle * (i+1)),-60,radius * Math.sin(angle * (i+1)));
    
        // add to points array
        triangle(top_center,te2,te1);
        triangle(te1,te2,be2);
        triangle(be1,be2,te1);
        triangle(bottom_center,be1,be2);
    }


}

window.onkeypress = function(event){
  var key = String.fromCharCode(event.keyCode);
  switch (key) {
    case 'X':
      lightPosition[0] += 0.1;
      break;
    case 'Y':
      lightPosition[1] += 0.1;
      break;
    case 'Z':
      lightPosition[2] += 0.1;
      break;
    case 'x':
      lightPosition[0] -= 0.1;
      break;
    case 'y':
      lightPosition[1] -= 0.1;
      break;
    case 'z':
      lightPosition[2] -= 0.1;
      break;
    case 'S':
      if(materialShininess < 30)
      {
        materialShininess += 1;
      }
      break;
    case 's':
      if(materialShininess > 0)
      {
        materialShininess -= 1;
      }
      break;
  }
};


function hex2vec4(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? vec4(parseInt(result[1], 16)/255,
       parseInt(result[2], 16)/255,
       parseInt(result[3], 16)/255)
     : null;
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));


    modelViewMatrix = lookAt(eye, at , up);
    modelViewMatrix = mult(modelViewMatrix,scalem(1,1/6,2));
    modelViewMatrix = mult(modelViewMatrix,rotateX(30));
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    //normalMatrix = mult(normalMatrix,scalem(1,1/60,1));

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    for( var i=0; i<index; i+=3)
    {
        gl.drawArrays( gl.TRIANGLE_STRIP, i, 3 );
    }

    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv( gl.getUniformLocation(program, "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "specularProduct"),flatten(specularProduct) );
    gl.uniform4fv( gl.getUniformLocation(program, "lightPosition"),flatten(lightPosition) );
    gl.uniform4fv(materialColorLoc,flatten(materialColor));
    gl.uniform1f( gl.getUniformLocation(program, "shininess"),materialShininess );


    window.requestAnimFrame(render);
}
