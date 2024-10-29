
// 
// provides functions resetRand() and rand()
// 
// https://stackoverflow.com/a/47593316
//

var seed = cyrb128(randomString(10));
var rand = null;

function randomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}

function resetRand(){
    rand = sfc32(seed[0], seed[1], seed[2], seed[3])
}
    
function cyrb128(str) {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

function sfc32(a, b, c, d) {
    return function() {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      var t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
}


class Warp {

    update(){
        throw new Error('Not implemented')
    }

    warpPoint(x,y){
        throw new Error('Not implemented');
    }
  
}


function mod(val,max){
    val = val%max
    if( val < 0 ){
        val += max
    }
    return val
}

class SimpleWarp extends Warp {
    
    update(){
        this.ellipse = [canvas.width/2,canvas.height/2,75,55] //x,y,a,b
        this.r2 = [Math.pow(this.ellipse[2],2),Math.pow(this.ellipse[3],2)]
        this.edge_width = 10
    }
    
    warpPoint(x,y){

        x = mod(x,canvas.width)
        y = mod(y,canvas.height)
        
        var wx = this.ellipse[0]
        var wy = this.ellipse[1]
        var wa = this.ellipse[2]
        var wb = this.ellipse[3]

        var dx = x-wx;
        var dy = y-wy;
        var inout = dx*dx / this.r2[0] + dy*dy / this.r2[1]
        if( inout > 1 ){
            return [x,y]
        }

        var t = (1.0-inout)
        t = Math.sqrt(t) * (t) + t*(1.0-t)
        var sr = t * this.edge_width
        var angle = Math.atan2(dy / wb, dx / wa);  
        
        return [wx + (wa-sr) * Math.cos(angle), wy + (wb-sr)*Math.sin(angle)]
    }
}

class SpinWarp extends Warp {
    
    update(){
        this.ellipse = [canvas.width/2,canvas.height/2,345,335] //x,y,a,b
        this.r2 = [Math.pow(this.ellipse[2],2),Math.pow(this.ellipse[3],2)]
        this.edge_width = 315
    }
    
    warpPoint(x,y){
        
        x = mod(x,canvas.width)
        y = mod(y,canvas.height)

        var wx = this.ellipse[0]
        var wy = this.ellipse[1]
        var wa = this.ellipse[2]
        var wb = this.ellipse[3]

        var dx = x-wx;
        var dy = y-wy;
        var inout = dx*dx / this.r2[0] + dy*dy / this.r2[1]

        var sr = (1.0-inout) * this.edge_width
        var angle = Math.atan2(dy / wb, dx / wa);  
        
        return [
            wx + 2*(wa-sr)*Math.cos(angle), 
            wy + 2*(wb-sr)*Math.sin(angle)
        ]
    }
}

class FunkyWarp extends Warp {
    
    update(){
        this.ellipse = [canvas.width/2,canvas.height/2,245,245] //x,y,a,b
        this.r2 = [Math.pow(this.ellipse[2],2),Math.pow(this.ellipse[3],2)]
        this.edge_width = 290
    }
    
    warpPoint(x,y){
        
        x = mod(x,canvas.width)
        y = mod(y,canvas.height)

        var wx = this.ellipse[0]
        var wy = this.ellipse[1]
        var wa = this.ellipse[2]
        var wb = this.ellipse[3]

        var dx = x-wx;
        var dy = y-wy;
        var inout = dx*dx / this.r2[0] + dy*dy / this.r2[1]
        var sr = (1.0-inout) * this.edge_width
        var angle = Math.atan2(dy / wb, dx / wa);  
        
        return [
            wx + 2*(wa-sr)*Math.cos(angle), 
            wy + 2*(wb-sr)*Math.sin(angle)
        ]
    }
}

// provides function getNextWarp()

var allWarps = [
    new SimpleWarp(),
    new SpinWarp(),
    new FunkyWarp(),
]

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

var warpSeq = shuffle(allWarps);

var warpIndex = 0;

function getNextWarp(){
    warpIndex = (warpIndex+1)%warpSeq.length
    return warpSeq[warpIndex]
}


// graphics context
var canvas;
var ctx;
var textDrawn = false;
const graphics_scale = 2;

var positions = null; // float array

// mouse
var canvasMouseX = 0 //pixels
var canvasMouseY = 0 //pixels
var mouse_forget_countdown = 0 //ms
var mouse_forget_duration = 3000 //ms

// environment
var particles_per_screen_pixel = 4e-2
var particle_radius = 1


// environment tranformation
var warp_sequence = []
var warp = new SimpleWarp()
var next_warp = null
var warp_transition_r = 1
var warp_transition_dr = 1e-2 // fraction per ms
var warp_change_odds = 1e-4 // chance of change per ms

// global environment movement
var pan_pos = [0,0]
var pan_vel = [0,.15]
var target_pan_vel = [0,.17] // target value for pan_vel
var max_wind_speed = 2   // max for pan_vel[0]
var pan_change_speed = 1e-1 // accel per ms
var wind_change_odds = 1e-4 // chance of change per ms

// individual particles movement
var anim_angle = 0
var anim_speed = .0005




function avg(p0,p1,r){
    return [p0[0]*(1.0-r)+p1[0]*r,p0[1]*(1.0-r)+p1[1]*r]
}

// Render particles with WebGL
function draw(fps) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    resetRand();
    for (let i = 0; i < particleCount; i++) {
        const a = anim_angle + rand() * Math.PI * 2;
        const r = rand() + 0.5;
        const x = pan_pos[0] + rand() * gl.canvas.width + r * Math.cos(a * Math.floor(rand() * 10));
        const y = pan_pos[1] + rand() * gl.canvas.height;
        const txy0 = warp.warpPoint(x, y);
        const txy = next_warp ? avg(txy0, next_warp.warpPoint(x, y), warp_transition_r) : txy0;

        positions[2*i] = txy[0] / graphics_scale
        positions[2*i+1] = txy[1] / graphics_scale;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    gl.drawArrays(gl.POINTS, 0, particleCount);    
    

    if( !textDrawn ){
      textDrawn = true
      console.log('drawing text')

    // draw logo on front canvas
    ctx.font = "italic 20px Blippo, fantasy";
    ctx.fontWeight = "35px";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    var x = canvas.width/2;
    var y = canvas.height/2;
    var oy = 5
    var dy = 10
    var ddr = 1
    ctx.fillStyle = "white";
    for( var ddx = -ddr ; ddx<=ddr ; ddx++ ){
        for( var ddy = -ddr ; ddy<=ddr ; ddy++ ){
            ctx.fillText("tessmero", x+ddx, y+oy-dy+ddy);
            ctx.fillText(". github . io", x+ddx, y+oy+dy+ddy);
        }      
    }        
    ctx.fillStyle = "black";
    ctx.fillText("tessmero", x, y+oy-dy);
    ctx.fillText(". github . io", x, y+oy+dy);
    }
}

function updateMousePos(event){
    
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    canvasMouseX = (event.clientX - rect.left) * scaleX;
    canvasMouseY = (event.clientY - rect.top) * scaleY;
    
    mouse_forget_countdown = mouse_forget_duration;
    
}

let gl, program;
let particleCount;
let positionBuffer;
let displayWidth, displayHeight;

// Initialize the screensaver
function init() {
    const canvas = document.getElementById("particleCanvas");
    // canvas.addEventListener("mousemove", updateMousePos);
    // canvas.addEventListener("click", updateMousePos);

    frontCanvas = document.getElementById("textCanvas");
    frontCanvas.addEventListener("mousemove", updateMousePos);
    frontCanvas.addEventListener("click", updateMousePos);
    ctx = frontCanvas.getContext("2d");

    // Initialize WebGL
    gl = canvas.getContext("webgl");
    if (!gl) {
        console.error("WebGL not supported.");
        return;
    }

    // Initialize WebGL program
    initWebGLProgram();
    requestAnimationFrame(gameLoop);
}

// Initialize WebGL program and shaders
function initWebGLProgram() {
    const vertexShaderSource = `
        attribute vec2 a_position;
        uniform vec2 u_resolution;
        void main() {
            vec2 position = (a_position / u_resolution) * 2.0 - 1.0;
            gl_PointSize = 2.0;
            gl_Position = vec4(position * vec2(1, -1), 0, 1);
        }
    `;
    const fragmentShaderSource = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
    `;
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    program = createProgram(vertexShader, fragmentShader);

    gl.useProgram(program);

    // Set up position buffer for particles
    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    // Initialize display dimensions
    displayWidth = gl.canvas.clientWidth;
    displayHeight = gl.canvas.clientHeight;
}

// Create shader
function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create program
function createProgram(vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }
    return program;
}

// Main game loop
let oldTimeStamp;

function gameLoop(timeStamp) {
    
    var msPassed = 0;
    if (oldTimeStamp) {
      msPassed = timeStamp - oldTimeStamp;
    }
    var secondsPassed = msPassed / 1000;
    oldTimeStamp = timeStamp;
    var fps = Math.round(1 / secondsPassed);


    msPassed = Math.min(msPassed,200)

    fitToContainer()
    update(msPassed);
    draw(fps);

    requestAnimationFrame(gameLoop);
}

let lastCanvasOffsetWidth = -1;
let lastCanvasOffsetHeight = -1;

function fitToContainer() {
  canvas = gl.canvas;

  let ow = canvas.offsetWidth;
  let oh = canvas.offsetHeight;

  if ( (ow !== lastCanvasOffsetWidth) || (oh !== lastCanvasOffsetHeight)) {
      console.log('size changed')

        canvas.width = canvas.offsetWidth / graphics_scale;
        canvas.height = canvas.offsetHeight / graphics_scale;
        frontCanvas.width = canvas.offsetWidth / graphics_scale;
        frontCanvas.height = canvas.offsetHeight / graphics_scale;

        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
        gl.uniform2f(resolutionUniformLocation, 
          gl.canvas.width / graphics_scale, gl.canvas.height / graphics_scale);

        // Recalculate particle count based on new canvas size
        particleCount = Math.floor(gl.canvas.width * gl.canvas.height * particles_per_screen_pixel);


        lastCanvasOffsetWidth = ow
        lastCanvasOffsetHeight = oh
        textDrawn = false
        positions = new Float32Array(2*particleCount)
    }
}


// Initialize the game
init();



function update(dt) {
    
    // transition between warp functions
    warp_transition_r = Math.min( warp_transition_r+warp_transition_dr, 1.0 )
    if( (warp_transition_r >= 1) & (Math.random() < warp_change_odds*dt)){
        warp_transition_r = 0;
        if( next_warp ){
            warp = next_warp;
        }
        next_warp = getNextWarp()
    }
    
      
      warp.update()
      if( next_warp ){
        next_warp.update()
      }
  
    // automatically change env movement if no recent mouse action
    mouse_forget_countdown = Math.max(0,mouse_forget_countdown-dt)
    if( mouse_forget_countdown <= 0 ){
        if( Math.random() < (wind_change_odds*dt) ){
            var old_wind_speed = target_pan_vel[0]
            target_pan_vel[0] = (Math.random()*2-1) * max_wind_speed
            if( Math.sign(old_wind_speed)!=0 & (Math.sign(target_pan_vel[0])!=Math.sign(old_wind_speed)) ){
                target_pan_vel[0] = 0
            }
            target_pan_vel[1] = .15
        }
        
    // move environment based on mouse pos
    } else {
        target_pan_vel[0]  = max_wind_speed * (canvasMouseX - canvas.width/2) / (canvas.width/2)
        target_pan_vel[1]  = max_wind_speed * (canvasMouseY - canvas.height/2) / (canvas.height/2)
    }
    
    // accel environment to target velocity
    var dx = target_pan_vel[0]-pan_vel[0]
    var dy = target_pan_vel[1]-pan_vel[1]
    if( dx*dx + dx*dy > pan_change_speed*pan_change_speed ){
        var angle = Math.atan2(dy,dx)
        pan_vel[0] += pan_change_speed*Math.cos(angle)
        pan_vel[1] += pan_change_speed*Math.sin(angle)
    }
    
    // update environment
    anim_angle = mod(anim_angle+anim_speed*dt,Math.PI*2)
    pan_pos[0] += pan_vel[0]
    pan_pos[1] += pan_vel[1]
}
