
class Vector {
    
    constructor(x,y){
        this.x = x
        this.y = y
    }
    
    static polar(angle,magnitude){
        var x = magnitude*Math.cos(angle)
        var y = magnitude*Math.sin(angle)
        return new Vector(x,y)
    }
    
    copy(){
        return new Vector(this.x,this.y)
    }
    
    // rotate around origin
    rotate(angle){
        var cos = Math.cos(angle)
        var sin = Math.sin(angle)
        return new Vector( this.x*cos-this.y*sin, this.y*cos+this.x*sin )
    }
    
    getAngle(){
        return Math.atan2( this.y, this.x )
    }
    
    getD2(){
        return Math.pow(this.x,2) + Math.pow(this.y,2)
    }
    
    getMagnitude(){
        return Math.sqrt( this.getD2() )
    }
    
    // get unit vector with same angle
    normalize(){
        return this.mul( 1.0/this.getMagnitude() )
    }
    
    add( o ){
        return new Vector( this.x+o.x, this.y+o.y )
    }
    
    sub( o ){
        return new Vector( this.x-o.x, this.y-o.y )
    }
    
    mul( k ){
        return new Vector( this.x*k, this.y*k )
    }
}

// shorthands
var pi = Math.PI
var pio2 = Math.PI/2
var twopi = 2*Math.PI
function v(){return new Vector(...arguments)}
function vp(){return Vector.polar(...arguments)}


function randRange(min,max){
    return min + rand()*(max-min)
}

function cleanAngle(a){
    a = nnmod(a,twopi)
    if( a > Math.PI ){
        a -= twopi
    }
    if( a < -Math.PI ){
        a += twopi
    }
    return a        
}

//non-negative mod
function nnmod(a,b){
    var r = a%b
    return (r>=0) ? r : r+b
}

// weighted avg
function avg(a,b,r=.5){
    return (a*(1.0-r)) + (b*r)
}
function va(a,b,r=.5){
    return v(avg(a.x,b.x,r),avg(a.y,b.y,r))
}

function normal(p1,p2,p3){
    return [
        (p2[1] - p1[1]) * (p3[2] - p1[2]) - (p2[2] - p1[2]) * (p3[1] - p1[1]),
        (p2[2] - p1[2]) * (p3[0] - p1[0]) - (p2[0] - p1[0]) * (p3[2] - p1[2]),
        (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p2[1] - p1[1]) * (p3[0] - p1[0])
    ];
}

function calculateLightingIntensity(norm) {
    const lightDirection = global.lightDirection
    const dotProduct = norm[0] * lightDirection[0] + norm[1] * lightDirection[1] + norm[2] * lightDirection[2];
    //console.log(dotProduct)
    var result = Math.max(0,Math.min(1,(dotProduct+5)/10))
    
    return result
    
    var step = .5
    return Math.floor(result/step)*step
}

function arePointsClockwise(p1,p2,p3,p4) {
    const crossProduct = (p1[0] - p2[0]) * (p3[1] - p2[1]) - (p1[1] - p2[1]) * (p3[0] - p2[0]);
    return crossProduct > 0;
}


function rotateX(point, angle) {
    let [x, y, z] = point;
    return [
        x,
        y * Math.cos(angle) - z * Math.sin(angle),
        y * Math.sin(angle) + z * Math.cos(angle)
    ];
}

function rotateY(point, angle) {
    let [x, y, z] = point;
    return [
        z * Math.sin(angle) + x * Math.cos(angle),
        y,
        z * Math.cos(angle) - x * Math.sin(angle)
    ];
}

function rotateZ(point, angle) {
    let [x, y, z] = point;
    return [
        x * Math.cos(angle) - y * Math.sin(angle),
        x * Math.sin(angle) + y * Math.cos(angle),
        z
    ];
}

function project(point) {
    let [x, y, z] = point;
    let zoom = 200;
    let distance = 4;
    let scale = global.canvas.width / zoom;
    scale *= 5e-2
    x = x * scale;
    y = y * scale;
    z = z * scale;
    return [
        global.centerPos.x + x / (z + distance),
        global.centerPos.y + y / (z + distance)
    ];
}

// 
// provides functions resetRand() and rand()
// 
// https://stackoverflow.com/a/47593316
//

var seed = null;
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

function resetRand(hard=false){
    if( hard || (seed==null) ){
        seed = cyrb128(randomString(10));
    }
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


resetRand()

const global = {
    
    // graphics context
    canvas: null,
    ctx: null,

    // 
    backgroundColor: 'black',
    edgeWidth: .002,
    
    // relate screen pixels to virtual 2D units
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasScale: 0,
    centerPos: v(.5,.5),
    screenCorners: null, 
    
    // mouse
    canvasMousePos: v(0,0),     //pixels
    mousePos: v(0,0),           //virtual units
    
    // cube orientation
    angleX: 0,
    angleY: 0,
    angleZ: 0,
    
    // cube spin
    avX: 0,
    avY: 0,
    avZ: 0,
    friction: 1e-3, //fraction of av lost per ms
    autoSpin: true,
    autoSpinCountdown: 0, //ms    
    autoSpinDelay: 3000, //ms
    
    // passive spin force (change in av per ms)
    gX: 1e-7,
    gY: 1e-6,
    gZ: 0,
    
    isDragging:  false,
    prevMouseX: null,
    prevMouseY: null,
    cube: [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ],

    edges: [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7]
    ],
    
    faces: [
        [0, 1, 2, 3,'red',true], // Front face
        [4, 5, 6, 7,'green',false], // Back face
        [0, 1, 5, 4,'blue',false], // Bottom face
        [2, 3, 7, 6,'orange',false], // Top face
        [1, 2, 6, 5,'black',false], // Right face
        [0, 3, 7, 4,'pink',true]  // Left face
    ],
    
    //lighting
    lightDirection: [0, 1, 1], // Light direction 
}


    
    
// Render graphics
function draw(fps, t) {
    
    var ctx = global.ctx
    var canvas = global.canvas
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( 0, 0, canvas.width, canvas.height )


    if( false ){
        //debug
        // draw screen corners
        var r = .1
        ctx.fillStyle = 'red'
        global.screenCorners.forEach(c => ctx.fillRect( c.x-r, c.y-r, 2*r, 2*r ))
    }
    
    const center = global.centerPos
    
    const angleX = global.angleX
    const angleY = global.angleY
    const angleZ = global.angleZ
    
    
    let rotated = global.cube.map(point => rotateX(point, angleX));
    rotated = rotated.map(point => rotateY(point, angleY));
    rotated = rotated.map(point => rotateZ(point, angleZ));
    let projected = rotated.map(project);

    // draw verts
    if( false ){
        projected.forEach((point, i) => {
            ctx.beginPath();
            ctx.arc(point[0], point[1], 5, 0, 2 * Math.PI);
            ctx.fill();
        });
    }


    // draw edges
    ctx.lineWidth = global.edgeWidth
    if( false ){
        global.edges.forEach(edge => {
            let point1 = projected[edge[0]];
            let point2 = projected[edge[1]];
            ctx.beginPath();
            ctx.moveTo(point1[0], point1[1]);
            ctx.lineTo(point2[0], point2[1]);
            ctx.stroke();
        });
    }
    
    // draw faces
    global.faces.forEach(face => {
        let point1 = projected[face[0]];
        let point2 = projected[face[1]];
        let point3 = projected[face[2]];
        let point4 = projected[face[3]];
        
        // skip hidden face
        if( face[5]==arePointsClockwise(point1,point2,point3,point4) ) return
        
        // compute lighting
        const norm = ( face[5] ?
                 normal(rotated[face[0]],rotated[face[1]],rotated[face[2]])
                :normal(rotated[face[0]],rotated[face[2]],rotated[face[1]])
            )
        const lightingIntensity = calculateLightingIntensity(norm);
        
        if( false ) ctx.fillStyle = face[4] // color code face for debugging
        
        // fill solid color
        //const val = 100 + (155 * lightingIntensity)
        ctx.fillStyle = 'white'; //`rgb(${val},${val},${val})`;
        ctx.beginPath();
        ctx.lineTo(point1[0], point1[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.lineTo(point3[0], point3[1]);
        ctx.lineTo(point4[0], point4[1]);
        ctx.closePath();
        ctx.fill();
        
        // draw dot pattern
        fillDots( ctx, [point1,point2,point3,point4], lightingIntensity )
        
        // outline edges
        //const val = 100 + (155 * lightingIntensity)
        ctx.strokeStyle = 'black'; //`rgb(${val},${val},${val})`;
        ctx.beginPath();
        ctx.lineTo(point1[0], point1[1]);
        ctx.lineTo(point2[0], point2[1]);
        ctx.lineTo(point3[0], point3[1]);
        ctx.lineTo(point4[0], point4[1]);
        ctx.closePath();
        ctx.stroke();
    })

    // debug cube orientation
    if( false ){
        ctx.fillStyle = 'black'
        ctx.font = ".001em Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${global.angleX.toFixed(2)},${global.angleY.toFixed(2)},${global.angleZ.toFixed(2)}`, .5,.5);
    }
            
    //ctx.clearRect( 0, 0, canvas.width, canvas.height )

    //debug
    //drawFilledChunks(ctx)

    //y += 30
    //ctx.fillText(`camera: ${cameraX.toFixed(2)}, ${cameraY.toFixed(2)}, ${zoomLevel.toFixed(2)}`, x, y);
    //y += 30
    //ctx.fillText(gameState, x, y);
    //y += 30 
    //ctx.fillText(`canvas pos: ${canvasMouseX}, ${canvasMouseY}`, x, y);
    //y += 30
    //ctx.fillText(`virtual pos: ${virtualMouseX}, ${virtualMouseY}`, x, y);
}

function dotSize( lightIntensity ){
    return .001//.003 - .002*lightIntensity
}

function dotSpacing( lightIntensity ){
    return .0002 + .007*lightIntensity
}

function fillDots( g, faceVerts, lightIntensity ){
    var xr = [Infinity,-Infinity]
    var yr = [Infinity,-Infinity]
    var tx = 0
    var ty = 0
    faceVerts.forEach(xy => {
        if( xy[0] < xr[0] ) xr[0] = xy[0]       
        if( xy[0] > xr[1] ) xr[1] = xy[0]  
        if( xy[1] < yr[0] ) yr[0] = xy[1]       
        if( xy[1] > yr[1] ) yr[1] = xy[1]    
        tx += xy[0]
        ty += xy[1]
    })
    
    var step = dotSpacing( lightIntensity )
    var rad = dotSize( lightIntensity )
    var rad2 = 2*rad
    
    var cx = (tx/faceVerts.length)
    var cy = (tx/faceVerts.length)
    var startX = cx 
    while( startX > xr[0] ) startX -= step
    var startY = cy
    while( startY > yr[0] ) startY -= step
    var endX = cx 
    while( endX < xr[1] ) endX += step
    var endY = cy
    while( endY < yr[1] ) endY += step
    
    // define clipping region for dots
    g.beginPath();
    faceVerts.forEach(xy => g.lineTo(...xy))
    g.save()
    g.clip();
    
    // draw dots
    g.fillStyle = 'black'
    g.beginPath()
    var i = 0
    for( var y = startY ; y < endY ; y += step ){
        i += 1
        for( var x = startX ; x < endX ; x += step ){
            var xx = x //+ (i%2?step/2:0)
            //g.moveTo(xx,y)
            //g.arc( xx, y, rad, 0, twopi )
            g.fillRect( xx-rad, y-rad, rad2, rad2 )
        }
    }
    //g.fill()
    
    // reset clipping
    g.restore()
    
}



function mouseDown(e){
      global.isDragging = true;
      global.prevMouseX = event.clientX;
      global.prevMouseY = event.clientY;
}

function mouseMove(e){
    
  if (!global.isDragging) return;
  
  global.autoSpin = false
  global.autoSpinCountdown = global.autoSpinDelay
      
    let dx = event.movementX;
    let dy = event.movementY;

    let scale = 1e-5
    global.avY -= dx * scale;
    global.avX += dy * scale;
}

function mouseUp(e){
    global.isDragging = false
      global.prevMouseX = null;
      global.prevMouseY = null;
}



function update(dt) {    

    // cube physics
    if( global.autoSpin ){
        global.avX += global.gX*dt
        global.avY += global.gY*dt
        global.avZ += global.gZ*dt
    } else if (!global.isDragging) {
        global.autoSpinCountdown -= dt 
        if( global.autoSpinCountdown < 0 ){
            global.autoSpin = true
        }
    }
    var fm = 1.0 - (global.friction * dt)
    global.avX *= fm
    global.avY *= fm
    global.avZ *= fm
    
    global.angleX += global.avX*dt
    global.angleY += global.avY*dt
    global.angleZ += global.avZ*dt
    

    // check for resized window
    fitToContainer()    
}


var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(){
    
    var cvs = global.canvas
    if( (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
      cvs.width  = cvs.offsetWidth;
      cvs.height = cvs.offsetHeight;
        var padding = 0; // (extra zoom IN) thickness of pixels CUT OFF around edges
        if( (cvs.width < cvs.height) ){
            padding = cvs.width*3
        }
        if( cvs.height<500 ){
            padding = cvs.height
        }
        var dimension = Math.max(cvs.width, cvs.height) + padding*2;
        global.canvasScale = dimension;
        global.canvasOffsetX = (cvs.width - dimension) / 2;
        global.canvasOffsetY = (cvs.height - dimension) / 2;
    global.ctx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);
        
        var xr = -global.canvasOffsetX / global.canvasScale
        var yr = -global.canvasOffsetY / global.canvasScale
        global.screenCorners = [v(xr,yr),v(1-xr,yr),v(1-xr,1-yr),v(xr,1-yr)]
    }
}



// Initialize the game
function init() {
    var cvs = document.getElementById("gameCanvas");
      cvs.style.width='100%';
      cvs.style.height='100%';  
    cvs.addEventListener("mousedown", mouseDown);
    cvs.addEventListener("mousemove", mouseMove);
    cvs.addEventListener("mouseup", mouseUp);
    cvs.addEventListener("touchstart", mouseDown, false);
    cvs.addEventListener("touchend", mouseUp, false);
    
    // https://stackoverflow.com/a/63469884
    var previousTouch;
    cvs.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        if (previousTouch) {
            e.movementX = touch.pageX - previousTouch.pageX;
            e.movementY = touch.pageY - previousTouch.pageY;
            mouseMove(e);
        };

        previousTouch = touch;
        e.preventDefault()
    });
    cvs.addEventListener("touchend", (e) => {
        previousTouch = null
        mouseUp(e)
    });
    
    
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    resetRand()
    requestAnimationFrame(gameLoop);
}


// Main game loop
let secondsPassed;
let oldTimeStamp;
let fps;

function gameLoop(timeStamp) {
    
    var msPassed = 0;
    if (oldTimeStamp) {
      msPassed = timeStamp - oldTimeStamp;
    }
    var secondsPassed = msPassed / 1000;
    oldTimeStamp = timeStamp;
    var fps = Math.round(1 / secondsPassed);


    msPassed = Math.min(msPassed,50)

    update(msPassed);
    draw(fps);

    requestAnimationFrame(gameLoop);
}


// Initialize the game
init();


