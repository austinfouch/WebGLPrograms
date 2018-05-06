
//Computer Graphics - Lab2
//Elliott Barinberg
//Austin Fouch

"use strict";
var triangleColors = [];
var circleColors = [];
var gl;

var sizeof_float = 4;  // our float's are 32-bit
var sizeof_vertex = sizeof_float * 2; // only 2d vertices in this example
var sizeof_color = sizeof_float * 4;
var NumPoints = 100;
var maxNumTriangles = 200;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;
var cindex = 0;
var first = 0;
var A,B,C;
var a,b,c,aP,bP,cP;
var centerOfCircle;
var triangleB, circleB, vPosition;
var cBuffer, vColor;
var dotProd = function(vector1,vector2) {
    return ((vector1[0]*vector2[0]) + (vector1[1]*vector2[1]));
}

function activate(buffer){
	gl.bindBuffer( gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
}
function cactivate(cbuffer){
	gl.bindBuffer( gl.ARRAY_BUFFER, cbuffer);
    
}

window.onload = function init(){
	
    var canvas = document.getElementById( "gl-canvas" );
    // console.log("here");
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
	
	 gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );

    //  Load shaders and initialize attribute buffers

   var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    triangleB = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleB);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW);

	circleB = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleB);
    gl.bufferData(gl.ARRAY_BUFFER, 8*maxNumVertices, gl.STATIC_DRAW);
	
	cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    vColor = gl.getAttribLocation( program, "vColor");	
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
	
    vPosition = gl.getAttribLocation( program, "vPosition");
	triangleColors.push(vec4( 0.0, 1.0, 1.0, 1.0 ));
	triangleColors.push(vec4( 0.0, 1.0, 1.0, 1.0 ));
	triangleColors.push(vec4( 0.0, 1.0, 1.0, 1.0 ));
	
    canvas.addEventListener("mousedown", function(event){
        gl.bindBuffer( gl.ARRAY_BUFFER, triangleB);
		if(index == 3)
			index = 0;
        if(first == 0) {
			first = 1;			
			cindex = 0;
			A = vec2(2*event.clientX/canvas.width-1,2*(canvas.height-event.clientY)/canvas.height-1);
			gl.bufferSubData(gl.ARRAY_BUFFER, sizeof_vertex*index, flatten(A));
			index++;
		}
        else if(first == 1) {
			first = 2;
			B = vec2(2*event.clientX/canvas.width-1,2*(canvas.height-event.clientY)/canvas.height-1);
			gl.bufferSubData(gl.ARRAY_BUFFER, sizeof_vertex*index, flatten(B));
			index++;
        }
		else{
			first = 0;
			C = vec2(2*event.clientX/canvas.width-1,
            2*(canvas.height-event.clientY)/canvas.height-1);
			gl.bufferSubData(gl.ARRAY_BUFFER, sizeof_vertex*index, flatten(C));
			index = 3;
			
			a = vec2((B[0] - A[0]),(B[1] - A[1]));
			aP = vec2(-1*a[1],a[0]);
			b = vec2((C[0] - B[0]),(C[1] - B[1]));
			bP = vec2(-1*b[1],b[0]);
			c = vec2((A[0] - C[0]),(A[1] - C[1]));
			cP = vec2(-1*c[1],c[0]);
			
			var bDotC = dotProd(b,c);
			// console.log(bDotC);
			var aDocC = dotProd(aP,c);
			// console.log(aDocC);
			// console.log(a[0]);
			// console.log(((bDotC / aDocC) * aP[0]));
			// console.log(((a[0] + ((bDotC / aDocC) * aP[0]))/2));
			
			var theX = (A[0] + ((a[0] + ((bDotC / aDocC) * aP[0]))/2));
			var theY = (A[1] + ((a[1] + ((bDotC / aDocC) * aP[1]))/2));
			centerOfCircle = vec2(theX,theY);
			console.log(centerOfCircle[0] + " " + centerOfCircle[1]);
			var radiusOfCircle = Math.sqrt(Math.pow((centerOfCircle[0] - A[0]),2) + Math.pow((centerOfCircle[1] - A[1]),2));
			var points = [];
			var theta = 0;
			var test = true;
			var tmp;
			for ( var i = 0; i < NumPoints; i++ ) 
			{
				theta = ((i*(2*Math.PI))/100);
				var x = centerOfCircle[0] + (radiusOfCircle*(Math.cos(theta)));
				var y = centerOfCircle[1] + (radiusOfCircle*(Math.sin(theta)));
				points.push( vec2(x,y) );
				circleColors[i] = (vec4( 1.0, 0.0, 0.0, 1.0 ));
			}
			console.log(JSON.stringify(points, null, 2));
			gl.bindBuffer( gl.ARRAY_BUFFER, circleB);
			gl.bufferSubData(gl.ARRAY_BUFFER, cindex, flatten(points));
			cindex = NumPoints;
		}
    } );
    render();
};

function render()
{
     gl.clear( gl.COLOR_BUFFER_BIT );
	 activate(triangleB);
	 gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);		 
	 gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(triangleColors));
	 if(index == 3)
		gl.drawArrays( gl.TRIANGLE_FAN, 0, index);
	 else
		 gl.drawArrays( gl.POINTS, 0, index);
	 activate(circleB);
	 gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(circleColors));
	 gl.drawArrays( gl.LINE_LOOP, 0, cindex);
     window.requestAnimFrame(render);
}