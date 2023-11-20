
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
var pio4 = Math.PI/4
var twopi = 2*Math.PI
function v(){return new Vector(...arguments)}
function vp(){return Vector.polar(...arguments)}

var rand = Math.random

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

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}

// constraint between to points
// i.j are indices in global.pManager.data
class Spring {
    constructor(i, j, restLength) {
        this.i = i;
        this.j = j;
        this.restLength = restLength;
        this.prevLength = restLength;
        this.springConstant = 2e-3;
        this.dampingConstant = 1;
    }

    update(dt) {
        
        // Calculate the vector between the two balls
        let pman = global.pManager
        let xy = pman.data
        let pi = v(xy[this.i],xy[this.i+1])
        let pj = v(xy[this.j],xy[this.j+1])
        let displacement = pj.sub(pi)

        // Calculate the current length of the spring
        let currentLength = displacement.getMagnitude();
        let dAngle = displacement.getAngle()

        // Calculate the force exerted by the spring
        let forceMagnitude = this.springConstant * (currentLength - this.restLength);
        let tooLong = true
        if( forceMagnitude < 0 ){
            tooLong = false
            dAngle += Math.PI
            forceMagnitude *= -1
        }

        // apply damping
        let relativeSpeed = (currentLength - this.prevLength) / dt
        if( tooLong == (relativeSpeed < 0) ){
            let dampingMagnitude = Math.abs(relativeSpeed) * this.dampingConstant
            forceMagnitude = Math.max( 0, forceMagnitude - dampingMagnitude )
        }
        this.prevLength = currentLength
        
        // Calculate the force vector
        let force = Vector.polar( dAngle, forceMagnitude )
        
        // Apply damping
        //let dampingForce = relativeVelocity.mul(this.dampingConstant);
        //force = force.sub(dampingForce);

        // Apply the force to the balls
        this.ball1.applyForce(force,dt);
        this.ball2.applyForce(force.mul(-1),dt);
    }
}








class Jellyfish {

    constructor(){        
        this.legs = []
        for( let i = 0 ; i < 5 ; i++ ){
            this.legs.push(new Leg())
        }
        
        this.topPos = v(.5,.5)
        this.topVel = v(0,0)
        
        this.botPos = v(.5,.6)
        this.botVel = v(0,0)
        
        this.randomTarget()
    }
    
    randomTarget(){
        this.targetPos = v(randRange(.1,.9),randRange(.1,.9)) 
    }
    
    update(dt){
        
        // move top of head towards target
        var tp = this.targetPos
        var d = tp.sub(this.topPos)
        var dist = d.getMagnitude()
        if( dist > .01 ){
            var accel = d.mul(1e-5*dt)
            this.topVel = this.topVel.add(accel)
        }
        
        // drag bottom of head behind top of head
        d = this.topPos.sub(this.botPos)
        dist = d.getMagnitude()
        if( dist > .02 ){
            var accel = d.mul(2e-5*dt)
            this.botVel = this.botVel.add(accel)
        }
        
        // apply physics to head
        this.topPos = this.topPos.add(this.topVel)
        this.botPos = this.botPos.add(this.botVel)
        this.topVel = this.topVel.mul(1.0 - (dt*2e-3))
        this.botVel = this.botVel.mul(1.0 - (dt*2e-3))
        
        // update legs' anchor points 
        // based on position of top + top/bottom angle
        //global.debugLines = [['green', this.topPos,this.botPos]]
        let dangle = d.getAngle()
        let c = this.topPos.sub(vp(dangle,.01))
        let rad = .01
        let left = c.add(vp(dangle+pio2,rad))
        let right = c.sub(vp(dangle+pio2,rad))
        for( let i = 0 ; i < this.legs.length ; i++ ){
            //var angle = dangle+twopi*i/this.legs.length
            //var p = c.add(vp(angle,rad))
            var p = va(left,right,i/this.legs.length)
            this.legs[i].data[0] = p.x
            this.legs[i].data[1] = p.y
            this.legs[i].data[2] = 0
            this.legs[i].data[3] = 0
        }
        
        this.legs.forEach(l => l.update(dt))
    }
    
    reset(){
        this.legs.forEach(l => l.reset())
    }
    
    drawPoints(g){
        this.legs.forEach(l => l.drawPoints(g))
    }
}

class Leg {

    constructor(){
        
        let n = Math.floor(randRange(50,100))
        this.n = n
        this.dim = 4
        this.data = new Array(n*this.dim).fill(0)
        
        this.reset()
    }
    
    update(dt){
        
        let i, n=this.n, d=this.data, dim=this.dim
        
        let maxdist = 1e-7
        let fmag = dt*global.spring
        
        let mf = 1.0-(dt*global.friction)
        let gf = dt*global.gravity
        
        for( i = 0 ; i < n ; i++ ){
            // advance positions
            d[i*dim+0] += dt * d[i*dim+2]
            d[i*dim+1] += dt * d[i*dim+3]
            
            // apply friction
            d[i*dim+2] *= mf
            d[i*dim+3] *= mf
            
            // apply gravity
            d[i*dim+3] += gf
            
            // each particle drags the next one
            if( (i+1) < n ){
                var dx = d[(i+1)*dim+0] - d[(i)*dim+0]
                if( Math.abs(dx) > maxdist ){
                    var f = (maxdist-dx)*fmag*dt
                    d[(i+1)*dim+2] += f
                    d[(i)*dim+2] -= f
                }
                var dy = d[(i+1)*dim+1] - d[(i)*dim+1]
                if( Math.abs(dy) > maxdist ){
                    var f = (maxdist-dy)*fmag*dt
                    d[(i+1)*dim+3] += f
                    d[(i)*dim+3] -= f
                }
            }
        }
    }
    
    reset(){
        let i, n=this.n, d=this.data, dim=this.dim
        
        for( i = 0 ; i < n ; i++ ){
            
            // set random position
            d[i*dim+0] = .5//rand()
            d[i*dim+1] = .5//rand()
            
            // set random vel
            let v = vp(randRange(0,twopi),randRange(1e-4,1e-3))
            d[i*dim+2] = 0//v.x
            d[i*dim+3] = 0//v.y
            
        }
    }
    
    drawPoints(g){
        let i, n=this.n, d=this.data, s=global.pSize
        for( i = 0 ; i < n ; i++ ){
            g.fillRect(d[i*4+0],d[i*4+1],s,s)
        }
    }
}


const global = {
    
    // total time elapsed in milliseconds
    t: 0,
    resetCountdown: 5000,
    resetDelay: [5000,8000],
    
    
    // graphics context
    canvas: null,
    ctx: null,

    // 
    backgroundColor: 'black',
    pColor: 'white',
    
    //
    pSize: .002,
    spring: 8e-6, // spring force multiplier
    friction: 4e-4, // fraction of speed lost per ms
    gravity: 2e-9,//1e-7, // dist/ms/ms
    
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
    jellyfish: [], // Jellyfish instances
    targetPos: v(.5,.5),
    
    // debug
    debugBezierPoints: false,
}


    
    
// Render graphics
function draw(fps, t) {
    
    var ctx = global.ctx
    var canvas = global.canvas
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( 0, 0, canvas.width, canvas.height )

    var g = ctx
    
    g.fillStyle = global.pColor
    global.jellyfish.forEach(j=>j.drawPoints(g))

    if( false ){
        //debug
        // draw screen corners
        var r = .1
        ctx.fillStyle = 'red'
        global.screenCorners.forEach(c => ctx.fillRect( c.x-r, c.y-r, 2*r, 2*r ))
    }
    
    if( global.debugLines ){
        global.debugLines.forEach(l => {
            let [color,a,b] = l
            g.lineWidth = .001
            g.strokeStyle = color
            g.beginPath()
            g.moveTo(a.x,a.y)
            g.lineTo(b.x,b.y)
            g.stroke()
        })
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

function updateMousePos(event){
    if( global.t < 5000 ) return
    
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
    
    
    // set target to mouse position
    global.jellyfish.forEach( j => {
        j.targetPos = global.mousePos 
        j.resetCountdown = randRange(...global.resetDelay)
    })
}

function mouseMove(e){
    updateMousePos(e)
}

function mouseClick(e){
    updateMousePos(e)
}




function update(dt) {    
    fitToContainer()
    global.t += dt
    
    global.jellyfish.forEach(j=>{
        
        // run physics
        j.update(dt)
            
        // autoreset periodically
        if( true ){
            if( j.resetCountdown > 0 ){
                j.resetCountdown -= dt
            } else {
                j.randomTarget()
                j.resetCountdown = randRange(...global.resetDelay)
            }
        }
    })
}





var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(forceReset=false){
    
    var cvs = global.canvas
    if( forceReset || (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
      lastCanvasOffsetWidth  = cvs.offsetWidth;
      lastCanvasOffsetHeight = cvs.offsetHeight;
        
      cvs.width  = cvs.offsetWidth;
      cvs.height = cvs.offsetHeight;
        
        var padding = 20; // (extra zoom IN) thickness of pixels CUT OFF around edges
        var dimension = Math.max(cvs.width, cvs.height) + padding*2;
        global.canvasScale = dimension;
        global.canvasOffsetX = (cvs.width - dimension) / 2;
        global.canvasOffsetY = (cvs.height - dimension) / 2;
    global.ctx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);
        
        var xr = -global.canvasOffsetX / global.canvasScale
        var yr = -global.canvasOffsetY / global.canvasScale
        global.screenCorners = [v(xr,yr),v(1-xr,yr),v(1-xr,1-yr),v(xr,1-yr)]
    
        resetGame()
    }
}



// Initialize the game
function init() {
    
    // prepare for math later
    global.helix_d = global.scaffoldThickness + global.vineThickness
    global.hpid2 = Math.pow(pi*global.helix_d,2)
    
    
    var cvs = document.getElementById("gameCanvas");
      cvs.style.width='100%';
      cvs.style.height='100%';  
    cvs.addEventListener("mousemove", mouseMove);
    cvs.addEventListener("click", mouseClick);
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    resetGame()
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    global.jellyfish = []
    for( let i = 0 ; i < 5 ; i++ ) global.jellyfish.push(new Jellyfish())
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


