
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


class Balloon{
    constructor( basePos, pos ){
        
        // base of setm
        this.basePos = basePos
        
        // circle containing spiral (for physics)
        this.pos = pos
        this.vel = v(0,0)
        this.clockwise = (rand() > .5)
        this.angleOffset = pos.sub(basePos).getAngle()+pi
        this.startAngle = this.angleOffset
        this.avel = 0
        
        // archimedean spiral shape
        this.rad = randRange(.02,.1)
        this.a = this.rad 
        this.b = Math.max( 1e-3, this.rad * randRange( 1e-2, 8e-2 ) )
        
        // settings for twisting behavior
        // (regulate distance between stem and spiral)
        this.targetAngle = this.angleOffset
                +(rand()>.5?randRange(-.3,-.2):randRange(.2,.8))
                *(this.clockwise?1:-1)
        this.targetAngleMargin = .1
        
        
        // stem growth animation
        this.stemProgress = 0 // number of line segs in stem
        this.nStem = 100 // max number of line segs in stem
        this.stemComplete = false
        this.spiralComplete = false
        this.stemRetracting = false
        this.stemRetraction = 0 // radius of hidden portion of stem
        this.stemRetractionOffset = randRange(75,95) // center of hidden portion of stem
        this.angle = pi
        
        // sprial growth animation
        this.t = 0
        this.stepDelay = 20
        this.stepLen = 1e-1
        this.spiral = []
        
        // scale of outward force on other balloons
        this.fmul = Math.pow(this.rad,2)
        
        // counter for collision optimization
        this.collisionCheckOffsetIndex = 0
    }
    
    update(dt){
        this.t += dt
        
        // update pos
        this.angleOffset += this.avel*dt
        this.pos = this.pos.add(this.vel.mul(dt))
        
        // apply friction
        this.vel  = this.vel.mul(1-(3e-2*dt)) 
        if( ! this.stemRetracting ) this.avel *= 1-(3e-4*dt)
        
        // twist towards target angle
        if( this.stemComplete && (!this.stemRetracting) ){
            //console.log( this.stemSpace.toFixed(3),   this.targetStemSpace.toFixed(3) )
            var d = this.targetAngle - this.angleOffset
            if( Math.abs(d) > this.targetAngleMargin ){
                this.avel += 4e-7*dt*d
                this.vel = this.vel.add(vp(this.angleOffset-pio2,1e-6*dt*d))
            }
        }
        
        // get pushed by other balloons
        for( var i = 0 ; i < global.nCollisionChecks ; i++ ){
            
            // cycle over balloons
            this.collisionCheckOffsetIndex = (this.collisionCheckOffsetIndex+1)%global.balloons.length
            var o = global.balloons[this.collisionCheckOffsetIndex]
            if( !o.stemComplete ) continue // skip balloon in stem growth animation
            var d = o.pos.sub(this.pos)
            var d2 = d.getD2()
            if(d2 == 0) continue // skip self
            var md2 = Math.pow(o.rad + this.rad,2)
            var fm = .2
            if( d2 > md2*(1+fm) ) continue // skip distant balloon
            
            // accel self away from nearby balloon
            var angle = d.getAngle()
            var f = 1e-7*dt/d2*this.fmul*Math.max(8*pi,o.angle) * (d2<md2 ? 1 : .5*(1-(d2-md2)/(fm)) )
            this.vel = this.vel.sub(vp(angle,f))
        }
        
        // tend towards visible on-screen region
        var d = this.pos.sub(global.centerPos)
        if( (this.pos.x-this.rad < global.screenCorners[0].x) || (this.pos.x+this.rad > global.screenCorners[2].x) || (this.pos.y-this.rad < global.screenCorners[0].y) || (this.pos.y+this.rad > global.screenCorners[2].y)  ){
            var g = 1e-7
            var angle = this.pos.sub(global.centerPos).getAngle()
            var f = vp( angle, g*dt  )
            this.vel = this.vel.sub( f )
        }
        
        // animate stem or spiral growth
        while( this.t > this.stepDelay ){
            
            if( !this.stemComplete ){
                this.growStemOneStep()
            } else if (!this.spiralComplete) {
                this.growSpiralOneStep()
            }
            
            if( this.stemRetracting ) {
                this.retractStemOneStep()
            }
            this.t -= this.stepDelay
        }
        
    }
    
    growStemOneStep(){
        this.stemProgress += 1
        if( this.stemProgress >= this.nStem ) this.stemComplete = true
    }
    
    growSpiralOneStep(){
        var r = this.a - (this.angle-pi)*this.b
        
        if( r < this.b*4 ){
            this.stemRetracting = true
            if( r < this.b ){
                this.spiralComplete = true
                return
            }        
        }
        
        this.angle +=  this.stepLen*this.rad / r
        
        //var next = vp( this.angle,  r )
        var next = [this.angle,r]
        
        this.spiral.push( next )
    }
    
    retractStemOneStep(){
        this.stemRetraction += 1
    }
    
    draw(g){
        
        // get stem shape
        var sp = this.getStemPoints()
        
        
        if( global.debugBezierPoints ){
            // debug 
            // draw bezier points
            g.fillStyle = 'red'
            sp.forEach( p => g.fillRect(p.x,p.y,.003,.003) )
        }
        
        
        
        // start drawing balloon
        g.strokeStyle = 'black'
        g.lineWidth = .001
        g.beginPath()
        
        // draw balloon shell
        //g.arc( this.pos.x, this.pos.y, this.rad, 0, twopi )
        
        // draw stem
        if( this.stemRetraction == 0 ){
            g.moveTo( this.basePos.x, this.basePos.y )
            for( var i = 0 ; i < this.stemProgress ; i++ ){
                var p = bezier(sp,i/this.nStem)
                g.lineTo( p.x, p.y )
            }
            
        } else {
            
            // draw stem with a portion missing in the middle
            var hiddenStart = this.stemRetractionOffset-this.stemRetraction 
            var hiddenEnd = this.stemRetractionOffset+this.stemRetraction 
            g.moveTo( this.basePos.x, this.basePos.y )
            for( var i = 0 ; (i<this.stemProgress) && (i<hiddenStart) ; i++ ){
                var p = bezier(sp,i/this.nStem)
                g.lineTo( p.x, p.y )
            }
            var p = bezier(sp,hiddenEnd/this.nStem)
            g.moveTo( p.x, p.y )
            for( var i = hiddenEnd ; (i<this.stemProgress) && (i<this.nStem) ; i++ ){
                var p = bezier(sp,i/this.nStem)
                g.lineTo( p.x, p.y )
            }
            if( hiddenEnd >= this.nStem ){
                g.moveTo( ...this.getSpiralPos(0) )
            }
        }
        
        // draw internal spiral
        if( this.spiral.length > 0 ){
            for( var i = 0 ; i < this.spiral.length ; i++ ){
                g.lineTo( ...this.getSpiralPos(i) )
            }
        }
        g.stroke()
        
        // debug
        // draw line from base to spiral
        if( false ){
            g.strokeStyle = 'red'
            g.beginPath()
            g.moveTo( this.basePos.x, this.basePos.y )
            g.lineTo( this.pos.x, this.pos.y )
            g.stroke()
        }
        
        
        // debug 
        // draw starting angle
        if( false ) {
            g.font = ".01px Arial";
            g.textAlign = "center";
            g.textBaseline = 'middle';
            g.fillStyle = "red";
            var x = .4
            var y = .4
            g.fillText(this.startAngle.toFixed(3), this.pos.x, this.pos.y );
        }
        
        // debug 
        // draw twisting details
        if( false ) {
            g.font = ".02px Arial";
            g.textAlign = "center";
            g.textBaseline = 'middle';
            g.fillStyle = "red";
            var x = .4
            var y = .4
            g.fillText(this.angleOffset.toFixed(3), this.pos.x, this.pos.y-.01 );
            g.fillText(this.targetAngle.toFixed(3), this.pos.x, this.pos.y+.01 );
        }
        
        // debug 
        // draw retraction info
        if( false ) {
            g.font = ".02px Arial";
            g.textAlign = "center";
            g.textBaseline = 'middle';
            g.fillStyle = "red";
            var x = .4
            var y = .4
            g.fillText(this.stemRetracting, this.pos.x, this.pos.y-.01 );
            g.fillText(this.stemRetraction, this.pos.x, this.pos.y+.01 );
        }
    }
    
    // used in draw()
    // get bezier curve points defining stem shape
    getStemPoints(){
        var result = []
        
        // point where stem meets spiral
        var end = this.pos.add(vp(this.angleOffset,this.rad))
        
        // first point is base
        result.push( this.basePos )
        
        // random points
        for( var r = randRange(.7,.8) ; r < .9 ; r += randRange(.05,.2) ){
            var d = vp( end.sub(this.basePos).getAngle()+pio2, randRange(-.02,.02) )
            var c = va( this.basePos, end, r )
            result.push( c.add(d) )
        }
        
        // last two points end up tangent to the spiral
        var a = this.pos.add(vp(this.angleOffset+.5,this.rad))
        var angle = end.sub(a).getAngle()-.1
        if( !this.clockwise ) angle += pi
        result.push( end.add( vp(angle,.1) ) )
        result.push( end )
        
        return result
    }
    
    // used in draw()
    getSpiralPos(i){        
        var ar = this.spiral[i]
        var p = this.pos.add(vp((this.clockwise? 1 : -1)*ar[0]+this.angleOffset+pi,ar[1]))
        //var p = this.pos.add(this.spiral[i])
        
        return [p.x,p.y]
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
    backgroundColor: 'white',
    
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
    nBalloons: 40,
    spawnCountdown: 0,
    spawnDelay: [100,1000],
    balloons: [],
    
    // balloon collision settings
    nCollisionChecks: 10, // checks per balloon per update
    
    // debug
    debugBezierPoints: false,
}


    
    
// Render graphics
function draw(fps, t) {
    
    resetRand()
    
    var ctx = global.ctx
    var canvas = global.canvas
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( 0, 0, canvas.width, canvas.height )

    global.balloons.forEach( b => b.draw(ctx) )

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



function mouseClick(e){
    global.showPaths = !global.showPaths
}




function update(dt) {    
    fitToContainer()
    global.t += dt
    
    // reset periodically
    global.resetCountdown -= dt
    if( global.resetCountdown < 0 ){
        global.balloons = []
        global.spawnCountdown = 0
        global.resetCountdown = global.resetDelay
    }
    
    //spawn new Ballons
    if( (global.balloons.length < global.nBalloons) && (global.spawnCountdown<=0) ){
        global.spawnCountdown = randRange( ...global.spawnDelay )
        var pos = v( randRange(.4,.6), randRange(.4,.6) )
        var d = pos.sub(global.centerPos)
        
        if( true ){
            // nearest point on edge of screen
            var np = ( Math.abs(d.x) > Math.abs(d.y) ) ?
                      v(  global.screenCorners[(d.x<0) ? 0 : 2].x, pos.y)
                    : v(  pos.x, global.screenCorners[(d.y<0) ? 0 : 2].y)
            
            // push away from center
            var a = np.sub(global.centerPos).getAngle()
            var basePos = np.add(vp(a,.2))
        } else {
            
            // point below screen
            var basePos = v(global.centerPos.x,1.5)
        }
        
        global.balloons.push( new Balloon( basePos, pos ) )
    } else {
        global.spawnCountdown -= dt
    }
    
    // update balloons
    global.balloons.forEach( b => b.update(dt) )
    
    // remove OOB baloons
    global.balloons = global.balloons.filter( b => {
        var result = (b.pos.x>-1) && (b.pos.x<2) 
                  && (b.pos.y>-1) && (b.pos.y<2)
        if( !result ){
            console.log("remove oob ball")
            console.log( global.balloons.length )
        }
        return result
    })
    
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
    cvs.addEventListener("click", mouseClick);
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


