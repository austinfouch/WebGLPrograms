//Computer Graphics - Lab 4
//Elliott Barinberg && Austin Fouch

"use strict";

var canvas;
var gl;

var numTimesToSubdivide = 6;

var index = 0;

var pointsArray = [];
var normalsArray = [];

var program;

var near = -10;
var far = 10;
var radius = 1.5;
var theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;
var ambientLoc,specLoc, diffuseLoc, lightLoc, shininessLoc;

var left = -3.0;
var right = 3.0;
var ytop =3.0;
var bottom = -3.0;

var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4(0.5, 0.5, 0.5, 1.0 );
var lightSpecular = vec4(0.5, 0.5, 0.5, 1.0);

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.8, 0.8, 0.8, 1.0 );
var materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialShininess = 20.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var normalMatrix, normalMatrixLoc;
var ambientProduct, diffuseProduct, specularProduct;
var eye;
var at = vec3(0.0, 0.0, 0.0);
var up = vec3(0.0, 1.0, 0.0);

function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal);
     normal[3]  = 0.0;

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);


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


    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);


    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);

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
    /*
    var a = document.getElementById("ambient").checked ? ambientProduct : vec4(0, 0, 0, 1);
    var b = document.getElementById("specular").checked ? specularProduct : vec4(0, 0, 0, 1);
    var c = document.getElementById("diffuse").checked ? diffuseProduct : vec4(0, 0, 0, 1);
    */
    modelViewMatrixLoc = gl.getUniformLocation( program, "modelViewMatrix" );
    projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    normalMatrixLoc = gl.getUniformLocation( program, "normalMatrix" );
    /*
    gl.uniform4fv( gl.getUniformLocation(program, 
        "ambientProduct"), flatten(a) );    
    gl.uniform4fv( gl.getUniformLocation(program, 
        "specularProduct"), flatten(b) );    
    gl.uniform4fv(gl.getUniformLocation(program,
        "diffuseProduct"), flatten(c));
    /*
    gl.uniform4fv( gl.getUniformLocation(program,
       "ambientProduct"),flatten(ambientProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "diffuseProduct"),flatten(diffuseProduct) );
    gl.uniform4fv( gl.getUniformLocation(program,
       "specularProduct"),flatten(specularProduct) );
*/
    ambientLoc = gl.getUniformLocation(program, "ambientProduct");
    specLoc = gl.getUniformLocation(program, "specularProduct");
    diffuseLoc = gl.getUniformLocation(program, "diffuseProduct");
    lightLoc = gl.getUniformLocation(program, "lightPosition");
    shininessLoc = gl.getUniformLocation(program, "shininess");
    /*
    gl.uniform4fv( gl.getUniformLocation(program,
       "lightPosition"),flatten(lightPosition) );
    
    gl.uniform1f( gl.getUniformLocation(program,
       "shininess"),materialShininess );
    */
    render();
}


window.onkeypress = function( event ) {
    var key = String.fromCharCode(event.keyCode);
    switch( key ) {
        case 'Y':
            lightPosition[1]+=0.1;
            break;
        case 'y':
            lightPosition[1]-=0.1;
            break;

        case 'X':
            lightPosition[0]+=0.1;
            break;
        case 'x':
            lightPosition[0]-=0.1;
            break;

        case 'Z':
            lightPosition[2]+=0.1;
            break;
        case 'z':
            lightPosition[2]-=0.1;
            break;
        case 'S':
            if(materialShininess < 30)
            {
                materialShininess+= 1;
            }
            break;
        case 's': 
            if(materialShininess > 0)
            {
                materialShininess-= 1;
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

function updateMaterialAmbient(jscolor) {
    materialAmbient = hex2vec4(jscolor);
}
function updateMaterialDiffuse(jscolor) {
    materialDiffuse = hex2vec4(jscolor);
}
function updateMaterialSpecular(jscolor) {
    materialSpecular = hex2vec4(jscolor);
}
function updateLightDiffuse(jscolor) {
    lightDiffuse = hex2vec4(jscolor);
}
function updateLightAmbient(jscolor) {
    lightAmbient = hex2vec4(jscolor);
}
function updateLightSpecular(jscolor) {
    lightSpecular = hex2vec4(jscolor);
}

function render() {

    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);

    var a = document.getElementById("ambient").checked ? ambientProduct : vec4(0, 0, 0, 1);
    var b = document.getElementById("specular").checked ? specularProduct : vec4(0, 0, 0, 1);
    var c = document.getElementById("diffuse").checked ? diffuseProduct : vec4(0, 0, 0, 1)


    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    modelViewMatrix = lookAt(eye, at , up);
    projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    normalMatrix = [
        vec3(modelViewMatrix[0][0], modelViewMatrix[0][1], modelViewMatrix[0][2]),
        vec3(modelViewMatrix[1][0], modelViewMatrix[1][1], modelViewMatrix[1][2]),
        vec3(modelViewMatrix[2][0], modelViewMatrix[2][1], modelViewMatrix[2][2])
    ];

    gl.uniform4fv( ambientLoc, flatten(a) );    
    gl.uniform4fv( specLoc, flatten(b) );    
    gl.uniform4fv( diffuseLoc, flatten(c));
    gl.uniform4fv( lightLoc, flatten(lightPosition));
    gl.uniform1f( shininessLoc, materialShininess);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix) );
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix) );
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix) );

    for( var i=0; i<index; i+=3)
        gl.drawArrays( gl.TRIANGLES, i, 3 );

    window.requestAnimFrame(render);
}
