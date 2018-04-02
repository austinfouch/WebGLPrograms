"use strict";

var canvas;
var gl;

var sizeof_float = 4;  // our float's are 32-bit
var sizeof_vertex = sizeof_float * 2; // only 2d vertices in this example
var sizeof_color = sizeof_float * 4;
var maxVertices = 500;

var index = 0;
var reached_max = false;
var mouse_down = false;// state variable for mouse drag part

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


var toClip = function(event) {
    var clip = vec2(2*event.clientX/canvas.width-1,
           2*(canvas.height-event.clientY)/canvas.height-1);

    console.log(event.clientX + ", " + event.clientY + " -> " + JSON.stringify(clip));
    return clip;

}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    var add_point = function(t) {

        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
        gl.bufferSubData(gl.ARRAY_BUFFER, sizeof_vertex*index, flatten(t));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        t = vec4(colors[(index)%colors.length]);
        gl.bufferSubData(gl.ARRAY_BUFFER, sizeof_color*index, flatten(t));
        index++;
        if ( index >= maxVertices ) {
            index =0; // cycle back - otherwise we'll blow out the array buffer we created on the GPU!
            reached_max = true;  // we'll draw the max number of points from now on, since the buffer filled.
        }
    }

    
    window.onkeypress = function() {
        add_point ( vec2((Math.random() - 0.5 ) *2, (Math.random() - 0.5 ) *2));
    }


    /*
    canvas.addEventListener("mousedown", function(event){
        var t = toClip(event);
        add_point(t);
    } );
    */

    
    canvas.addEventListener("mousedown", function(event){
      mouse_down = true;
    });

    canvas.addEventListener("mouseup", function(event){
      mouse_down = false;
    });

    canvas.addEventListener("mousemove", function(event){
        if(mouse_down) {
            var t = toClip(event);
            add_point(t);
        }
    });
    

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    // Create the vertex buffer
    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, sizeof_vertex * maxVertices, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, sizeof_color * maxVertices, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    render();

}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.POINTS, 0, reached_max? maxVertices : index );

    window.requestAnimFrame(render);

}
