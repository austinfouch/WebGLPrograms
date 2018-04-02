"use strict";

var canvas;
var gl;

var max_rectangles = 200;
var max_vertices  = 4 * max_rectangles;
var size_of_vertex = 8; // 2 32-bit floats
var index = 0;
var first = true;

var t, t1, t2, t3, t4;

var toClip = function(event) {
    return vec2(2*event.clientX/canvas.width-1,
           2*(canvas.height-event.clientY)/canvas.height-1);
}

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.8, 0.8, 0.8, 1.0 );
    gl.clear( gl.COLOR_BUFFER_BIT );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, size_of_vertex*max_vertices, gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    
    canvas.addEventListener("mousedown", function(event){
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
        
        if(first) {
          first = false;
          t1 = toClip(event);
          
        }
        else {
          first = true;
          t2 = toClip(event);
          t3 = vec2(t1[0], t2[1]);
          t4 = vec2(t2[0], t1[1]);

          // Don't do this... we have all 4 vertices and they will be right next to eachother.
          // don't send them as 4 discrete packages!
          //gl.bufferSubData(gl.ARRAY_BUFFER, size_of_vertex*index, flatten(t1));
          //gl.bufferSubData(gl.ARRAY_BUFFER, size_of_vertex*(index+1), flatten(t3));
          //gl.bufferSubData(gl.ARRAY_BUFFER, size_of_vertex*(index+2), flatten(t2));
          //gl.bufferSubData(gl.ARRAY_BUFFER, size_of_vertex*(index+3), flatten(t4));

          // concatenate the vertices - they are just JavaScript arrays after all :)
          var rect_data = flatten(t1.concat(t3, t2, t4));
          gl.bufferSubData(gl.ARRAY_BUFFER, size_of_vertex*index, rect_data);
          index += 4;
        }
    } );

    render();
}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    // We draw in discret fans - since each rectangle is it's own fan.
    for(var i = 0; i<index; i+=4)
        gl.drawArrays( gl.TRIANGLE_FAN, i, 4 );

    window.requestAnimFrame(render);

}
