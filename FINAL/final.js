"use strict";

var canvas;
var gl;

var world_to_camera = scalem(1, 1, -1);
var translation = vec3(0, 0, 0);
var rotX = 30;
var rotY = 5;
var rotZ = 5;
var ctm;
var t_increment = 0.1;
var r_increment = 5;

var vTopBuffer;
var vBottomBuffer;
var vCylinderSideBuffer;
var vPosition;
var vNormal;

var numTimesToSubdivide = 6;

var index = 0;

var pointsArray = [];
var normalsArray = [];

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

var xval = 2.0;
var yval = 2.0;
var zval = -5.0;
var va = vec4(0.0, 0.0, -1.0, 1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightPosition = vec4(xval, yval, zval, 0.0 );

//grey colors
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 0.5, 0.5, 0.5, 1.0 );
var lightSpecular = vec4( 0.5, 0.5, 0.5, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var ambientProduct = mult(lightAmbient, materialAmbient);
var diffuseProduct = mult(lightDiffuse, materialDiffuse);
var specularProduct = mult(lightSpecular, materialSpecular);

var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;

var ambientLoc, diffuseLoc, specularLoc;

var shinyLoc, lightPosLoc;

var normalMatrix, normalMatrixLoc;

var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

var use_flat = true;

var CylinderTop = {
  vertices :[]
}
var pointsTop=[];
var pointsBottom=[];

var NormalsTop=[];
var NormalsBottom=[];
var CylinderHeight = 2.0;
var NumPoints = 100;

var CylinderSide=[];
var CylinderSideNormal=[];

//both will be represented as triangle fan drawings
function CreateCylinderEnds(center)
{
    var topCenter = vec4(center[0], center[1], center[2]+CylinderHeight*0.5, center[3]);
    var bottomCenter = vec4(center[0], center[1], center[2]-CylinderHeight*0.5, center[3]);
    var theta = 0;
    var increment = (2 * Math.PI) / (NumPoints);
    // 0.75 creates the cone
    pointsTop.push(vec4(topCenter[0], topCenter[1], topCenter[2], topCenter[3]));
    NormalsTop.push(vec4(topCenter[0], topCenter[1], topCenter[2], 0.0));
    for ( var i=0; (pointsTop.length-1)<=NumPoints; i++){
        var x=Math.cos(theta);
        var y=Math.sin(theta);
        pointsTop.push(vec4(x, y, CylinderHeight*0.5, topCenter[3]));
        NormalsTop.push(vec4(topCenter[0], topCenter[1], topCenter[2], 0.0));
        theta-=increment;
    }

    theta =0;
    increment = (2*Math.PI) / NumPoints;
    pointsBottom.push(bottomCenter);
    NormalsBottom.push(vec4(bottomCenter[0], bottomCenter[1], bottomCenter[2], 0.0))
    for ( var i=0; (pointsBottom.length-1)<=NumPoints; i++){
        var x=Math.cos(theta);
        var y=Math.sin(theta);
        pointsBottom.push(vec4(x, y, -CylinderHeight*0.5, bottomCenter[3]));
        NormalsBottom.push(vec4(bottomCenter[0], bottomCenter[1], bottomCenter[2], 0.0));
        theta+=increment;
    }
}

//will be represented as a triangle strip
function CreateCylinderSides(center)
{
    //get the values for the ends and use them to construct the sides.
    for (var i=1; CylinderSide.length-1<(NumPoints*2); i++) {
        CylinderSide.push(pointsTop[i]);
        CylinderSide.push(pointsBottom[pointsBottom.length-i]);
        CylinderSideNormal.push(vec4(pointsTop[i][0], pointsTop[i][1], pointsTop[i][2], 0.0))
        CylinderSideNormal.push(vec4(pointsBottom[pointsBottom.length-i][0], pointsBottom[pointsBottom.length-i][1], pointsBottom[pointsBottom.length-i][2], 0.0))
    }
}

//will call subfunctions to calculate point info and pass it into the respective arrays
function CreateCylinder(center)
{
    CreateCylinderEnds(center);
    CreateCylinderSides(center);
}

function triangle(a, b, c) {

    normalsArray.push(a[0],a[1], a[2], 0.0);
    normalsArray.push(b[0],b[1], b[2], 0.0);
    normalsArray.push(c[0],c[1], c[2], 0.0);

    pointsArray.push(a);
    pointsArray.push(b);
    pointsArray.push(c);

    index += 3;
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        var ab = mix( a, b, 0.5);
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function hex2vec4(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? vec4(parseInt(result[1], 16)/255,
       parseInt(result[2], 16)/255,
       parseInt(result[3], 16)/255)
     : null;
}

function updateMaterialAmbient(jscolor) {
    materialAmbient = hex2vec4(jscolor);
    ambientProduct = mult(lightAmbient, materialAmbient);
}

function updateMaterialDiffuse(jscolor) {
    materialDiffuse = hex2vec4(jscolor);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
}

function updateMaterialSpecular(jscolor)
{
  materialSpecular = hex2vec4(jscolor);
  specularProduct = mult(lightSpecular, materialSpecular);
}

function updateLightAmbient(jscolor) {
    lightAmbient = hex2vec4(jscolor);
    ambientProduct = mult(lightAmbient, materialAmbient);
}

function updateLightDiffuse(jscolor) {
    lightDiffuse = hex2vec4(jscolor);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
}

function updateLightSpecular(jscolor)
{
  lightSpecular = hex2vec4(jscolor);
  specularProduct = mult(lightSpecular, materialSpecular);
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
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    CreateCylinder(vec4(0.0, 0.0, 0.0, 1.0));

    var nTopBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nTopBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(NormalsTop), gl.STATIC_DRAW);

    var nBottomBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBottomBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(NormalsBottom), gl.STATIC_DRAW);

    var nCylinderSideBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nCylinderSideBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(CylinderSideNormal), gl.STATIC_DRAW);

    vNormal = gl.getAttribLocation( program, "vNormal" );

    vTopBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vTopBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsTop), gl.STATIC_DRAW);

    vBottomBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBottomBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsBottom), gl.STATIC_DRAW);

    vCylinderSideBuffer=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vCylinderSideBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(CylinderSide), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation( program, "vPosition");

    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );

    ambientLoc = gl.getUniformLocation(program, "ambientProduct");
    diffuseLoc = gl.getUniformLocation(program, "diffuseProduct");
    specularLoc = gl.getUniformLocation(program, "specularProduct");

    shinyLoc = gl.getUniformLocation(program, "shininess");
    lightPosLoc = gl.getUniformLocation(program, "lightPosition");
    gl.enable(gl.CULL_FACE);
    render();
}

window.onkeypress = function( event ) {
    var key = String.fromCharCode(event.keyCode);

    switch( key ) {
      //S and s handle shininess of material
        case 'S':
            if(materialShininess<30)
            {
                materialShininess++;
            }
            break;
        case 's':
            if(materialShininess>0)
            {
            materialShininess--;
            }
            break;
        //x, y, z handle light position
        case 'x':
            xval -=0.1;
            lightPosition = vec4(xval, yval, zval, 0.0);
            break;
        case 'X':
            xval +=0.1;
            lightPosition = vec4(xval, yval, zval, 0.0);
            break;
        case 'y':
            yval-=0.1;
            lightPosition = vec4(xval, yval, zval, 0.0);
            break;
        case 'Y':
            yval+=0.1
            lightPosition = vec4(xval, yval, zval, 0.0);
            break;
        case 'z':
            zval-=0.1
            lightPosition = vec4(xval, yval, zval, 0.0);
            break;
        case 'Z':
            zval+=0.1
            lightPosition = vec4(xval, yval, zval, 0.0);
            break;
        case 'W':
            rotY-= r_increment;
            break;
        case 'w':
            rotY+= r_increment;
            break;

        case 'Q':
            rotX-= r_increment;
            break;
        case 'q':
            rotX+= r_increment;
            break;

        case 'E':
            rotZ-= r_increment;
            break;
        case 'e':
            rotZ+= r_increment;
            break;
        }
};

function activate_buffer(info) {
    gl.bindBuffer( gl.ARRAY_BUFFER, info);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vNormal);
}

function render() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    ctm = world_to_camera;
    ctm = mult(ctm, translate(translation));
    ctm = mult(ctm, rotateX(rotX));
    ctm = mult(ctm, rotateY(rotY));
    ctm = mult(ctm, rotateZ(rotZ));

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    var amb = document.getElementById("ambient").checked ? ambientProduct : vec4(0, 0, 0, 1);
    gl.uniform4fv( ambientLoc, flatten(amb) );
    var diff = document.getElementById("diffuse").checked ? diffuseProduct : vec4(0, 0, 0, 1);
    gl.uniform4fv( diffuseLoc, flatten(diff) );
    var spec = document.getElementById("specular").checked ? specularProduct : vec4(0, 0, 0, 1);
    gl.uniform4fv( specularLoc, flatten(spec) );

    gl.uniform4fv( lightPosLoc, flatten(lightPosition) );
    gl.uniform1f( shinyLoc , materialShininess );

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    //transform matrix
    gl.uniformMatrix4fv( modelViewMatrixLoc, false, flatten(ctm));

    activate_buffer(vTopBuffer);
    gl.drawArrays( gl.TRIANGLE_FAN, 0, pointsTop.length);
    activate_buffer(vBottomBuffer);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, pointsBottom.length);
    activate_buffer(vCylinderSideBuffer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, CylinderSide.length);

    window.requestAnimFrame(render);
}
