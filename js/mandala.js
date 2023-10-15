
class Point {
    constructor(){
        this.children = [] // list of ChildPoint instances
    }
    
    draw(g){
        var c = this.pos
        g.moveTo(c.x,c.y)
        g.arc(c.x,c.y,.01,0,twopi)
    }
}

// point defined by cartesian coordinates
class ControlPoint extends Point{
    constructor( pos,extremes ){  
        super()    
        
        this.pos = pos
        this.extremes = extremes
        
        // flag for transition 
        // from user movement to auto movement
        this.oldStart = null
    }
    
    update(dt){        
        if( this.extremes ){
            let r = 0
            if( this.useInnerFocus ) r = global.innerFocus
            if( this.useOuterFocus ) r = global.outerFocus
            
            // check if finished transitioning
            // from user movement to auto movement
            if( this.oldStart && (r>=.5) ){
                this.extremes[0] = this.oldStart
                this.oldStart = null
            }
            
            this.pos = va( this.extremes[0], this.extremes[1], r )
        }
    }
}

// point defined as midpoint between 2 points
// along the arc of the given circle
class ChildPoint extends Point{
    
    // all three params are indices in global circles/points
    constructor( circle, a, b, ratio=.5 ){
        super()
        
        this.circle = circle
        this.a = a
        this.b = b
        this.ratio = ratio
        
        this.computePos()
    }
    
    update(dt){
        this.computePos()
    }
    
    computePos(){
        this.updated = true
        
          var xyr = global.allCircles[this.circle].xyr()
          var cx = xyr[0]
          var cy = xyr[1]
          var r = xyr[2]
          
          var a = global.allPoints[this.a].pos
          var b = global.allPoints[this.b].pos
          
          // Calculate the angles of the two points
          let angle1 = Math.atan2(a.y - cy, a.x - cx);
          let angle2 = Math.atan2(b.y - cy, b.x - cx);

          // Calculate the angle difference
          let angleDiff = angle2 - angle1;

          // Ensure the shortest angle distance
          if (angleDiff > Math.PI) {
            angleDiff -= 2 * Math.PI;
          } else if (angleDiff < -Math.PI) {
            angleDiff += 2 * Math.PI;
          }

          // Find the weighted average angle
          let midAngle = angle1 + this.ratio * angleDiff;
          
          this.pos = v( cx, cy ).add( vp( midAngle, r ) )
    }
}

// circle defined by three points
// prnt (parent) is instance of Pattern
// a,b,c are indices of control points in prnt.allPoints
class Circle {
    constructor(prnt,a,b,c){
        this.prnt = prnt
        this.a = a
        this.b = b
        this.c = c
    }
    
    xyr(){
        
        var a = this.prnt.allPoints[this.a].pos
        var b = this.prnt.allPoints[this.b].pos
        var c = this.prnt.allPoints[this.c].pos
        
        var xyr = constructCircle( 
            a.x,a.y, 
            b.x,b.y, 
            c.x,c.y )
            
        return xyr
    }
    
    draw(g, offset=null){
        
        var xyr = this.xyr()
        if( offset ){
            xyr[0] += offset.x
            xyr[1] += offset.y
        }
        
        g.moveTo( xyr[0]+xyr[2], xyr[1],  )
        g.arc(  xyr[0], xyr[1], xyr[2], 0, twopi )
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
        if( o ) return new Vector( this.x+o.x, this.y+o.y )
        return this
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

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
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




function getNextPattern(){
    var scale = 1.1 - .2*global.currentPatternIndex
    var result
    
    var i = randInt(0,3)
    
    if( i == 0 ){
        result = new Donut(scale,global.currentPatternIndex)
    } else if (i == 1 ){
        result = new Mandala(scale,global.currentPatternIndex)
    } else if (i == 2 ){
        result = new Star(scale,global.currentPatternIndex)
    }
    
    global.currentPatternIndex += 1
    
    return result;
    
}

// pattern provides 3d-printing instructions for one layer at a time
class Pattern {

    constructor(scale, pi){
        this.scale = scale
        this.patternIndex = pi
        
        // a step is a stack of layers
        // thickness decreases sharply between steps
        this.layersPerStep = 5
        this.layerIndex = 0
        
        // prepare color pallete (mostly one color)
        var lc = []
        var allColors = [
            // flat surface, dark shadow, light shadow
            ['#F6E0AE','#886666','#FFF5CC'], // wheat
            ['#FFB312','#884400','#FFBB22'], // butterscotch
            ['#85CFB4','#556633','#AAEEDD'], // eucalyptus
            ['#ED186B','#770011','#EE88AA'], // razz
        ]
        var c = allColors[randInt(0,allColors.length)]
        for( var i = 0 ; i < 10 ; i ++ ){
            lc.push((rand() > .8) ? c 
                : allColors[randInt(0,allColors.length)])
        }
        this.stepColors = lc
    }

    rc(v){
        var r = 10
        v += randInt(-r,r)
        if(v < 0) v = 0
        if(v > 255) v = 255
        return v
    }

    randomColorNoise(c,alpha){
        c = hexToRgb(c)
        var rad = 10
        var r = this.rc(c.r)
        var g = this.rc(c.g)
        var b = this.rc(c.b)
        return `rgba(${r},${g},${b},${alpha})`
    }

    draw(g,faceIndex,o=null){
        if( this.done ) return
        
        // determine color to draw
        var stepIndex = Math.floor(this.layerIndex/this.layersPerStep)
        if( stepIndex >= this.nSteps ){
            this.done = true
            return
        }
        var c = this.stepColors[stepIndex][faceIndex]
        var alpha = .6
        if( faceIndex == 1 ) alpha = .6
        if( faceIndex == 2 ) alpha = .6
        
        c = this.randomColorNoise(c,alpha)
        g.strokeStyle = c
        
        // compute precise position of the face to be drawn
        var offset = global.sandD.mul(this.layerIndex)
        offset = offset.add(global.patternO.mul(this.patternIndex))
        if( o ) offset = offset.add(o)
        if( faceIndex == 1 ) offset = offset.add( global.shadowO[0] )
        if( faceIndex == 2 ) offset = offset.add( global.shadowO[1] )
        
        
        // compute thickness of sand strip
        var taperIndex = this.layerIndex - (this.layersPerStep * stepIndex)
        var lw = this.stepThickness[stepIndex] - global.layerTaper*taperIndex
        g.lineWidth = lw
        
        // draw
        this._draw(g,offset)
    }
}

class Donut extends Pattern {
    constructor(scale,pi){
        super(scale,pi)
        
        //large
        var n = 24
        var st = [ .06,.04,.02  ]
        
        if( scale < .4 ){
            
            //small
            n = 6
            st = [ .1, .04  ]
        } else if( scale < .8 ){
            
            //medium
            n = 12
            st = [ .09,.05,.02  ]
        }
        this.baseRad = .2*this.scale
        
        // a step is a stack of layers
        // thickness decreases sharply between steps
        this.nSteps = st.length
        this.stepThickness = st.map( t => t*scale )
    
        
        this.allPoints = [] // ControlPoint instances
        this.allCircles = [] // Circle instances
    
    
        var baseRad = this.baseRad
        
        var dangle = twopi / n
        for( var i = 0 ; i < n ; i++ ){
            let angle = dangle*i + .08
            
            let pos = global.screenCenter//.add(vp(angle+pio2,baseRad))
            let b = new ControlPoint(pos)
            b.useOuterFocus = true
            let c = new ControlPoint(global.screenCenter.add(vp(angle-pio2,baseRad)))
            
            this.allPoints.push(b,c)
            let j = this.allPoints.length
            var bases = [j-1,j-2]
            
            pos = global.screenCenter.sub(vp(angle,baseRad*2))
            let controlPoint = new ControlPoint(pos)
            controlPoint.useInnerFocus = true
            this.allPoints.push(controlPoint)
            let cop = this.allPoints.length-1
            this.allCircles.push(new Circle( this, bases[0], bases[1], cop ))
        }
    }

    _draw(g,offset=null){
        g.beginPath()
        this.allCircles.forEach( b => b.draw(g,offset) )
        g.stroke()
    }
}

class Star extends Pattern {

    constructor(scale,pi){
        super(scale,pi)
        
        // a step is a stack of layers
        // thickness decreases sharply between steps
        var st = [ .09,.06,.02  ]
        this.nSteps = st.length
        this.stepThickness = st.map( t => t*scale )
        
        this.rad = scale*.4
        this.nVerts = randInt(3,6)
        this.nReps = 4
        
        if( scale < .4 ){
            this.nVerts = 3 //small
        } 
    }
    

    _draw(g,offset=null){
        g.beginPath()
        for( var i = 0 ; i < this.nReps ; i++ ){
            var angle = pio2 + twopi * i / this.nReps / this.nVerts
            for( var j = 0 ; j <= this.nVerts ; j++ ){
                var a = angle + twopi * j / this.nVerts
                var p = global.screenCenter.add( vp( a, this.rad ) )
                if( offset ) p = p.add(offset)
                if( j == 0 ){
                    g.moveTo( p.x, p.y )
                } else {
                    g.lineTo( p.x,p.y )
                }
            }
        }
        g.stroke()
    }
}

class Wave extends Pattern {

    constructor(scale,pi){
        super(scale,pi)
        
        // a step is a stack of layers
        // thickness decreases sharply between steps
        var st = [ .09,.06,.02  ]
        this.nSteps = st.length
        this.stepThickness = st.map( t => t*scale )
        
        this.rad = [-scale*.2,scale*.4]
        this.nPers = 6 * randInt(1,3)
    }
    

    _draw(g,offset=null){
        g.beginPath()
        var n = 10000
        for( var i = 0 ; i <= n ; i++ ){
            var a = pio2 * twopi * i / n
            var r = avg( ...this.rad, (Math.cos(a*this.nPers)+1)/2 )
            a += 0
            var p = global.screenCenter.add( vp( a, r ) )
            if( offset ) p = p.add(offset)
            if( i == 0 ){
                g.moveTo( p.x, p.y )
            } else {
                g.lineTo( p.x,p.y )
            }
        }
        g.stroke()
    }
}

class Mandala extends Pattern {

    constructor(scale,pi){
        super(scale,pi)
        
        // a step is a stack of layers
        // thickness decreases sharply between steps
        var st = [ .09,.06,.02  ]
        this.nSteps = st.length
        this.stepThickness = st.map( t => t*scale )
        
        this.rad = scale*.4
        this.nVerts = 12
        
        
        var n = 12
        var st = [ .04,.02,.01  ]
        
        if( scale < .4 ){
            
            //small
            n = 6
            st = [ .1, .04  ]
        } else if( scale < .8 ){
            
            //medium
            n = 12
            st = [ .04,.02,.01  ]
        }
        this.nVerts = n 
        this.baseRad = .2*this.scale
        this.nSteps = st.length
        this.stepThickness = st.map( t => t*scale )
        
    }
    

    _draw(g,offset=null){
        g.beginPath()
        for( var i = 0 ; i < this.nVerts ; i++ ){
            var a1 = twopi * i / this.nVerts
            var p1 = global.screenCenter.add( vp( a1, this.rad ) ).add(offset)
            for( var j = i+1 ; j <= this.nVerts ; j++ ){
                var a2 = twopi * j / this.nVerts
                var p2 = global.screenCenter.add( vp( a2, this.rad ) ).add(offset)
                g.moveTo( p1.x, p1.y )
                g.lineTo( p2.x, p2.y )
            }
        }
        g.stroke()
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
    shadowOffset: v(.001,.001),
    backgroundColor: '#F6E0AE',
    lineWidth: .002,
    
    // overall speed settings
    layerDelay: 40, // ms per layer
    patternDelay: 200, // ms to spawn new pattern
    maxActivePatterns: 2,
    maxTotalPatterns: 6,
      
    // state
    t: 0, // total time elapsed
    activePatterns: [], // Pattern instances being drawn
    currentHi: 0, // (height index) of layer being drawn
    lastDrawnHi: -1,
    patternCountdown: 0, // ms until next pattern spawn
    currentPatternIndex: 0, // total number patterns so far
    
    // isometric perspective settings
    layerTaper: .001, // narrowing between layers, 0 -> 90 degree steps
    sandD: v(0,-.0005), // offset per layer of sand 
    patternO: v(0,-.005), // offset per pattern (a bunch of layers)
    shadowO: [v(.002,.002),v(-.001,-.001)], // shadow offset
    
    // reset automatically
    autoResetCountdown: 0,
    autoResetDelay: 10000,
    
    
    
    //debug
    debugPoints: false,
    debugMouse: false,
}


    
    
// Render graphics
function draw(fps, t) {
    var g = global.ctx
    var canvas = global.canvas
    g.lineCap = 'round'
    g.lineJoin = 'round'

    // iterate over layers due for drawing
    while ( global.lastDrawnHi < global.currentHi ) {
        global.lastDrawnHi += 1
        
        // draw layer shadow
        global.activePatterns.forEach( p => p.draw(g,1) )
        
        // draw layer shadow
        global.activePatterns.forEach( p => p.draw(g,2) )

        // draw layer sand
        global.activePatterns.forEach( p => p.draw(g,0) )
        
        global.activePatterns.forEach( p => p.layerIndex += 1 )
    }
    
    
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
        g.fillStyle = 'red'
        g.beginPath()
        global.allPoints.forEach(p => p.draw(g))
        g.fill()
    }
}





function update(dt) { 
    global.t += dt
    
    if( true ){
        global.autoResetCountdown -= dt
        if( global.autoResetCountdown < 0 ){
            resetGame()
        }
    }
    
    global.currentHi = Math.floor(global.t/global.layerDelay)

    if( (global.activePatterns.length < global.maxActivePatterns) 
            && (global.currentPatternIndex < global.maxTotalPatterns) ){
            
        global.patternCountdown -= dt
        while( global.patternCountdown < 0 ){
            
            // start new pattern
            global.patternCountdown += global.patternDelay
            global.activePatterns.push(getNextPattern())
        }
    }
    
    // remove finished patterns
    global.activePatterns = global.activePatterns.filter( p => !p.done )

    fitToContainer()  
}



var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(){
    
    var cvs = global.canvas
    if( (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
        cvs.width  = cvs.offsetWidth;
        cvs.height = cvs.offsetHeight;
        lastCanvasOffsetWidth = cvs.width
        lastCanvasOffsetHeight = cvs.height

        var dimension = Math.max(cvs.width, cvs.height);
        global.canvasScale = dimension;
        global.canvasOffsetX = (cvs.width - dimension) / 2;
        global.canvasOffsetY = (cvs.height - dimension) / 2;
        global.ctx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);

        var xr = -global.canvasOffsetX / global.canvasScale
        var yr = -global.canvasOffsetY / global.canvasScale
        global.screenCorners = [v(xr,yr),v(1-xr,yr),v(1-xr,1-yr),v(xr,1-yr)]
        global.screenCenter = v(.5,.5)
    
        resetGame()
    }
}



// Initialize the game
function init() {
    var cvs = document.getElementById("gameCanvas");
    cvs.addEventListener("mousedown", resetGame);
    cvs.addEventListener("touchmove", resetGame);
    
    
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    
    resetRand() // math/rng.js
    fitToContainer()
    resetGame()
    requestAnimationFrame(gameLoop);
}


function resetGame(){
    resetRand(hard=true)
    global.autoResetCountdown = global.autoResetDelay
    global.activePatterns = []
    global.currentPatternIndex = 0
    

    global.ctx.fillStyle = global.backgroundColor
    global.ctx.fillRect(-10,-10,20,20)
}

// Main game loop
let secondsPassed;
let oldTimeStamp;
let fps;

var testX = .4

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


