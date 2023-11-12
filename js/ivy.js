
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

// a static line segment for ivy to wrap around
class Scaffold {
    constructor(a,b){
        this.a = a
        this.b = b
        this.angle = b.sub(a).getAngle()
    }
    
    draw(g){
        g.moveTo(this.a.x, this.a.y)
        g.lineTo(this.b.x, this.b.y)
    }
    
    // get subsegment
    getAB(start=0,stop=1){
        let [a,b] = [this.a,this.b]
        return [va(a,b,start), va(a,b,stop)]
    }
}

// ivy branch segment wrapping around a scaffold
class Vine {
    constructor(scaffold,start,stop,reverseHelix=false,startPadding=null){
        this.scaffold = scaffold
        scaffold.occupied = true
        this.start = start
        this.stop = stop
        this.reverse = (stop<start)
        this.reverseHelix = reverseHelix
        if( startPadding == null ) startPadding = rand() * global.vinePadding
        this.startPadding = startPadding
        this.stopPadding = rand() * global.vinePadding
        
        var [a,b] = scaffold.getAB(start,stop)
        this.a = a
        this.prev = a
        this.b = b
        
        let d = b.sub(a)
        this.d = d
        let dist = d.getMagnitude()
        
        this.amp = global.helix_d/2
        this.norm = d.getAngle() + pio2
        
        let rd = randRange(...global.spiralDensity)
        let n = Math.floor( dist * rd )
        if( n < 1 ) n = 1
        this.nPeriods = n
        
        this.nSegs = this.nPeriods*100
        
        // compute growth duration
        let h = dist
        let p = h/n
        let hlen = n * Math.sqrt(global.hpid2 + p*p)
        this.growthDuration = hlen/global.growthSpeed
        this.t = 0
        this.pt = 0
    }
    
    update(dt){
        this.pt = this.t
        this.t += dt
    }
    
    isDone(){
        return this.t > this.growthDuration
    }
    
    // get new vines to extend this one
    // return list of length 1 to grow normally
    // return empty list to stop growing
    getNext(){
        
        // check if there is still space on the current scaffold
        if( (!this.reverse) && (this.stop<.8) ){
            
            // continue on the current scaffold
            let newStop = this.stop+randRange(...global.helixDist)
            if( newStop > .8 ) newStop = 1
            return [new Vine(this.scaffold,this.stop,newStop,this.reverseHelix)]
        }
        
        // check if there is still space on the current scaffold
        if( (this.reverse) && (this.stop>.2) ){
            
            // continue on the current scaffold
            let newStop = this.stop-randRange(...global.helixDist)
            if( newStop<.2 ) newStop = 0
            return [new Vine(this.scaffold,this.stop,newStop,this.reverseHelix)]
        }
        
        let result = []
        
        do{
        
            // look for next scaffold nearby
            let p = this.b//.add(vp(this.d.getAngle()+pio4,global.maxJump))
            let all_s = this.getNextScaffolds(p)
            shuffle(all_s)
            
            // grow on new scaffold
            if( all_s.length > 0 ){
                let s = all_s.pop()
                
                // check if new scaffodl has same orientation as current
                let rh = this.reverseHelix
                if( Math.abs(s[0].angle-this.scaffold.angle) > .1 ){
                    rh = !rh
                }
                
                if( s[1] ){
                    result.push(new Vine(s[0],0,randRange(...global.helixDist),rh))
                } else {
                    result.push(new Vine(s[0],1,1-randRange(...global.helixDist),rh))
                }
            } else {
                break
            }
            
        }while( rand() < global.branchRate )
        
        return result
    }
    
    getNextScaffolds(p){
        let mj2 = Math.pow(global.maxJump,2)
        let result = []
        global.allScaffolds.forEach( s => {
            if( s.occupied ) return
            
            let d2 = p.sub(s.a).getD2()
            if( (d2<mj2) ){
                result.push([s,true])
            }
            
            d2 = p.sub(s.b).getD2()
            if( (d2<mj2) ){
                result.push([s,false])
            }
        })
        return result
    }
    
    draw(g){
        let newTwigs = []
        
        let a = this.a
        let b = this.b
        let nSegs = this.nSegs
        
        let start = Math.floor(nSegs*this.pt/this.growthDuration)
        let stop = Math.floor(nSegs*this.t/this.growthDuration)
        
        //g.restore()
        
        // draw vine segment
        for( let i = start ; (i<stop)&&(i<nSegs) ; i++ ){
            let ang = twopi*i/nSegs*this.nPeriods
            let padding = avg(this.startPadding,this.stopPadding,i/nSegs)
            
            // decide whether this should be occluded by scaffold
            let infront = (((ang+pio2)%twopi)<pi)
            g.globalCompositeOperation = infront ? "destination-over" : "source-over";  
            
            // compute point on helix
            let amp = this.amp * Math.sin(ang)
            if( this.reverseHelix ) amp *= -1
            amp += Math.sign(amp) * padding
            let p = va(a,b,i/nSegs).add(vp(this.norm,amp))
            
            //draw
            if( true ){
                g.beginPath()
                g.moveTo(this.prev.x,this.prev.y)
                g.lineTo(p.x,p.y)
                g.stroke()
            } else {
                g.beginPath()
                g.moveTo(p.x,p.y)
                g.arc(p.x,p.y,global.vineThickness/2,0,twopi)
                g.fill()
            }
            
            if( rand() < global.twigRate ){
                // add twig to be drawn later
                let angle = this.scaffold.angle+pio2
                if( amp > 0 ) angle += pi
                angle += randRange(-pio4,pio4)
                newTwigs.push( new Twig(p,angle,infront) )
            }
            
            this.prev = p
        }
         
        return newTwigs
    }
}

// loose twig sticking out of Vine
class Twig{
    
    constructor(p,angle,infront){
        this.p = p
        this.infront = infront
        let len = randRange(...global.twigLen)
        
        // pick bezier curve points
        let a = p
        let b = p.add(vp(angle,len/2)).add(vp(angle+pio2,randRange(-len,len)))
        let c = p.add(vp(angle,len))
        this.points = [a,b,c]
        
        
        this.nSegs = Math.floor(len*1e3)
        this.growthDuration = len/global.growthSpeed
        this.t = 0
        this.pt = 0
    }
    
    update(dt){
        this.pt = this.t
        this.t += dt
    }
    
    isDone(){
        return this.t > this.growthDuration
    }
    
    getNext(){
        if( rand() < global.leafRate ){
            let ps = this.points
            let n = ps.length
            let angle = ps[n-1].sub(ps[n-2]).getAngle()
            return [new Leaf(this.p, angle, this.infront)]
        }
        return []
    }
    
    draw(g){
        g.globalCompositeOperation = this.infront ? "destination-over" : "source-over";  
        
        var nSegs = this.nSegs
        
        var start = Math.floor(nSegs*this.pt/this.growthDuration)
        var stop = Math.floor(nSegs*this.t/this.growthDuration)
        
        // draw subsegment
        for( var i = start ; (i<stop)&&(i<nSegs) ; i++ ){
            let p = bezier(this.points,i/nSegs)
            this.p = p
            
            // draw circle
            g.beginPath()
            g.moveTo(p.x,p.y)
            g.arc(p.x,p.y,global.vineThickness/2,0,twopi)
            g.fill()
        }
         
        return []
    }
}

// loose twig sticking out of Vine
class Leaf{
    
    constructor(p,angle,infront){
        this.infront = infront
        this.maxRad = randRange(...global.leafSize)
        let len = randRange(...global.leafLen)
        
        // pick bezier curve points
        let a = p
        let b = p.add(vp(angle,len/2)).add(vp(angle+pio2,randRange(-len/4,len/4)))
        let c = p.add(vp(angle,len))
        this.points = [a,b,c]
        
        
        this.nSegs = Math.floor(len*1e3)
        this.growthDuration = 10*len/global.growthSpeed
        this.t = 0
        this.pt = 0
    }
    
    update(dt){
        this.pt = this.t
        this.t += dt
    }
    
    isDone(){
        return this.t > this.growthDuration
    }
    
    getNext(){
        return []
    }
    
    draw(g){
        g.globalCompositeOperation = this.infront ? "destination-over" : "source-over";  
        
        var nSegs = this.nSegs
        
        var start = Math.floor(nSegs*this.pt/this.growthDuration)
        var stop = Math.floor(nSegs*this.t/this.growthDuration)
        
        // draw subsegment
        for( var i = start ; (i<stop)&&(i<nSegs) ; i++ ){
            var p = bezier(this.points,i/nSegs)
            
            var rad = this.maxRad * Math.sin(pi*i/nSegs)
            if( rad < (global.vineThicknes/2) ) rad = global.vineThickness/2
            
            // draw circle
            g.beginPath()
            g.moveTo(p.x,p.y)
            g.arc(p.x,p.y,rad,0,twopi)
            g.fill()
        }
         
        return []
    }
}


function doRandomPattern(){
    
    
    let allPatterns = [
        squarePattern,
        hexPattern,
        //trianglePattern,
    ]
    
    allPatterns[Math.floor(randRange(0,allPatterns.length))]()
}

function squarePattern(){
    global.allScaffolds = []
    let dx = .1
    let dy = .1
    for( let x = 0 ; x < 1 ; x += dx ){
        for( let y = 0 ; y < 1 ; y += dy ){
            global.allScaffolds.push(new Scaffold(v(x,y),v(x+dx,y)))
            global.allScaffolds.push(new Scaffold(v(x,y),v(x,y+dy)))
        }
    }
    let s = global.allScaffolds[Math.floor(global.allScaffolds.length/2)]
    global.allVines = [new Vine(s,0,.2)]
}

function hexPattern(){
    
    global.allScaffolds = []
    
    let dy = .09
    let dx = .1
    let scale = .6
    dx *= scale
    dy *= scale
    let ix = 0
    
    for( let x = 0 ; x < 1 ; x += dx ){
        let iy = 0
        for( let y = 0 ; y < 1 ; y += dy ){
            let ox = ( iy%2 ) ? 0 : dx/2 
            
            let val = ((ix+(iy%2))%3)
            
            if( val == 0 ) {
                global.allScaffolds.push(new Scaffold(v(x+ox,y),v(x+ox+dx,y)))
            }
            
            if( val == 0 ) {
                global.allScaffolds.push(new Scaffold(v(x+ox,y),v(x+ox-dx/2,y+dy)))
            }
            if( val == 1 ) {
                global.allScaffolds.push(new Scaffold(v(x+ox,y),v(x+ox+dx/2,y+dy)))
            }
            
            iy += 1
        }
        
        ix += 1
    }
    
    global.allVines = []
    for( let i = 0 ; i < 1 ; i++ ) {
        let s = global.allScaffolds[Math.floor(global.allScaffolds.length*randRange(.3,.7))]
        global.allVines.push(new Vine(s,0,.2))
    }
}

function trianglePattern(){
    global.allScaffolds = []
    let dy = .09
    let dx = .1
    for( let x = 0 ; x < 1 ; x += dx ){
        let iy = 0
        for( let y = 0 ; y < 1 ; y += dy ){
            let ox = ( iy%2 ) ? 0 : dx/2 
            iy += 1
            
            global.allScaffolds.push(new Scaffold(v(x+ox,y),v(x+ox+dx,y)))
            global.allScaffolds.push(new Scaffold(v(x+ox,y),v(x+ox+dx/2,y+dy)))
            global.allScaffolds.push(new Scaffold(v(x+ox,y),v(x+ox-dx/2,y+dy)))
        }
    }
    let s = global.allScaffolds[Math.floor(global.allScaffolds.length/2)]
    global.allVines = [new Vine(s,0,.2)]
}


const global = {
    
    // total time elapsed in milliseconds
    t: 0,
    resetCountdown: 1000,
    resetDelay: 1000,
    
    
    // graphics context
    canvas: null,
    ctx: null,

    // 
    vineColor: '#393',
    scaffoldColor: '#742',
    
    //
    scaffoldThickness: .008,
    vineThickness: .004,
    
    vinePadding: 0, // max space between a vine and its scaffold
    
    // number of spirals around lattice
    // per distance unit
    spiralDensity: [1.3,130],
    
    // size of vine instances
    // fraction of scaffold length
    helixDist: [.1,.3],
    
    // max dist vines are allowed to jump between scaffolds
    maxJump: .01, 
    
    growthSpeed: 4e-4, // distance per ms
    
    branchRate: .5, // chance for helix to branch at scaffold intersection
    
    twigRate: 5e-3, // helix to spawn twig
    twigLen: [.01,.03],
    
    leafRate: .5,// twig to spawn leaf
    leafSize: [.005,.012], // radius
    leafLen: [.02,.04], // length
    
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
    allScaffolds: [],
    allVines: [], // Vine/Twig/Leaf intances
    
    // debug
    debugBezierPoints: false,
}


    
    
// Render graphics
function draw(fps, t) {
    
    var ctx = global.ctx
    var canvas = global.canvas
    //ctx.fillStyle = global.backgroundColor
    //ctx.fillRect( 0, 0, canvas.width, canvas.height )

    var g = ctx
    
    // draw vines
    g.strokeStyle = global.vineColor
    g.fillStyle = global.vineColor
    g.lineWidth = global.vineThickness
    g.lineCap = 'round'
    let newTwigs = global.allVines.flatMap( v => v.draw(g) )
    global.allVines.push(...newTwigs)

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
    
    // update objects being drawn
    global.allVines.forEach(v => v.update(dt))
    let newVines = []
    global.allVines = global.allVines.filter(v => {
            if( v.isDone() ){
                newVines.push(...v.getNext())
                return false
            }
            return true
    })
    global.allVines.push(...newVines)
            
    // autoreset periodically
    if( global.allVines.length == 0 ){
        if( global.resetCountdown > 0 ){
            global.resetCountdown -= dt
        } else {
            fitToContainer(true) 
        }
    }
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
    //cvs.addEventListener("mousemove", mouseMove);
    cvs.addEventListener("click", mouseClick);
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    resetGame()
    requestAnimationFrame(gameLoop);
}

function resetGame() {
    global.resetCountdown = global.resetDelay
    doRandomPattern() 
    
    // draw scaffolds
    let g = global.ctx
    g.strokeStyle = global.scaffoldColor
    g.lineWidth = global.scaffoldThickness
    g.beginPath()
    global.allScaffolds.forEach( s => s.draw(g) )
    g.stroke()
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


