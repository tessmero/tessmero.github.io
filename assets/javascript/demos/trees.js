
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

// directed line segment connecting two points

class Segment{
    constructor( start, end, depth=0, parentChunkIds=[] ){
        this.start = start
        this.end = end
        
        var d = end.sub(start)
        var angle = d.getAngle()
        this.d = d
        this.angle = angle
        
        this.depth = depth
        this.parentChunkIds = parentChunkIds
        this.chunkIds = getChunkIds(this)
    }
    
    draw(g){
        g.moveTo(this.start.x, this.start.y)
        g.lineTo(this.end.x, this.end.y)
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
function tryAddSegment(seg){
    
    // check if off-screen
    if( (seg.end<0) || (seg.end<0) || (seg.end>=1) || (seg.end>=1) ){
        return false
    }
    
    // identify relevant chunks
    var chunkIds = seg.chunkIds;
    
    // check for intersections with
    // lines in relevant chunks
    chunkIds = chunkIds.filter(i => !seg.parentChunkIds.includes(i))
    
    var intersects = false
    if( !seg.forceAdd ){
        intersects = chunkIds.some(i => global.filledChunks[i])
        
        if( intersects ){
            return false
        }
    }
    
    // check for intersections ahead of the new segment
    var ahead = new Segment( seg.end, 
        seg.end.add( vp( seg.end.sub(seg.start).getAngle(), global.segMargin ) ) )
    var aheadChunkIds = ahead.chunkIds.filter(i => !seg.chunkIds.includes(i))
    intersects = aheadChunkIds.some( i => global.filledChunks[i] )
    if( intersects ){
        return false
    }
    
    // add this segment to relevent chunks 
    chunkIds.forEach(i => global.filledChunks[i] = true)
    return true
}

// used in segment.js
//
// given a line segemnt,
// get a list of 1, 2, or 3 relevant chunk IDs
function getChunkIds(seg){
    var ca = _getChunkCoords(seg.start)
    var cb = _getChunkCoords(seg.end)
    var ida = _coordsToChunkId(ca)
    var idb = _coordsToChunkId(cb)
    
    if( idb==ida ){
        // both ends of the segment are in the same chunk
        return [ida]
    }
    
    // segment in two diagonal chunks
    // add a third chunk
    if( (ca[0]!=cb[0]) && (ca[1]!=cb[1]) ){
        
        var midx = Math.max(ca[0],cb[0]) * global.chunkWidth
        var midy = Math.max(ca[1],cb[1]) * global.chunkWidth
        var mb = getMb(seg.start, seg.end)
        var segy = mb.m*midx + mb.b
        var idc = _coordsToChunkId( 
            (segy>midy) == (cb[1]>ca[1]) ? 
            [ca[0],cb[1]] : [cb[0],ca[1]] )
        return [ida,idb,idc]
    }
    
    
    // segment in two adjacent
    return [ida,idb]
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


// a saet of rules to generate a tree made of line segments

class Tree {

    // given an existing segment, 
    // determine where the next segment(s) will grow
    //  return list of length one to grow normally
    //  return list of length two to split into two branches
    //  return empty list to terminate branch
    grow(branch){
        throw new Error('Not implemented')
    }
  
}

class DoodleTree extends Tree {
    
    grow(branch){
        
        
        // handle doodle-tree specific member vars
        if(!( 'spiralDepth' in branch )){
            branch.spiralDepth = 0
        }
        if(!( 'spiralDir' in branch )){
            branch.spiralDir = (rand()<.5) ? -1 : 1
        }
        if(!( 'curliness' in branch )){
            branch.curliness = randRange(.5,1)
        }
            
        // continue in spiral
        var turn = branch.spiralDir * this.randTurn(branch)
        
        var s = new Segment( branch.end, 
                    branch.end.add( vp(branch.angle+turn,global.segLen) ),
                    branch.depth+1, branch.chunkIds)
        s.spiralDepth = branch.spiralDepth
        s.spiralDir = branch.spiralDir
        s.curliness = branch.curliness
        
        
        var result = [s]
            
            
            
        // possible spawn a new branch spiraling the opposite direction
        var spawn = rand() < .3
        
        if( spawn ){
            
            turn = -branch.spiralDir * this.randTurn(branch)
            s = new Segment( branch.end, 
                        branch.end.add( vp(branch.angle+turn,global.segLen) ),
                        branch.depth+1, branch.chunkIds)
            s.spiralDepth = Math.min( 20, branch.spiralDepth+1 )
            s.spiralDir = -branch.spiralDir
            s.curliness = branch.curliness
            s.forceAdd = true // override intersection check
            result.push(s)
        }
        
        return result
    }
    
    randTurn(branch){ 
        return branch.curliness * 3e-3 * randRange(.2,1) * (.03*branch.depth) * (branch.spiralDepth+3)
    }
}

// provides function getNextWarp()

var allTrees = [
    new DoodleTree(),
]

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
    backgroundColor: '#CCC',
    
    // total time elapsed in milliseconds
    t: 0,
    
    
    // growth animation delay (ms)
    growthDelay: 5,
    maxGrowthIterations: 200000,
    
    //
    segLen: .002,
    chunkWidth: .004,
    segMargin: .002,
    
    //
    segsToDraw: null,
    iterationsDrawn: 0,
    autoResetCountdown: 0,
    autoResetDelay: 8000,
    
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

    
    var tree = new DoodleTree()
    var n = Math.min( global.maxGrowthIterations,
            Math.floor( global.t / global.growthDelay ) )
            
    g.strokeStyle = 'black'
    g.lineWidth = .001
    g.beginPath()
    for( var i = global.iterationsDrawn ; i < n ; i++ ){
        global.segsToDraw = global.segsToDraw.filter( s => tryAddSegment(s) )
        global.segsToDraw.forEach( s => s.draw(g) )
        global.segsToDraw = global.segsToDraw.flatMap(s => tree.grow(s))
    }
    g.stroke()
    
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
        
    
    var startr = [.1,.3]
    var stepr = [.2,.5]
    
    global.segsToDraw = []
    var distFromEdge = .01
    var x = randRange(...startr)
    var y = 1-distFromEdge
    while( x < .8 ){
        global.segsToDraw.push(new Segment( v(x,y), v(x+1e-7,y-global.segLen) ))
        x += randRange(...stepr)
    }
    
    var x = randRange(...startr)
    var y = distFromEdge
    while( x < .8 ){
        global.segsToDraw.push(new Segment( v(x,y), v(x+1e-7,y+global.segLen) ))
        x += randRange(.1,.2)
    }
    
    var y = randRange(...startr)
    var x = 1-distFromEdge
    while( y < .8 ){
        global.segsToDraw.push(new Segment( v(x,y), v(x-global.segLen,y+1e-7) ))
        y += randRange(...stepr)
    }
    
    var y = randRange(...startr)
    var x = distFromEdge
    while( y < .8 ){
        global.segsToDraw.push(new Segment( v(x,y), v(x+global.segLen,y+1e-7) ))
        y += randRange(...stepr)
    }
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
    global.ctx.fillStyle = global.backgroundColor
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


