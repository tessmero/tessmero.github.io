
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
    
    xy(){
        return [this.x,this.y]
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
var sqrt2 = Math.sqrt(2)
var phi = 1.618033988749894
function v(){return new Vector(...arguments)}
function vp(){return Vector.polar(...arguments)}


function randRange(min,max){
    return min + rand()*(max-min)
}

function randChoice(options){
    return options[Math.floor( Math.random() * options.length )]
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

// oscillate from 0 to 1
function pulse(period,offset=0){
    return (Math.sin(offset + global.t * twopi/period)+1)/2
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
function la(l1,l2,r){
    return [va(l1[0],l2[0],r),va(l1[1],l2[1],r)]
}

function arePointsClockwise(p1,p2,p3,p4) {
    const crossProduct = (p1[0] - p2[0]) * (p3[1] - p2[1]) - (p1[1] - p2[1]) * (p3[0] - p2[0]);
    return crossProduct > 0;
}


// compute intersection point of two lines
// the two lines are described by pairs of points
// requires two lists, each containing 2 xy points
function intersection( ab1, ab2 ){
    var mb1 = mb(...ab1)
    var mb2 = mb(...ab2)
    
    if( mb1.m == Infinity ){
        var x = ab1[0].x
        var y = mb2.m*x + mb2.b
    } else if (mb2.m == Infinity ){
        var x = ab2[0].x
        var y = mb1.m*x + mb1.b
    } else {
        //m1*x+b1 = m2*x+b2
        //m1*x-m2*x = b2-b1
        //x = (b2-b1)/(m1-m2)
        var x = (mb2.b-mb1.b)/(mb1.m-mb2.m)
        var y = mb1.m*x + mb1.b
    }
    
    return new Vector( x, y )
}

// compute slope and intercept
// euclidean line with points a and b
function mb(a,b){
    var m = (b.y-a.y)/(b.x-a.x)
    var b = a.y - m*a.x 
    return {m:m,b:b}
}

// https://stackoverflow.com/a/2450976
function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
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


class Pattern {
    constructor(){
        // 90 dots with 3 props (angle, radius, radius)
        this.dotSpecs = new Array(90*3).fill(0)
    }
    
    pushSpecs(...arr){
        arr.forEach( val => 
            this.dotSpecs[this.specIndex++] = val
        )
    }
    
    getUpdatedSpecs(){
        this.update()
        return this.dotSpecs
    }
}

class Outpulse extends Pattern {
    constructor(){
        super()
    }
    
    // override Pattern
    update(){
        this.specIndex = 0
        
        let starRad = .1
        let n = 10
        let dotPulseOffset = 0 //radians
        let dotPulseOffsetStep = -phi/2
        let dotPulsePeriod = 2000 //ms
        let dotRadRange = [.010,.018]
        let dotPosRad = starRad + 5*dotRadRange[1]
        let dotPosRadStep = 3*dotRadRange[1]
        for( var j = 0 ; j < 6 ; j++ ){
            let dotPulse = pulse(dotPulsePeriod,dotPulseOffset)
            let dotRad = dotRadRange[0] + (dotRadRange[1]-dotRadRange[0]) * dotPulse
            dotPulseOffset += dotPulseOffsetStep
            for( let i = 0 ; i < n ; i++ ){
                this.pushSpecs(-pio2 + i*twopi/n, dotPosRad, dotRad)
            }
            dotPosRad += dotPosRadStep
        }
        dotPosRad = starRad + 5*dotRadRange[1]
        dotPosRad += dotPosRadStep
        for( var j = 0 ; j < 3 ; j++ ){
            let dotPulse = pulse(dotPulsePeriod,dotPulseOffset)
            let dotRad = dotRadRange[0] + (dotRadRange[1]-dotRadRange[0]) * dotPulse
            dotPulseOffset += dotPulseOffsetStep
            for( let i = 0 ; i < n ; i++ ){
                this.pushSpecs(-pio2 + (i+.5)*twopi/n, dotPosRad, dotRad)
            }
            dotPosRad += dotPosRadStep
        }
    }
}

class Syncpulse extends Pattern {
    constructor(){
        super()
    }
    
    // override Pattern
    update(){
        this.specIndex = 0
        
        let starRad = .1
        let n = 10
        let dotPulseOffset = 0 //radians
        let dotPulseOffsetStep = 0//-phi/2
        let dotPulsePeriod = 2000 //ms
        let dotRadRange = [.010,.018]
        let dotPosRad = starRad + 5*dotRadRange[1]
        let dotPosRadStep = 3*dotRadRange[1]
        for( var j = 0 ; j < 6 ; j++ ){
            let dotPulse = pulse(dotPulsePeriod,dotPulseOffset)
            let dotRad = dotRadRange[0] + (dotRadRange[1]-dotRadRange[0]) * dotPulse
            dotPulseOffset += dotPulseOffsetStep
            for( let i = 0 ; i < n ; i++ ){
                this.pushSpecs(-pio2 + i*twopi/n, dotPosRad, dotRad)
            }
            dotPosRad += dotPosRadStep
        }
        dotPosRad = starRad + 5*dotRadRange[1]
        dotPosRad += dotPosRadStep
        for( var j = 0 ; j < 3 ; j++ ){
            let dotPulse = pulse(dotPulsePeriod,dotPulseOffset)
            let dotRad = dotRadRange[0] + (dotRadRange[1]-dotRadRange[0]) * dotPulse
            dotPulseOffset += dotPulseOffsetStep
            for( let i = 0 ; i < n ; i++ ){
                this.pushSpecs(-pio2 + (i+.5)*twopi/n, dotPosRad, dotRad)
            }
            dotPosRad += dotPosRadStep
        }
    }
}

class Wigglepulse extends Pattern {
    constructor(){
        super()
    }
    
    // override Pattern
    update(){
        this.specIndex = 0
        
        
        let wiggleAmp = [.005,.01,.02,.03,.05,.1]
        let wigglePeriod = 4000
        
        let starRad = .1
        let n = 10
        let dotPulseOffset = 0 //radians
        let dotPulseOffsetStep = 0//-phi/2
        let dotPulsePeriod = [1500,2500]
        let dotRadRange = [.010,.018]
        let dotPosRad = starRad + 5*dotRadRange[1]
        let dotPosRadStep = 3*dotRadRange[1]
        resetRand()
        for( var j = 0 ; j < 6 ; j++ ){
            for( let i = 0 ; i < n ; i++ ){
                let dotWiggle = pulse(wigglePeriod)-.5
                let dotPulse = pulse(randRange(...dotPulsePeriod))
                let dotRad = dotRadRange[0] + (dotRadRange[1]-dotRadRange[0]) * dotPulse
                this.pushSpecs( dotWiggle*wiggleAmp[j] -pio2 + i*twopi/n, dotPosRad, dotRad)
            }
            dotPosRad += dotPosRadStep
        }
        dotPosRad = starRad + 5*dotRadRange[1]
        dotPosRad += dotPosRadStep
        for( var j = 2 ; j < 5 ; j++ ){
            for( let i = 0 ; i < n ; i++ ){
                let dotWiggle = pulse(wigglePeriod)-.5
                let dotPulse = pulse(randRange(...dotPulsePeriod))
                let dotRad = dotRadRange[0] + (dotRadRange[1]-dotRadRange[0]) * dotPulse
                this.pushSpecs( dotWiggle*wiggleAmp[j] -pio2 + (i+.5)*twopi/n, dotPosRad, dotRad)
            }
            dotPosRad += dotPosRadStep
        }
    }
}

class Wavepulse extends Pattern {
    constructor(){
        super()
    }
    
    // override Pattern
    update(){
        this.wa = global.t/(3000/twopi)
        this.specIndex = 0
        
        let starRad = .1
        let n = 10
        let dotPulseOffset = 0 //radians
        let dotPulseOffsetStep = 0//-phi/2
        let dotPulsePeriod = 2000 //ms
        let dotRadRange = [.010,.018]
        let dotPosRad = starRad + 5*dotRadRange[1]
        let dotPosRadStep = 3*dotRadRange[1]
        let r = dotPosRad
        for( var j = 0 ; j < 6 ; j++ ){
            for( let i = 0 ; i < n ; i++ ){
                let a = -pio2 + (i)*twopi/n
                let rr = this.computeDotRad(a,r)
                let pr = r + this.computePosRadOffset(rr)
                this.pushSpecs(a, pr, rr)
            }
            r += dotPosRadStep
        }
        dotPosRad = starRad + 5*dotRadRange[1]
        dotPosRad += dotPosRadStep
        r = dotPosRad
        for( var j = 0 ; j < 3 ; j++ ){
            for( let i = 0 ; i < n ; i++ ){
                let a = -pio2 + (i+.5)*twopi/n
                let rr = this.computeDotRad(a,r)
                let pr = r + this.computePosRadOffset(rr)
                this.pushSpecs(a, pr, rr)
            }
            r += dotPosRadStep
        }
    }
    
    computePosRadOffset(rr){
        return rr-.010
    }
    
    computeDotRad(a,r){
        return avg(.010,.018,(Math.sin(this.wa-a)+1)/2)
    }
}

class Dwavepulse extends Pattern {
    constructor(){
        super()
    }
    
    // override Pattern
    update(){
        this.wa = global.t/(3000/twopi)
        this.specIndex = 0
        
        let starRad = .1
        let n = 10
        let dotPulseOffset = 0 //radians
        let dotPulseOffsetStep = 0//-phi/2
        let dotPulsePeriod = 2000 //ms
        let dotRadRange = [.010,.018]
        let dotPosRad = starRad + 5*dotRadRange[1]
        let dotPosRadStep = 3*dotRadRange[1]
        let r = dotPosRad
        for( var j = 0 ; j < 6 ; j++ ){
            for( let i = 0 ; i < n ; i++ ){
                let a = -pio2 + (i)*twopi/n
                let rr = this.computeDotRad1(a,r)
                let pr = r + this.computePosRadOffset(rr)
                this.pushSpecs(a, pr, rr)
            }
            r += dotPosRadStep
        }
        dotPosRad = starRad + 5*dotRadRange[1]
        dotPosRad += dotPosRadStep
        r = dotPosRad
        for( var j = 0 ; j < 3 ; j++ ){
            for( let i = 0 ; i < n ; i++ ){
                let a = -pio2 + (i+.5)*twopi/n
                let rr = this.computeDotRad2(a,r)
                let pr = r + this.computePosRadOffset(rr)
                this.pushSpecs(a, pr, rr)
            }
            r += dotPosRadStep
        }
    }
    
    computePosRadOffset(rr){
        return rr-.010
    }
    
    computeDotRad1(a,r){
        return avg(.010,.018,(Math.sin(this.wa-a)+1)/2)
    }
    
    computeDotRad2(a,r){
        return avg(.010,.018,1-(Math.sin(this.wa-a)+1)/2)
    }
}

let allPatterns = [
    new Outpulse(),
    new Syncpulse(),
    new Wigglepulse(),
    new Wavepulse(),
    new Dwavepulse(),
]


function randomPattern(){
    return randChoice(allPatterns)
}

resetRand()

const global = {
    
    // graphics context
    canvas: null,
    ctx: null,

    // 
    backgroundColor: '#AAA',
    patternOffsets: [v(-2e-3,-2e-3),v(2e-3,2e-3),v(0,0)],
    patternColors: ['white','gray','black'],
    edgeWidth: .002,
    
    // relate screen pixels to virtual 2D units
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasScale: 0,
    centerPos: v(.5,.5),
    screenCorners: null, 
    
    // 
    currentPattern: null, //current pulse pattern
    nextPattern: null, // next pulse pattern
    transAngle: 0,
    transPeriod: 10000,
    transR: 0, // goes from 0 to 1 when switching
    
    
    
    // 
    t: 0, // total elapsed time
    autoResetCountdown: 0,
    autoResetDelay: 5000,
    
    // mouse
    pointiness: 0,//
    maxPointiness: 1,
    mouseDown: false,
    mouseDownDisabled: false,
    initPointSpeed: 1e-5,//pointiness unites per ms
    pointSpeed: 1e-7,//pointiness unites per ms
    pointAccel: 4e-7,
    canvasMousePos: v(0,0),     //pixels
    mousePos: v(0,0),           //virtual units
    
    //debug
    debugTileIndices: false,
    
}


    
    
// Render graphics
function draw(fps, t) {
    
    var ctx = global.ctx
    let g = ctx
    var canvas = global.canvas
    
    // draw background
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( -10,-10,20,20 )


    // build dot specs
    // (angle, rad, rad)
    let s0 = global.currentPattern.getUpdatedSpecs()
    let s1 = global.nextPattern.getUpdatedSpecs()
    
    // draw pattern
    for( let i = 0 ; i < global.patternOffsets.length ; i++ ){
        _draw(s0,s1,
            global.patternOffsets[i],
            global.patternColors[i])
    }

    if( false ){
        //debug
        // draw screen corners
        var r = .1
        ctx.fillStyle = 'red'
        global.screenCorners.forEach(c => ctx.fillRect( c.x-r, c.y-r, 2*r, 2*r ))
    }
    
    

    // debug 
    if( false ){
        ctx.fillStyle = 'black'
        ctx.font = ".001em Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${global.angleX.toFixed(2)},${global.angleY.toFixed(2)},${global.angleZ.toFixed(2)}`, .5,.5);
    }
}

function _draw(s0,s1,offset,color){
    
    var ctx = global.ctx
    let g = ctx
    
    // draw star
    let tipPulsePeriod = 3000 //ms
    let tipRadRange = [.008,.012]
    let tipPulse = pulse(tipPulsePeriod)
    let tipRad = tipRadRange[0] + (tipRadRange[1]-tipRadRange[0]) * tipPulse
    g.fillStyle = color
    let center = global.centerPos
    g.lineWidth = tipRad*2+global.pointiness
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.strokeStyle = color
    let starRad = .1
    let n = 5
    let stop = 2*n+1
    g.beginPath()
    g.moveTo(center.x,center.y)
    for( let i = 0 ; i < stop ; i+=2 ){
        let p = center.add( vp( -pio2 + i*twopi/n, starRad ) ).add(offset)
        g.lineTo( p.x, p.y )
    }
    g.stroke()
    g.fill()

    // draw dots
    g.beginPath()
    for( let i = 0 ; i < 270 ; i+=3 ){
        let a = avg(s0[i],s1[i],global.transR)
        let r0 = avg(s0[i+1],s1[i+1],global.transR)
        let r1 = avg(s0[i+2],s1[i+2],global.transR)
        let p = center.add( vp( a, r0 ) ).add(offset)
        g.moveTo( p.x, p.y )
        g.arc( p.x,p.y,r1+global.pointiness,0,twopi)
    }
    g.fill()
}



function mouseDown(e){
    if( global.mouseDownDisabled ) return
    global.mouseDown = true
}
function mouseUp(e){
    global.mouseDownDisabled = false
    global.mouseDown = false
}



function update(dt) {    

    // advance mouse held/released animation if necessary
    if( global.mouseDown ){
        global.pointiness = Math.min( global.maxPointiness, global.pointiness+global.pointSpeed*dt)
        global.pointSpeed += dt*global.pointAccel
        
        //easter egg
        if(global.pointiness == global.maxPointiness){
            global.backgroundColor = randChoice(['#ECF2FF','#95BDFF','#B4E4FF','#DFFFD8','#FFFAD7','#FCDDB0','#FF9F9F','#E97777','#FFE6F7','#FFABE1','#C689C6','#937DC2','#EEF1FF','#D2DAFF','#AAC4FF','#B1B2FF']) 
            global.mouseDownDisabled = true
            global.mouseDown = false
        }
    } else {
        global.pointiness = Math.max( 0, global.pointiness-15*global.initPointSpeed*dt*(1+50*global.pointiness))
        global.pointSpeed = global.initPointSpeed
    }
    
    if( false ){
        // advance auto reset timer
        global.autoResetCountdown -= dt
        if(global.autoResetCountdown <= 0){
            resetGame()
        }
    }

    // advance animation
    global.t += dt
    
    // test transition
    global.transAngle += dt * twopi/global.transPeriod
    if( global.transAngle > pi ){
        global.transAngle -= pi
        global.currentPattern = global.nextPattern
        global.nextPattern = randomPattern()
    }
    global.transR = (1-Math.cos(global.transAngle))/2

    // check for resized window
    fitToContainer()    
}


var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(){
    
    var cvs = global.canvas
    if( (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
        lastCanvasOffsetWidth = cvs.offsetWidth
        lastCanvasOffsetHeight = cvs.offsetHeight
        
      cvs.width  = cvs.offsetWidth;
      cvs.height = cvs.offsetHeight;
        var padding = 0; // Padding around the square region
        var dimension = Math.min(cvs.width, cvs.height) - padding * 2;
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
    cvs.addEventListener("mouseup", mouseUp);
    cvs.addEventListener("touchstart", mouseDown, false);
    cvs.addEventListener("touchend", mouseUp, false);
    
    
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    // 
    resetGame()
    
    //
    requestAnimationFrame(gameLoop);
}

function resetGame(){
    resetRand(hard = true)
    
    global.currentPattern = allPatterns[0]
    global.nextPattern = allPatterns[0]
    shuffle(allPatterns)
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


