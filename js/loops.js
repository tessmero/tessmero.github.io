
// General Bézier Curve, any number of dimensions or control points
// 
// All math from http://en.wikipedia.org/wiki/B%C3%A9zier_curve#Generalization
// 
// The approximate function inspired by 
// http://www.flong.com/texts/code/shapers_bez/
//
// Create a bezier function with a list of points. Each point must me a vector
// of its coordinates. All such vectors should have the same cardinality.
// 
// e.g new Bezier([ [0, 0], [0.75, 0.25], [1, 1] ])
//
// github.com/whatgoodisaroad/bezier-js
//
function Bezier(points) {
  points = points;

  var 
    // Order is the number of points.
    // e.g. order = 2 ==> Linear
    //            = 3 ==> Quadratic
    //            = 4 ==> Cubic
    //            = 5 ==> Quartic
    //            = 6 ==> Quintic
    //              etc...
    order = points.length,

    // Cardinality is the number of dimensions for the point vectors.
    cardinality = points[0].length,

    // Number of refinement iterations for the approximator. Larger 
    // numbers ==> greater precision. Appropriate  values depend somewhat on 
    // how extreme the slope of your curve gets, how much precision you need 
    // and how much speed you need. Larger values slow things down 
    // significantly.
    refinement = 10;

  this.setPoints = function(_points) {
    points = _points;
  };

  this.setPoint = function(idx, point) {
    points[idx] = point;
  };

  this.setRefinementIterations = function(n) {
    refinement = n;
  };  

  // Compute the curve value as a vector for some t
  this.b_t = function(t) {
    var 
      n = order - 1,
      b = new_vec();

    for (var i = 0; i <= n; ++i) {
      b = vec_add(
        b, 
        sca_mul(
          b_i_n_t(i, n, t),
          points[i]
        )
      );
    }

    return b;
  };

  // Compute the curve differential as a vector for some t.
  // i.e. [ dx_1, dx_2, ..., dx_n ]
  this.differential_t = function(t) {
    var 
      n = order - 1,
      g = new_vec();

    for (var i = 0; i <= n - 1; ++i) {
      g = vec_add(
        g,
        sca_mul(
          b_i_n_t(i, n - 1, t),
          vec_sub(
            points[i + 1],
            points[i]
          )
        )
      );
    }

    return sca_mul(n, g);
  };

  // Compute the derivative for two variables for some t.
  // For example, in 2 dimensions, if we have x_1 is x and x_2 is y, then
  // dy/dx at t is my_beezier.derivative_t(0, 1, t)
  //
  // More simply, it just computes the ratio of components of the 
  // differential vector. Errors where slope is infinite.
  this.derivative_t = function(ix, iy, t) {
    var g = this.differential_t(t);

    if (g[ix] === 0) {
      return 0;
    }
    else {
      return g[iy] / g[ix];
    }
  };

  // Approximate the bezier as a function assuming that the cardinality is 2.
  // 
  // For example, if the Bezier is meant to approximate y = f(x), where x_1 is
  // x and x_2 is y, then y = f(x) ~~ my_bezier.approximate(0, 1, x)
  this.approximate = function(ix, iy, x0) {
    var t = x0, x1, dydx;

    for (var i = 0; i < refinement; ++i) {
      x1 = this.b_t(t)[ix];

      if (x0 === x1) { break; }

      dydx = this.derivative_t(ix, iy, t);

      t -= (x1 - x0) * dydx;
      t = Math.max(0, Math.min(1, t));
    }

    return this.b_t(t)[iy];
  };

  // Shorthand for the 2d approximation scenarios.
  this.y_x = function(x0) {
    return this.approximate(0, 1, x0);
  };
  this.x_y = function(y0) {
    return this.approximate(1, 0, y0);
  };

  // Compute a single Bezier polynomial term.
  function b_i_n_t(i, n, t) {
    return binom(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
  }

  // Sundry helpers.
  function fact(n)       { return n <= 1 ? 1 : n * fact(n - 1); }
  function binom(n, k)   { return fact(n) / (fact(k) * fact(n - k)); }
  function sca_mul(s, v) { return v.map(function(e) { return e * s; }); }
  function vec_add(u, v) { return u.map(function(e,i) { return e + v[i]; }); }
  function vec_sub(u, v) { return u.map(function(e,i) { return e - v[i]; }); }
  function new_vec() {
    var v = [];
    for (var i = 0; i < cardinality; ++i) {
      v.push(0);
    }
    return v;
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
    
    xy(){ return [this.x,this.y] }
    
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
    
    d2(){ return Math.pow(this.x,2) + Math.pow(this.y,2) }
    
    getMagnitude(){
        return Math.sqrt( Math.pow(this.x,2) + Math.pow(this.y,2) )
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

class Loop {
    
    
    constructor( c, rad, reverse = false ){
        this.c = c
        this.rad = rad
        this.reverse = reverse
        
        // number of bezier segments
        let n = 12
        this.n = n
        
        
        // randomly generate precise shape
        let amplitude = .1 // radians
        this.noise = []
        for( let i = 0 ; i < n ; i++ ){
            this.noise.push(randRange(-amplitude,amplitude))
        }
        this._buildCurves()
        
        // potential connected loop instances
        this.connectedLoops = Array(n).fill(null)
        
        // drawing points along loop where 0=1
        this.drawingPoints = []
        
        // fraction of complete circle per ms
        this.speed = 2e-4 / this.rad
        if( this.reverse ) this.speed *= -1
    }
    
    
    _buildCurves(){
        let n = this.n
        let c = this.c
        let rad = this.rad
        
        
        //https://stackoverflow.com/a/27863181
        // distance to control points to approx circle
        let cpd = rad*(4/3)*Math.tan(pi/(2*n))
        
        // build groups of 3 colinear control points
        let ts = []
        for( let i = 0 ; i < n ; i++ ){
            let a = i*twopi/n
            let p = c.add(vp(a,rad))
            
            let cpa = a + this.noise[i]
            
            let p0 = p.add(vp(cpa-pio2,cpd))
            let p1 = p.add(vp(cpa+pio2,cpd))
            ts.push([p0.xy(),p.xy(),p1.xy()])
        }
        
        // build bezier curves
        let curves = []
        for( let i = 1 ; i < n ; i++ )
            curves.push(new Bezier([ts[i-1][1], ts[i-1][2], ts[i][0], ts[i][1]]))
        curves.push(new Bezier([ts[n-1][1], ts[n-1][2], ts[0][0], ts[0][1]]))
        this.curves = curves
    }
    
    advance(){
        let n = this.n
        let dps = this.drawingPoints
                
        // advance each drawing point one iteration
        for( let i = 0 ; i < dps.length ; i++ ){
            
            let oldsegindex = Math.floor(dps[i]*n)
            dps[i] = nnmod(dps[i]+this.speed,1)
            let newsegindex = Math.floor(dps[i]*n)
            
            // check if switched segments
            if( oldsegindex != newsegindex ){
                
                // chance to switch to connected loop
                let cl = this.connectedLoops[newsegindex]
                if( cl && (rand()<.7) ){
                    cl.drawingPoints.push((dps[i]+.5-this.speed)%1)
                    dps.splice(i,1)
                    i--
                    continue
                }
                
                // chance to spawn new loop
                else if( (!cl) && (this.rad >= .005) && (rand()<global.spawnFactor) ){
                    if( global.segsToDraw.length < 2000 ){
                        let newr = Math.min( .1, randRange( global.shrinkFactor,.95 ) * this.rad )
                        let newc = this.c.add( vp( dps[i]*twopi, newr+this.rad ) )
                        let cids = tryAddLoop(newc,newr,this.cids)
                        if( cids ) {
                            
                            // spawn new loop
                            let loop = new Loop(newc,newr,!this.reverse)
                            loop.cids = cids
                            loop.drawingPoints = [(dps[i]+.5-this.speed)%1]
                            this.connectedLoops[newsegindex] = loop
                            let nsi = newsegindex+this.n/2
                            if( !this.reverse ) nsi -= 1
                            if( this.reverse ) nsi += 1
                            loop.connectedLoops[(nsi)%this.n] = this
                            
                            // switch this drawing point to new loop
                            global.segsToDraw.push(loop)
                            dps.splice(i,1)
                            i--
                            continue
                        }
                    }
                }
            }
        }
    }
    
    drawBg(g){
        // erase in front
        let dps = this.drawingPoints
        let ts = this.triples
        let n = this.n
        let s = 5e-3
        dps.forEach( realdp => {
            let dp = nnmod(realdp+1.6*this.speed,1)
            
            let i = Math.floor(dp*n)
            let r = (dp*n)%1
            let p = this.curves[i].b_t(r)
            g.moveTo(...p)
            g.arc(...p,s,0,twopi)
        })
    }
    
    drawFg(g){
        // draw
        let dps = this.drawingPoints
        let ts = this.triples
        let n = this.n
        let s = 2e-3
        dps.forEach( dp => {
            let i = Math.floor(dp*n)
            let r = (dp*n)%1
            let p = this.curves[i].b_t(r)
            g.moveTo(...p)
            g.arc(...p,s,0,twopi)
        })
    }
    
}

// optimize segment intersection checks
// by binning segments into a square grid
//
// assume that all segments are shorter than chunk width
// so a single segment can involve at most 3 chunks



// debug
function drawFilledChunks(g){
    var cw = global.chunkWidth
    
    g.strokeStyle = 'red'
    g.lineWidth = .001
    for( var i = 0 ; i < global.nChunks ; i++ ){
        if( global.filledChunks[i] ){
            var c = _chunkIdToCoords(i)
            g.strokeRect(c[0]*cw, c[1]*cw, cw, cw)
        }
    }
}

// return true if the given segment 
// does not intersect any existing segments
//
// if true then the given segment will 
// be considered in future intersection checks
function tryAddLoop(c,r,parentcids,forced=false){
    var intersects = false
    
    if(!forced){
        // check if completely off screen
        if( (c.x+r) < 0 ) return false
        if( (c.x-r) > 1 ) return false
        if( (c.y+r) < 0 ) return false
        if( (c.y-r) > 1 ) return false
    }
    
    if( r > .005 ) r += 1e-2
    
    let chunkIds = []
    
    let ta = 0, tr = global.chunkWidth, stepdist = 1.1*global.chunkWidth
    while( tr < r ){
        let p = c.add( vp( ta, tr ) )
        if( !offscreen(p) ){
            let cp = _getChunkCoords(p)
            let cid = _coordsToChunkId(cp)
            if( (!forced) && (!parentcids.includes(cid)) && global.filledChunks[cid] ) return false
            chunkIds.push(cid)
        }
        
        let da = stepdist/tr
        ta += da
        tr += 2 * stepdist * da/twopi
        
    }
    
    // add this segment to relevent chunks 
    chunkIds.forEach(i => global.filledChunks[i] = true)
    return chunkIds
}

function offscreen(p){
    return (p.x>9) && (p.y>0) && (p.x<1) && (p.y<1)
}

function _getChunkCoords(p){
    return [Math.floor(p.x/global.chunkWidth),Math.floor(p.y/global.chunkWidth)]
}

function _coordsToChunkId(c){
    return c[0]*global.chunksPerRow + c[1]
}

function _chunkIdToCoords(id){
    return [ Math.floor(id/global.chunksPerRow), id%global.chunksPerRow ]
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

function nnmod(a,b){
    let r = a%b
    if( r < 0 ) return r+b
    return r
}


// used in segment.js
//
// given two points, get slope and intercept
function getMb(a,b){
    var m = (b.y-a.y)/(b.x-a.x)
    var b = a.y - m*a.x
    return {m:m,b:b}
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
    bgColor: 'black',
    fgColor: 'rgba(255,255,255,1)',
    
    // total time elapsed in milliseconds
    t: 0,
    
    
    // growth animation delay (ms)
    growthDelay: 5,
    maxGrowthIterations: 200000,
    
    //
    startShrinkFactor: .75,
    minShrinkFactor: .1,
    shrinkFactor: .8,
    dShrinkFactor: 2e-4,
    
    startSpawnFactor: -.001,
    maxSpawnFactor: 1,
    spawnFactor: .01,
    dSpawnFactor: 3e-5,
    
    //
    segLen: .002,
    chunkWidth: .004,
    segMargin: .002,
    
    //
    segsToDraw: null,
    iterationsDrawn: 0,
    autoResetCountdown: 0,
    autoResetDelay: 30000,
    
    // chunk grid
    // initialized in setup.js
    chunksPerRow : null,
    chunkIdMul : null,
    nChunks : null,
    filledChunks : null,

    
    //debug
    //debugPoint: v(0,0),
}



function drawTree(g){

    var n = Math.min( global.maxGrowthIterations,
            Math.floor( global.t / global.growthDelay ) )
            
    for( var i = global.iterationsDrawn ; i < n ; i++ ){
        //global.segsToDraw = global.segsToDraw.filter( s => tryAddSegment(s) )
        
        g.fillStyle = global.bgColor
        g.beginPath()
        global.segsToDraw.forEach( s => { 
            s.advance()
            s.drawBg(g) 
        })
        g.fill()
        
        
        g.fillStyle = global.fgColor
        g.beginPath()
        global.segsToDraw.forEach( s => s.drawFg(g) )
        g.fill()
        
        
        //global.segsToDraw = global.segsToDraw.flatMap(s => tree.grow(s))
    }
    
    global.iterationsDrawn = n
}
    
    
// Render graphics
function draw(fps, t) {
   var ctx = global.ctx
   var canvas = global.canvas
   
    //ctx.clearRect( 0, 0, canvas.width, canvas.height )

    // draw tree
    drawTree(ctx)
    
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
    
    
    var rect = global.canvas.getBoundingClientRect();
    var scaleX = global.canvas.width / rect.width;
    var scaleY = global.canvas.height / rect.height;
    
    global.canvasMousePos = new Vector( 
        (event.clientX - rect.left) * scaleX, 
        (event.clientY - rect.top) * scaleY 
    
    )
    global.mousePos = new Vector( 
        virtualMouseX = (global.canvasMousePos.x-global.canvasOffsetX)/global.canvasScale, 
        virtualMouseY = (global.canvasMousePos.y-global.canvasOffsetY)/global.canvasScale
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



function update(dt) {    
    global.t += dt
    
    if( global.shrinkFactor > global.minShrinkFactor ){
        global.shrinkFactor = Math.max(global.minShrinkFactor,global.shrinkFactor-global.dShrinkFactor*dt)
    }
    
    if( global.spawnFactor < global.maxSpawnFactor ){
        global.spawnFactor = Math.min(global.maxSpawnFactor,global.spawnFactor+global.dSpawnFactor*dt)
    }
    
    global.autoResetCountdown -= dt
    if( global.autoResetCountdown < 0 ){
        resetGame()
    }
    
    // debug chunk grid
    //activeChunks = {}
    //addSegment( new Segment( global.mousePos, global.debugPoint ) )
}



// Initialize the game
function init() {
    var cvs = document.getElementById("gameCanvas");
    cvs.addEventListener("mousemove", mouseMove);
    cvs.addEventListener("click", mouseClick);
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    resetRand()
    global.chunksPerRow = Math.floor(1/global.chunkWidth)
    global.nChunks = Math.floor(Math.pow(global.chunksPerRow,2))
    global.filledChunks = new Array(global.nChunks);
    //var filledChunks = new Set()
    
    resetGame()
    requestAnimationFrame(gameLoop);
}


function resetGame(){
    resetRand(hard=true)
    global.autoResetCountdown = global.autoResetDelay
    global.t = 0
    global.iterationsDrawn = 0
    global.segsToDraw = []
    global.filledChunks.fill(false)      
    fitToContainer()
    placeStartingSegs()
}

// clear any axisting line segments
// place line segments around the outer edge
// pointing inwards
function placeStartingSegs() {
    
    let loop = new Loop(v(.5,.5),.1)
    
    loop.maxrad = loop.rad // prevent initial loop growth
    
    let mn = 200
    for( let i = 0 ; i < mn ; i++ )
        loop.drawingPoints.push((i*.381966)%1)
    
    loop.cids = tryAddLoop(loop.c,loop.rad,[],true)
    
    global.segsToDraw = [
        loop,
    ]
    
    global.shrinkFactor = global.startShrinkFactor
    global.spawnFactor = global.startSpawnFactor
}

function fitToContainer(){
    
    var cvs = global.canvas
  cvs.style.width='100%';
  cvs.style.height='100%';  
  cvs.width  = cvs.offsetWidth;
  cvs.height = cvs.offsetHeight;
    
    var padding = 10; // (extra zoom IN) thickness of pixels CUT OFF around edges
    var dimension = Math.max(cvs.width, cvs.height) + padding*2;
    global.canvasScale = dimension;
    global.canvasOffsetX = (cvs.width - dimension) / 2;
    global.canvasOffsetY = (cvs.height - dimension) / 2;
    
    global.ctx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);
    global.ctx.fillStyle = global.bgColor
    global.ctx.fillRect( 0, 0, cvs.width, cvs.height )
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


