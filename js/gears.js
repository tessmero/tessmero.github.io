

class Gear {
    constructor(pos,cw){
        var n = randInt(3,15)
        this.pos = pos
        this.vel = v(0,0)
        
        var tw = global.toothWidth
        var r = tw * n
        var dr = tw
        this.r1 = r-dr
        this.r2 = r+dr
        
        this.n = n // number of teeth
        this.cw = cw // boolean clockwise
        
        this.tips = null //
        this.ao = 0
        this.links = [] // Link instances
    }
   
    update(dt){
        //push on-screen
        var sc = global.screenCorners
        if( this.pos.x < sc[0].x ) this.pos.x = sc[0].x
        if( this.pos.x > sc[2].x ) this.pos.x = sc[2].x
        if( this.pos.y < sc[0].y ) this.pos.y = sc[0].y
        if( this.pos.y > sc[2].y ) this.pos.y = sc[2].y
        
        this.vel = this.vel.mul( 1.0 - global.friction )        
        this.pos = this.pos.add(this.vel.mul(dt))
    }
   
    draw(g,fill){
        var c = this.pos
        
        // angle offset due to spinning animation
        var oa = this.ao + twopi * (global.animState * global.animScale) / this.n
        if( this.cw ) oa *= -1
        
        // angle difference between adjacent teeth
        var da = twopi/this.n
        
        // how much to taper each tooth (radians)
        var off = global.toothTaper
        
        // prepare to save tooth locations for purposes 
        // of collisions with neighboring gears
        if( fill ) this.tips = []
        
        // start drawing
        g.beginPath()
        for( var i = 0 ; i < this.n ; i++ ){
            var a = oa + i*twopi/this.n
            a = [a,a+da/2,a+da/2+off,a+da-off]
            g.arc( c.x, c.y, this.r1, a[0], a[1] )
            g.arc( c.x, c.y, this.r2, a[2], a[3] )
            this.tips.push([ c.add(vp(a[2],this.r2)), c.add(vp(a[3],this.r2)) ])
        }
        g.closePath()
        if( fill ) {
            g.fill()
        } else {
            g.stroke()
        }
     
    }
}

// link between two neighboring gears

class Link {
    
    constructor(a,b,repel=false){
        this.a = a
        this.b = b
        a.links.push(this)
        b.links.push(this)
        this.repel = repel
        
        var repelMargin = .05
        
        this.targetM2 = Math.pow( this.repel ? 
            (a.r2+b.r2+repelMargin) : 
            (a.r1 + b.r2), 2 )
        
        
    }

   
    update(dt){
        var a = this.a
        var b = this.b
        
        // maintain distance
        var d = a.pos.sub(b.pos)
        var m2 = d.m2()
        var dm2 = m2-this.targetM2
        this.isInterlocked = (Math.abs(dm2) < .1)
        if( this.repel && ((dm2>0) || a.repulsionDisabled || b.repulsionDisabled) ) return
        if( this.repel ) dm2 *= 2
        var accel = vp( d.getAngle(), dm2*global.allignForce*dt )
        a.vel = a.vel.sub(accel)
        b.vel = b.vel.add(accel)
        
        
        if( this.repel ) return
        
        //
        var da = global.spinAllignForce*dt
        if( a.cw ) da *= -1
        
        // check tip intersections and potentially apply a nudge
        if( (!a.tips) || (!b.tips) ) return
        for( var ai = 0 ; ai < a.n ; ai++ ){
            for( var bi = 0 ; bi < b.n ; bi++ ){
                var si = segmentsIntersection( a.pos, a.tips[ai][0], b.tips[bi][0], b.tips[bi][1] )
                if( si ) {
                    if( global.debugPoints )global.debugPoints.push([si,'red'])
                    a.ao += da
                    b.ao -= da
                    return
                }
                si = segmentsIntersection( a.pos, a.tips[ai][1], b.tips[bi][0], b.tips[bi][1] )
                if( si ) {
                    if( global.debugPoints )global.debugPoints.push([si,'blue'])
                    a.ao -= da
                    b.ao += da
                    return
                }
                si = segmentsIntersection( b.pos, b.tips[bi][0], a.tips[ai][0], a.tips[ai][1] )
                if( si ) {
                    if( global.debugPoints )global.debugPoints.push([si,'green'])
                    a.ao += da
                    b.ao -= da
                    return
                }
                si = segmentsIntersection( b.pos, b.tips[bi][1], a.tips[ai][0], a.tips[ai][1] )
                if( si ) {
                    if( global.debugPoints )global.debugPoints.push([si,'yellow'])
                    a.ao -= da
                    b.ao += da
                    return
                }
            }
        }
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

function constructCircle(x1, y1, x2, y2, x3, y3) {
const h = (
        (x1 * x1 + y1 * y1) * (y2 - y3) +
        (x2 * x2 + y2 * y2) * (y3 - y1) +
        (x3 * x3 + y3 * y3) * (y1 - y2)
    ) / (
        2 * (x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2)
    );

    const k = (
        (x1 * x1 + y1 * y1) * (x3 - x2) +
        (x2 * x2 + y2 * y2) * (x1 - x3) +
        (x3 * x3 + y3 * y3) * (x2 - x1)
    ) / (
        2 * (x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2)
    );

    const r = Math.sqrt((x1 - h) ** 2 + (y1 - k) ** 2);

    return [h,k,r]
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
    backgroundColor: 'black',
      
    // state
    t: 0, // total time elapsed
    allGears: [], // Gear instances
    allLinks: [], // Link instances
    animPeriod: 100000,
    animState: 0, // [0-1] oscilates over animPeriod
    animScale: 50, // interger temporal scale, number of teeth
    
    //
    toothTaper: .06, // how much to taper each tooth (radians)
    toothWidth: .015, 
    
    //
    friction: 1e-2, // fraction of speed lost per ms
    allignForce: 2e-6, // scale of accel to position gears
    spinAllignForce: 3e-4, // scale of nudge to align neighboring teeth
    
    // periodically cycle out gears
    autoMoveCountdown: 0,
    autoMoveDelay: 17548,
    
    //debug
    debugPoints: false,
    debugMouse: false,
}


    
    
// Render graphics
function draw(fps, t) {
    var g = global.ctx
    var canvas = global.canvas
    g.fillStyle = global.backgroundColor
    g.fillRect( -10,-10,30,30 )

    // draw gears
    g.strokeStyle = 'white'
    g.fillStyle = 'gray'
    g.lineWidth = .005
    global.allGears.forEach( b => b.draw(g,true) )
    global.allGears.forEach( b => b.draw(g) )
    
    
    // debug draw corners
    if( false ){
        global.screenCorners.forEach( c => {
            g.fillStyle = 'red'
            g.beginPath()
            g.moveTo(c.x,c.y)
            g.arc(c.x,c.y,.1,0,twopi)
            g.fill()
        })
    }

    // debug draw mouse
    if( global.debugMouse ){
        let c = global.mousePos
        g.fillStyle = 'red'
        g.beginPath()
        g.moveTo(c.x,c.y)
        g.arc(c.x,c.y,.01,0,twopi)
        g.fill()
    }

    //debug
    if( global.debugPoints ){
        global.debugPoints.forEach(c => {
            g.fillStyle = c[1]
            c = c[0]
            g.beginPath()
            g.moveTo(c.x,c.y)
            g.arc(c.x,c.y,.01,0,twopi)
            g.fill()
        })
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
        (global.canvasMousePos.x-global.canvasOffsetX)/global.canvasScale, 
        (global.canvasMousePos.y-global.canvasOffsetY)/global.canvasScale
    )
}

function mouseMove(e){
    updateMousePos(e)
    
}

function mouseClick(e){
    updateMousePos(e)
    spawnGear(global.mousePos)
    //global.debugPoint = global.mousePos
}



function update(dt) { 
    global.t += dt

    fitToContainer()  
    
    // update base gear physics
    if( global.debugPoitns ) global.debugPoints = [] 
    global.allGears.forEach( gear => gear.update(dt) )
        
    // align/repel gears based on planned chain
    global.allGears.forEach( g => g.repulsionDisabled = g.links.some(l => 
        (!l.repel) && (!l.isInterlocked)
    ))
    global.allLinks.forEach( lk => lk.update(dt) )
            
    // cycle out one gear if necessary
    if( global.autoMoveCountdown > 0 ){
        global.autoMoveCountdown -= dt
        
    } else {
        spawnGear()
    }
        
    // main animation
    let p = global.animPeriod
    let pindex = Math.floor(global.t / p)
    let r = (global.t % p) / p
    global.animState = Math.cos(r*twopi-pi)/2+.5
}


function spawnGear( pos=null ){
    if( pos == null ) pos = v(randRange(.3,.7),randRange(.3,.7))
    
    global.autoMoveCountdown = global.autoMoveDelay
    global.allGears.shift()
    global.allGears.push(new Gear(
        pos,
        !global.allGears[global.allGears.length-1].cw
    ))
    rebuildGearLinks()
}


var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(){
    
    var cvs = global.canvas
    if( (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
      cvs.width  = cvs.offsetWidth;
      cvs.height = cvs.offsetHeight;
        
        var dimension = Math.min(cvs.width, cvs.height);
        global.canvasScale = dimension;
        global.canvasOffsetX = (cvs.width - dimension) / 2;
        global.canvasOffsetY = (cvs.height - dimension) / 2;
    global.ctx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);
        
        var xr = -global.canvasOffsetX / dimension
        var yr = -global.canvasOffsetY / dimension
        global.screenCorners = [v(xr,yr),v(1-xr,yr),v(1-xr,1-yr),v(xr,1-yr)]
        global.screenCenter = v(.5,.5)
    }
}



// Initialize the game
function init() {
    var cvs = document.getElementById("gameCanvas");
    cvs.addEventListener("mousedown", mouseClick);
    
    
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    
    resetRand() // math/rng.js
    fitToContainer()
    resetGame()
    requestAnimationFrame(gameLoop);
}


function resetGame(){
    resetRand()
    global.autoResetCountdown = global.autoResetDelay
    
    // build gears
    var gs = []
    var n = 7
    for( var i = 0 ; i < n ; i++ ){
        gs.push(new Gear(
            v(randRange(.3,.7),randRange(.3,.7)),
            i%2
        ))
    }
    global.allGears = gs
    
    rebuildGearLinks()
    
}

function rebuildGearLinks(){
    
    var gs = global.allGears
    var odd = []
    var even = []
    gs.forEach( g => (g.cw?even:odd).push(g) )
    shuffle(even)
    shuffle(odd)
    gs = []
    while( (odd.length>0) && (even.length>0) ){
        var t = odd.pop()
        if( t ) gs.push(t)
        t = even.pop()
        if( t ) gs.push(t)
    }
    global.allGears = gs
    var n = gs.length
    gs.forEach(gear => gear.links = [])
    
    // build links between gears
    // neighboring gears align, otherwise repel
    var gl = []
    for( var i = 0 ; i < n ; i++ )
        for( var j = i+1 ; j < n ; j++ )
            gl.push( new Link( gs[i], gs[j], j != (i+1) ) ) 
    global.allLinks = gl
}


// check if line segment intersects any existing neighbor-links
function isSegmentClear(a,b){
    for( var i = 0 ; i < global.allLinks.length ; i++ ){
        var l = global.allLinks[i]
        if( l.repel ) continue
        if( segmentsIntersection( l.a.pos, l.b.pos, a, b) ) return false
    }
    return true
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


