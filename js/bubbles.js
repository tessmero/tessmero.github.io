
// maintain array of MxN radii (global.bulbbleRads)
//  so tupposrt maximum of M bubbles
//  each bubble having N radii


// called in setup.js init()
function initBubbleRads(){
    
    var m = global.maxBubbles
    var n = global.nRadii
    
    global.bubbleRads = new Array(m*n).fill(null)
    global.bubbleRadLims = new Array(m*n).fill(null)
    global.bubbleRadVels = new Array(m*n).fill(0)
    global.bubbleRadSin = new Array(n).fill(null)
    global.bubbleRadCos = new Array(n).fill(null)
    
    // precompute trig functions
    for( var i = 0 ; i < n ; i++ ){
        var a = twopi*i/n
        global.bubbleRadSin[i] = Math.sin(a)
        global.bubbleRadCos[i] = Math.cos(a)
    }
    
}

function updateBubbleRadPhysics(dt){
    var m = global.maxBubbles
    var n = global.nRadii
    var mn = m*n
    for( var i = 0 ; i < mn ; i++ ){
        if( ! global.bubbleRads[i] ) continue
        global.bubbleRadVels[i] *= (1.0-dt*global.brFriction)
        global.bubbleRads[i] += global.bubbleRadVels[i]*dt
    }
}

function deleteBubble(rmi){
    var n = global.nRadii
    for( var j = 0 ; j < n ; j++ ){
        global.bubbleRads[rmi+j] = null
        global.bubbleRadLims[rmi+j] = null
    }
}

// called in setup.js resetGame()
function clearBubbles(){
    global.bubbleRads.fill(null)
}

// called in bubble.js
function getMaxRad(rmi){
    var result = 0
    for( var j = 0 ; j < global.nRadii ; j++ ){
        var r = global.bubbleRads[rmi+j]
        if( r > result ){
            result = r
        }
    }
    return result
}

// called in bubble.js constructor
function getNewBubbleIndex(rad){
    var br = global.bubbleRads
    var m = global.maxBubbles
    var n = global.nRadii
    var mn = m*n
    
    // find unoccupied index
    for( var i = 0 ; i < mn ; i+=n ){
        if( br[i] == null ){
            
            // set starting radius
            for( var j = 0 ; j < n ; j++ ){
                br[i+j] = rad
                global.bubbleRadLims[i+j] = rad
            }
            return i
        }
    }
}


class Bubble {
    constructor(pos, vel, g){
        this.pos = pos
        this.vel = vel
        this.g = g
        this.targetRad = randRange(...global.bubbleRad)
        this.rmi = getNewBubbleIndex(this.targetRad)
    }
    
    isOob(){
        var x = this.pos.x
        var y = this.pos.y
        var m = global.bubbleRad[1]*2
        return (x < -m) || (y < -m) || (x > 1+m) || (y > 1+m)
    }
    
    update(dt){
        
        var br = global.bubbleRads
        var brv = global.bubbleRadVels
        var n = global.nRadii
        var rmi = this.rmi
        
        // prepare for fast collision checks
        this.maxRad = getMaxRad(this.rmi) + global.bubblePadding
        this.mr2 = this.maxRad * this.maxRad
        
        this.pos = this.pos.add(this.vel.mul(dt))
        if( this.g ) this.vel = this.vel.add(this.g.mul(dt))
        this.vel = this.vel.mul( 1 - (global.bubbleFric * dt) )
        
        // propogate edge waves
        for( var i = 0 ; i < n ; i++ ){
            brv[rmi+i] -= (br[rmi+i] - avg(br[rmi+nnmod(i-1,n)],br[rmi+nnmod(i+1,n)] ) ) * dt * global.brNeightborFmag
        }
        
        
        // apply edge vels
        for( var i = 0 ; i < n ; i++ ){
            var r = br[this.rmi+i]
            var tr = global.bubbleRadLims[this.rmi+i]
            if( r > tr ){
                brv[this.rmi+i] -= (global.brFmag*dt)
            } else if( r < tr ) {
                brv[this.rmi+i] += (global.brFmag*dt)
            }
        }
        
        // prepare for limitRads to be called for each neighboring bubble
        for( var i = 0 ; i < global.nRadii ; i++ ){
            global.bubbleRadLims[this.rmi+i] = this.targetRad
        }
    }

    // limit rads to prevent crossing line a-b
    limitRads(a,b,dt){
        for( var i = 0 ; i < global.nRadii ; i++ ){
            var r = global.bubbleRads[this.rmi+i] + global.bubblePadding
            var x = this.pos.x + r * global.bubbleRadCos[i] 
            var y = this.pos.y + r * global.bubbleRadSin[i]
            var intr = segmentsIntersection( this.pos, v(x,y), a, b )
            if( intr ){
                var ir = intr.sub(this.pos)
                var irm = ir.getMagnitude()
                global.bubbleRadLims[this.rmi+i] = irm - global.bubblePadding
                global.bubbleRadVels[this.rmi+i] -= (global.brFmag*dt)
                
                var mul = (this.targetRad-irm)/this.targetRad
                if( mul > 0 ){
                    // push intersecting bubble
                    this.vel = this.vel.sub( vp( ir.getAngle(), Math.min( global.bubbleFlim, mul*global.bubbleFmag*dt ) ) )
                } else {
                    // pull / stick nearby bubble
                }
            }
        }
    }
    
    draw(g,dilate=0){
        
        for( var i = 0 ; i < global.nRadii ; i++ ){
            var r = global.bubbleRads[this.rmi+i] + dilate
            var x = this.pos.x + r * global.bubbleRadCos[i] 
            var y = this.pos.y + r * global.bubbleRadSin[i]
            if( i == 0 ){
                g.moveTo(x,y)
            } else {
                g.lineTo(x,y)
            }
        }
        
    }
    
    drawDebug(g){
        g.strokeStyle = 'green'
        g.lineWidth = .001
        for( var i = 0 ; i < global.nRadii ; i++ ){
            var r = global.bubbleRads[this.rmi+i]
            var x = this.pos.x + r * global.bubbleRadCos[i] 
            var y = this.pos.y + r * global.bubbleRadSin[i]
            g.moveTo(this.pos.x, this.pos.y)
            g.lineTo(x,y)
        }
        g.stroke()
    }
}

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
    
    getMagnitude(){
        return Math.sqrt( this.x*this.x + this.y*this.y )
    }
    
    m2(){
        return this.x*this.x + this.y*this.y;
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


function getCircleIntersections(x1, y1, r1, x2, y2, r2) {
    const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

    const a = (Math.pow(r1, 2) - Math.pow(r2, 2) + Math.pow(d, 2)) / (2 * d);
    const h = Math.sqrt(Math.pow(r1, 2) - Math.pow(a, 2));

    const x3 = x1 + a * (x2 - x1) / d;
    const y3 = y1 + a * (y2 - y1) / d;

    const offsetX = h * (y2 - y1) / d;
    const offsetY = h * (x2 - x1) / d;

    const intersection1 = v( x3 + offsetX,  y3 - offsetY );
    const intersection2 = v( x3 - offsetX, y3 + offsetY );

    return [intersection1, intersection2];
}

function segmentsIntersection(a1,a2,b1,b2) {
    var x1 = a1.x
    var y1 = a1.y
    var x2 = a2.x
    var y2 = a2.y
    var x3 = b1.x
    var y3 = b1.y
    var x4 = b2.x
    var y4 = b2.y
    
    // Calculate the cross products
    const crossProduct1 = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
    const crossProduct2 = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
    const crossProduct3 = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);

    // Check if the line segments are not parallel
    if (crossProduct3 !== 0) {
        const t1 = crossProduct1 / crossProduct3;
        const t2 = crossProduct2 / crossProduct3;

        // Check if the intersection point is within the line segments
        if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
            const intersectionX = x1 + t1 * (x2 - x1);
            const intersectionY = y1 + t1 * (y2 - y1);

            return v( intersectionX, intersectionY );
        }
    }

    // Return null if there is no intersection
    return null;
}

function randRange(min,max){
    return min + rand()*(max-min)
}

function randInt(min,max){
    return Math.floor(randRange(min,max))
}

function randSign(){
    return rand() > .5 ? -1 : 1
}

function dist(a,b){
    var dx = a[0]-b[0]
    var dy = a[1]-b[1]
    return Math.sqrt( dx*dx + dy*dy )
}

function va(a,b,r=.5){
    return v(
        a.x*(1-r)+b.x*r, 
        a.y*(1-r)+b.y*r
    )
}

function avg(a,b,r=.5){
    return a*(1-r) + b*r
}

function avg2(a,b,r=.5){
    return [
        a[0]*(1-r) + b[0]*r,
        a[1]*(1-r) + b[1]*r,
    ]
}

//non negative modulo
function nnmod(a,b){
    var r = a%b
    if( r<0 ) return r+b
    return r
}

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(rand() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
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


const global = {
    // graphics context
    canvas: null,
    ctx: null,
    
    // relate pixels to virtual units
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasScale: 0,

    // mouse
    canvasMousePos: v(0,0),     //pixels
    mousePos: v(0,0),           //internal units

    // 
    backgroundColor: 'gray',
    bubbleColor: 'white',
    edgeColor: 'black',
    
    // physics settings
    maxBubbles: 30,
    nRadii: 30,
    bubblePadding: .01,
    
    // high-level OOP state
    allBubbles: [],
    
    // detailed state optimized vars
    // see math/rad_manager.js
    bubbleRad: [.04,.08],
    bubbleRads: null, // MxN bubbles' edge shapes
    bubbleRadVels: null, // MxN bubbles' edge momentums
    bubbleRadCos: null, // N pre-computed cosines
    bubbleRadSin: null, // N pre-computed sines
    brFriction: 1e-2, // bubble edge detail
    brNeightborFmag: 1e-3, // bubble edge detail
    brFmag: 1e-6, //
    bubbleFmag: 1e-5, // force between bubbles
    bubbleFlim: 1e-5,
    bubbleGmag: 1e-6, // bubble bouyancy
    bubbleFric: 1e-2, // bubble overal motion
    
    //
    bubbleSpawnCountdown: 0,
    bubbleSpawnDelay: 500,

    
    //debug
    debugLines: [],
    debugBubbles: false,
    showDebugLines: false,
}


    
    
// Render graphics
function draw(fps, t) {
    var g = global.ctx
    var canvas = global.canvas
    g.fillStyle = global.backgroundColor
    g.fillRect( 0, 0, 1, 1 )

    // draw bubbles
    g.fillStyle = global.edgeColor
    g.beginPath()
    global.allBubbles.forEach( b => b.draw(g,.005) )
    g.fill()
    
    g.fillStyle = global.bubbleColor
    g.beginPath()
    global.allBubbles.forEach( b => b.draw(g,0) )
    g.fill()
    
    // draw bubble debug
    if( global.debugBubbles ){
        global.allBubbles.forEach( b => b.drawDebug(g) )
    }
    
    // debug draw corners
    if( false ){
        global.screenCorners.forEach( c => {
            g.fillStyle = 'red'
            g.beginPath()
            g.moveTo(c.x,c.y)
            g.arc(c.x,c.y,global.bubbleRad[1],0,twopi)
            g.fill()
        })
    }

    //debug
    if( global.showDebugLines && global.debugLines ){
        g.lineWidth = .001
        g.strokeStyle = 'red'
        g.beginPath()
        global.debugLines.forEach(l => {
            g.moveTo(l[0].x,l[0].y)
            g.lineTo(l[1].x,l[1].y)
        })
        g.stroke()
    }
}

function updateMousePos(event){
    
    
    var rect = global.canvas.getBoundingClientRect();
    var scaleX = global.canvas.width / rect.width;
    var scaleY = global.canvas.height / rect.height;
    
    global.canvasMousePos = new Vector( 
        (event.clientX - rect.left) * scaleX, 
        (event.clientY - rect.top) * scaleY 
    
    )
    global.mousePos = new Vector( 
        virtualMouseX = (global.canvasMousePos.x-global.canvasOffsetX)/global.canvasScale / global.minDist, 
        virtualMouseY = (global.canvasMousePos.y-global.canvasOffsetY)/global.canvasScale / global.minDist
    )
}

function mouseMove(e){
    updateMousePos(e)
}

function mouseClick(e){
    updateMousePos(e)
    
    //global.debugPoint = global.mousePos
    resetGame()
}



function spawnBubble(){
    if( global.allBubbles.length >= global.maxBubbles ){
        return
    }
    
    var side = randInt(0,4)   
    var a = global.screenCorners[side]
    var b = global.screenCorners[(side+1)%4]
    var pos = va(a,b,randRange(.4,.6))
    pos = pos.add( pos.sub(global.screenCenter).mul(.2) )
    var vel = v(0,0)
    var m = global.bubbleGmag
    var g
    if(side==0) g = v(0,m) 
    if(side==1) g = v(-m,0) 
    if(side==2) g = v(0,-m) 
    if(side==3) g = v(m,0) 
    var b = new Bubble(pos,vel,g)
    
    global.allBubbles.push(b)
}

function update(dt) { 
    fitToContainer()  
    
    global.bubbleSpawnCountdown -= dt
    if( global.bubbleSpawnCountdown < 0 ){
        spawnBubble()
        global.bubbleSpawnCountdown = global.bubbleSpawnDelay
    }
        
    //debug
    global.debugLines = []
    
    
    global.allBubbles = global.allBubbles.filter(b => {
        b.update(dt)
        if( b.isOob() ){
            deleteBubble(b.rmi)
            return false
        }
        return true
    })
    
    // identify all intersecting pairs
    var allb = global.allBubbles
    var n = allb.length
    for( var i = 0 ; i < n ; i++ ) {
        var a = allb[i]
        for( var j = i+1 ; j < n ; j ++ ){
            var b = allb[j]
            var d2 = a.pos.sub(b.pos).m2()
            if( d2 < 2*(a.mr2+b.mr2) ){
                
                //found intersecting pair
                var ints = getCircleIntersections(a.pos.x,a.pos.y,a.maxRad, b.pos.x,b.pos.y,b.maxRad )
                global.debugLines.push( [a.pos,b.pos] )
                global.debugLines.push( ints )
                a.limitRads( ...ints, dt)
                b.limitRads( ...ints, dt )
                
            }
        }
    }
    
    updateBubbleRadPhysics(dt)
    
    
    
    //debug
    //console.log(nTicks)
    
    if( false ){
        global.autoResetCountdown -= dt
        if( global.autoResetCountdown < 0 ){
            resetGame()
        }
    }
}



var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(){
    
    var cvs = global.canvas
    if( (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
      cvs.width  = cvs.offsetWidth;
      cvs.height = cvs.offsetHeight;
        
        var padding = 0; // (extra zoom IN) thickness of pixels CUT OFF around edges
        var dimension = Math.max(cvs.width, cvs.height) + padding*2;
        global.canvasScale = dimension;
        global.canvasOffsetX = (cvs.width - dimension) / 2;
        global.canvasOffsetY = (cvs.height - dimension) / 2;
    global.ctx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);
        
        var xr = -global.canvasOffsetX / global.canvasScale
        var yr = -global.canvasOffsetY / global.canvasScale
        global.screenCorners = [v(xr,yr),v(1-xr,yr),v(1-xr,1-yr),v(xr,1-yr)]
        global.screenCenter = v(.5,.5)
    }
}



// Initialize the game
function init() {
    var cvs = document.getElementById("gameCanvas");
    //cvs.addEventListener("mousemove", mouseMove);
    //cvs.addEventListener("click", mouseClick);
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    
    resetRand() // math/rng.js
    initBubbleRads() // math/rad_manager.js
    resetGame()
    requestAnimationFrame(gameLoop);
}


function resetGame(){
    resetRand()
    global.autoResetCountdown = global.autoResetDelay
    
    global.allBubbles = []
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


