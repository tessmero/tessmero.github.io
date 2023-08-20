
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
function bezier(points,r){
    if( points.length == 1 ) return points[0];
    var ps = []
    for( var i = 1 ; i < points.length ; i++ ){
        ps.push( va(points[i-1],points[i],r) )
    }
    return bezier(ps,r)
}


function addIntersectionPoints(c1, c2, list) {
    let dx = c2.pos.x - c1.pos.x;
    let dy = c2.pos.y - c1.pos.y;
    const d = Math.sqrt(dx * dx + dy * dy);

    // Circles too far apart
    if (d > c1.r + c2.r) { return; }
        
    // One circle completely inside the other
    if (d <= Math.abs(c1.r - c2.r)) { return; }

    dx /= d;
    dy /= d;

    const a = (c1.r * c1.r - c2.r * c2.r + d * d) / (2 * d);
    const px = c1.pos.x + a * dx;
    const py = c1.pos.y + a * dy;

    const h = Math.sqrt(c1.r * c1.r - a * a);

    list.push({
            x: px + h * dy,
            y: py - h * dx
        })
    list.push({
            x: px - h * dy,
            y: py + h * dx
        })
    
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


class Cloud{
    constructor( pos ){
        
        // overall position
        this.pos = pos
        this.vel = v(randRange(...global.cloudSpeed),0)
        
        // bounding ellipse for children
        this.xr = global.cloudBoundsXr
        this.yr = global.cloudBoundsYr
        
        // children
        this.nVertsPerChild = (rand()>.1) ? 50 : Math.floor(randRange(3,6))
        this.circles = this.buildChildren()
        
        // overall shape
        this.nVertsForRoughShape = this.nVertsPerChild+6
    }
    
    buildChildren(){
        var result = []
        for( var i = 0 ; i < global.nCirclesPerCloud ; i++ ){
            var r = 1
            var a = randRange(0,twopi)
            var rr = randRange(.01,.02)
            var pos = v( r*this.xr*Math.cos(a), r*this.yr*Math.sin(a) )
            var av = 0
            if( this.nVertsPerChild < 10 ){
                av = randRange(...global.childSpinSpeed) * (rand()>.5?-1:1)
            }
            result.push({
                pos: pos,
                vel: v(0,0),
                r:rr,
                r2:rr*rr,
                a:0,
                av:av,
            })
        }
        
        return result
    }
    
    update(dt){
        this.t += dt
        
        // update pos
        this.angleOffset += this.avel*dt
        var vt = this.vel.mul(dt)
        if( global.pointiness > 0 ){
            vt = vt.mul(1-(global.pointiness/global.maxPointiness))
        }
        this.pos = this.pos.add(vt)
        
        // apply friction
        var fm = 1-(4e-3*dt)
        //this.vel  = this.vel.mul(fm) 
        
        // update circles
        this.circles.forEach(c => {
          
        
            c.pos = c.pos.add(c.vel.mul(dt))
            //c.a = c.pa
            c.vel  = c.vel.mul(fm) 
            
            var av = c.av
            if( (av!=0) && (global.pointiness != 0) ){
                if( isNaN(c.a) ){
                    c.a = 0
                }
                var d = c.pa-c.a
                var am = .1
                if( Math.abs(d) < am ){
                    av = 0
                } else {
                    av = (d/am) * global.childSpinSpeed[1]
                    av /= 5*Math.max(1,global.pointiness)
                    c.vel = c.vel.mul(1/10*Math.max(1,global.pointiness))
                }
            }
            c.a += av*dt
            var dp = c.pos//.sub(this.pos)
            c.pa = Math.atan2( dp.y/this.yr, dp.x/this.xr )
            
        
            // tend towards region just inside bounding ellipse
            var d = c.pos//.sub(this.pos)
            var r = Math.sqrt( Math.pow( d.x/this.xr, 2 ) + Math.pow( d.y/this.yr, 2 ) )            
            if( r > 1  ){
                var g = 1e-6
                var f = vp( d.getAngle(), g*dt  )
                c.vel = c.vel.sub( f )
            }  
            if( r < .8  ){
                var g = -1e-6
                var f = vp( d.getAngle(), g*dt  )
                c.vel = c.vel.sub( f )
            }
        
            // get pushed by other circles
            //for( var i = 0 ; i < global.nCollisionChecks ; i++ ){
                
                // cycle over balloons
            //    this.collisionCheckOffsetIndex = (this.collisionCheckOffsetIndex+1)%this.circles.length
            //    var o = this.circles[this.collisionCheckOffsetIndex]
        
            // get pushed by other circles
            this.circles.forEach(o => {
                var d = o.pos.sub(c.pos)
                var d2 = d.getD2()
                var md2 = c.r2+o.r2
                if(d2 == 0) return // skip self
                if(d2 > md2) return // skip distant circle
                
                // accel self away from nearby circle
                var angle = d.getAngle()
                var f = 1e-10*dt/d2
                c.vel = c.vel.sub(vp(angle,f))
            })
            
            // limit vel
            var d2 = c.vel.getD2()
            if( d2 < global.circleMinSpeed2 ){
                c.vel = vp( c.vel.getAngle(), Math.sqrt(global.circleMinSpeed2))
            }else if( d2 > global.circleMaxSpeed2 ){
                c.vel = vp( c.vel.getAngle(), Math.sqrt(global.circleMaxSpeed2))
            }
        })
    }

    draw(g,firstPass){
        
        
        // draw cloud
        g.strokeStyle = 'black'
        g.lineWidth = .001
        
        // debug
        // draw boudnign ellipse
        if( false ){
            g.strokeStyle = 'red'
            g.lineWidth = .001
            g.beginPath()
            g.ellipse(this.pos.x,this.pos.y,this.xr,this.yr,0,0,twopi)
            g.stroke()
        }
        
        // draw cloud
        if( true ){
            g.fillStyle = (firstPass ? 'black' : 'white')
            
            // draw overall shape
            this.roughPath(g,firstPass)
            g.fill()
            
            // draw details
            this.circles.forEach(c => {
                this.childPath(g,c,firstPass)
                g.fill()
            })
        }
        
        
        // debug 
        // draw ints
        if( false ) {
            var ints = this.getInts()
            g.fillStyle = "red";
            var r = .001
            ints.forEach( i => {
                g.fillRect( i.x-r,i.y-r,2*r,2*r )
            })
        }
    }
    
    // used in childPath
    pointyRad(c,a,r){
        var da = Math.abs(cleanAngle( c.pa-a ))
        //return r*Math.max(1,2-da) // petal
        // return r+.01/da // mesa
        return r+.01/(da+.1)
        
    }
    
    // build path for overall cloud shape
    // used in draw
    roughPath(g,outer){
        //g.ellipse(this.pos.x,this.pos.y,this.xr+dr,this.yr+dr,0,0,twopi)
        
        g.beginPath()
       
        var dr = (outer ? global.edgeWidth : 0)
        var xr = this.xr+dr
        var yr = this.yr+dr
        var n = this.nVertsForRoughShape
        var first = true
        
        for( var i = 0 ; i < n ; i++ ){
            var a = twopi*i/n
            
            var x = Math.cos(a)*xr
            var y = Math.sin(a)*yr
            var p = this.pos.add(v(x,y))
            
            if( i == 0 ){
                g.moveTo( p.x,p.y )
            } else {
                g.lineTo( p.x,p.y )
            }
        }
    }
    
    
    // pick edge width
    // used in childPath
    getChildEdgeWidth(){
        var result = global.edgeWidth
        if( this.nVertsPerChild == 3 ){
            return result * 1.5
        } else if( this.nVertsPerChild == 4 ){
            return result * 1.3
        } else if( this.nVertsPerChild == 5 ){
            return result * 1.15
        }
        
        return Math.max(result, global.edgeWidth*global.pointiness)
    }
    
    // build path for cloud detail element
    // used in draw
    childPath(g,c,outer){
        
        
        g.beginPath()
        //g.arc(c.pos.x,c.pos.y,c.r+(outer?global.edgeWidth:0),0,twopi)
        
        var n = this.nVertsPerChild
        var r = c.r+(outer?this.getChildEdgeWidth():0)
        var first = true
        for( var i = 0 ; i < n ; i++ ){
            var oa = c.a
            //oa = avg( oa,0,global.pointiness)
            var a = oa+twopi*i/n
            
            var rr = avg( r, this.pointyRad(c,a,r), global.pointiness )
            var p = this.pos.add(c.pos.add(vp(a,rr)))
            
            if( i == 0 ){
                g.moveTo( p.x,p.y )
            } else {
                g.lineTo( p.x,p.y )
            }
        }
        
    }
    
    // get all intersection points between circles
    getInts() {
        var circles = this.circles
        var result = [];
        for (let i = 0; i < circles.length; i++) {
            for (let j = i + 1; j < circles.length; j++) {
                addIntersectionPoints(circles[i],circles[j],result)
            }
        }
        return result
    }
}


resetRand()

const global = {
    
    // total time elapsed in milliseconds
    t: 0,
    resetCountdown: 30000,
    resetDelay: 30000,
    
    
    // graphics context
    canvas: null,
    ctx: null,

    // 
    backgroundColor: '#EEE',
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
    
    // objects
    firstUpdate: true,
    nClouds: 5,
    spawnCountdown: 0,
    spawnDelay: [0,0],
    oobMargin: .25, //v units
    clouds: [],
    childSpinSpeed: [1e-4,1e-3], //radians per ms
    pointiness: 0,//
    maxPointiness: 2,
    mouseDown: false,
    pointSpeed: 5e-4,//pointiness unites per ms
    cloudSpeed: [-8e-5,-5e-5], //v units per ms
    
    //,
    nCirclesPerCloud: 20,
    cloudBoundsXr: .1,
    cloudBoundsYr: .05,
    circleMaxSpeed2: 1e-8,
    circleMinSpeed2: 1e-10,
    
    // debug
}


    
    
// Render graphics
function draw(fps, t) {
    
    var ctx = global.ctx
    var canvas = global.canvas
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( 0, 0, canvas.width, canvas.height )

    global.clouds.forEach( b => b.draw(ctx,true) )
    global.clouds.forEach( b => b.draw(ctx,false) )

    if( false ){
        //debug
        // draw screen corners
        var r = .1
        ctx.fillStyle = 'red'
        global.screenCorners.forEach(c => ctx.fillRect( c.x-r, c.y-r, 2*r, 2*r ))
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



function mouseDown(e){
    global.mouseDown = true
}
function mouseUp(e){
    global.mouseDown = false
}



function update(dt) {    
    fitToContainer()
    global.t += dt
    
    if( global.mouseDown ){
        global.pointiness = Math.min( global.maxPointiness, global.pointiness+global.pointSpeed*dt)
    } else {
        global.pointiness = Math.max( 0, global.pointiness-10*global.pointSpeed*dt)
    }
    
    //spawn new clouds
    while( (global.clouds.length < global.nClouds) && (global.spawnCountdown<=0) ){
        global.spawnCountdown = randRange( ...global.spawnDelay )
        var x = (global.firstUpdate ? randomXForCloud() : global.screenCorners[2].x+global.oobMargin)
        var y = randomYForCloud()
        global.clouds.push( new Cloud( v(x,y) ) )
    }
    global.spawnCountdown -= dt
    global.firstUpdate = false;
    
    // update clouds
    global.clouds.forEach( b => b.update(dt) )
    
    // remove OOB clouds
    if( true ){
        global.clouds = global.clouds.filter( b => {
            var margin = global.oobMargin
            var result = (b.pos.x+margin>global.screenCorners[0].x) && (b.pos.x-margin<global.screenCorners[2].x) 
                      && (b.pos.y+margin>global.screenCorners[0].y) && (b.pos.y-margin<global.screenCorners[2].y)
            if( !result ){
                //console.log("remove oob cloud")
                //console.log( global.clouds.length )
            }
            return result
        })
    }
    
}



// used in update() to spawn new cloud
function randomYForCloud(){
    var ym = .1*(global.screenCorners[2].y-global.screenCorners[0].y)
    var y = randRange(global.screenCorners[0].y+ym,global.screenCorners[2].y-ym)
    return y
}

// used in update() to spawn new cloud (only on first update)
function randomXForCloud(){
    var xm = .1*(global.screenCorners[2].x-global.screenCorners[0].x)
    var x = randRange(global.screenCorners[0].x+xm,global.screenCorners[2].x-xm)
    return x
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
    }
}



// Initialize the game
function init() {
    var cvs = document.getElementById("gameCanvas");
      cvs.style.width='100%';
      cvs.style.height='100%';  
    //cvs.addEventListener("mousemove", mouseMove);
    cvs.addEventListener("mousedown", mouseDown);
    cvs.addEventListener("mouseup", mouseUp);
    cvs.addEventListener("touchstart", mouseDown, false);
    cvs.addEventListener("touchend", mouseUp, false);
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


