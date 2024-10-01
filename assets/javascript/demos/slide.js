
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


class Move {
    constructor( vertical, duration, offsets ){
        this.vertical = vertical
        this.duration = duration
        this.offsets = offsets
        this.t = 0
    }
    
    norm(i){
        if( i<0 ) return global.gridSize+i
        if( i>=global.gridSize ) return i-global.gridSize
        return i
    }
    
    init(){
        var allGroups = {}
        global.grid.forEach(tile =>{
            var i = Math.floor(this.vertical ? tile.ix : tile.iy) // index of group
            if(!( i in allGroups )){
                allGroups[i] = []
            }
            var o = Math.floor(this.vertical ? tile.iy : tile.ix) // starting position within group
            var fo = this.norm(o+this.offsets[i]) // ending position within group
            allGroups[i].push([tile,fo]) // remember [tile, end position]
        })
        
        this.tileGroups = allGroups
        this.t = 0
    }
    
    advance(dt){
        this.t += dt
        if( this.t >= this.duration ){
            this.finish()
            return true
        }
        
        var angle = twopi*this.t/this.duration - pi
        var m = Math.cos(angle)+1
        
        for( var i in this.tileGroups ){
            var d = dt*(this.offsets[i]/this.duration)*m
            this.tileGroups[i].forEach(pair => {
                if( this.vertical ){
                    pair[0].iy = this.norm(pair[0].iy + d)
                } else {
                    pair[0].ix = this.norm(pair[0].ix + d)
                }
            })
        }
        return false
    }
    
    finish(){
        for( var i in this.tileGroups ){
            this.tileGroups[i].forEach(pair => {
                if( this.vertical ){
                    pair[0].iy = pair[1]
                } else {
                    pair[0].ix = pair[1]
                }
            })
        }
    }
}

class Grid {
    
    getVLine(ix){
        throw new Exception('not implemented')
    }
    
    getHLine(iy){
        throw new Exception('not implemented')
    }
    
    getInt( vline, hline ){
        throw new Exception('not implemented')
    }
}

class SquareGrid extends Grid{
    constructor(){
        super()
        
        var n = global.gridSize
        this.vlines = []
        for( var ix = 0 ; ix <= n ; ix++ ){
            var x = ix/n
            this.vlines.push( [v(x,0),v(x,1)] )
        }
        
        this.hlines = []
        for( var iy = 0 ; iy <= n ; iy++ ){
            var y = iy/n
            this.hlines.push( [v(0,y),v(1,y)] )
        }
    }
    
    getVLine(ix){
        var i = Math.floor(ix)
        if( i < 0 ) i=0
        if( i >= global.gridSize ) i=(global.gridSize-1)
        return la( this.vlines[i], this.vlines[i+1], (ix-i)/1 )
    }
    
    getHLine(iy){
        var i = Math.floor(iy)
        if( i < 0 ) i=0
        if( i >= global.gridSize ) i=(global.gridSize-1)
        return la( this.hlines[i], this.hlines[i+1], (iy-i)/1 )
    }
    
    getInt( vline, hline ){
        return intersection( vline, hline )
    }
}

class CircleGrid extends Grid{
    constructor(){
        super()
        
        var r = .1
        this.centerPos = global.centerPos.add( v( randRange(-r,r), randRange(-r,r) ) )
        
        var n = global.gridSize
        
        // vlines are straight spokes
        this.vlines = []
        for( var ix = 0 ; ix <= n ; ix++ ){
            var angle = twopi * ix/n
            this.vlines.push( angle )
        }
        
        // hlines are concentric circles (center,radius)
        this.hlines = []
        var maxr = global.centerPos.x*sqrt2 * 1.1
        for( var iy = 0 ; iy <= n ; iy++ ){
            var c = va( this.centerPos, global.centerPos, iy/n )
            var rad = avg(0,maxr,iy/n)
            this.hlines.push( [c,rad] )
        }
    }
    
    // vline is angle
    getVLine(ix){
        var i = Math.floor(ix)
        if( i < 0 ) i=0
        if( i >= global.gridSize ) i=(global.gridSize-1)
        return avg( this.vlines[i], this.vlines[i+1], (ix-i)/1 )
    }
    
    // hline is circle (center,rad)
    getHLine(iy){
        var i = Math.floor(iy)
        if( i < 0 ) i=0
        if( i >= global.gridSize ) i=(global.gridSize-1)
        return [
            va( this.hlines[i][0], this.hlines[i+1][0], (iy-i)/1 ),
            Math.max( 0, avg( this.hlines[i][1], this.hlines[i+1][1], (iy-i)/1 ))
        ]
    }
    
    // vline is angle
    // hline is circle (center,rad)
    getInt( hline, vline ){
        return hline[0].add( vp( vline, hline[1] ) )
    }
}

class Tile{
    constructor( ix,iy,color ){
        this.ix = ix
        this.iy = iy
        this.color = color
    }
    
    // used in _draw()
    _getVerts(gl,ix,iy){
        
        // locate 4 tangent gridlines
        var tline = gl.getHLine(iy)
        var bline = gl.getHLine(iy+1)
        var lline = gl.getVLine(ix)
        var rline = gl.getVLine(ix+1)
        
        // compute intersections
        var tr = gl.getInt(tline,rline)
        var br = gl.getInt(bline,rline)
        var bl = gl.getInt(bline,lline)
        var tl = gl.getInt(tline,lline)
        
        return [tr,br,bl,tl]
    }
    
    // used in draw()
    _draw(g,ix,iy){
        
        // compute positions of this tile's vertices
        if( global.rds <= 0 ){
            var verts = this._getVerts(global.sgridlines,ix,iy) //square grid
            
        } else if( global.rds >= 1 ){
            var verts = this._getVerts(global.cgridlines,ix,iy) //circle grid
            
        } else {
            // compute weighted average of two grid positions
            var sverts = this._getVerts(global.sgridlines,ix,iy) //square grid
            var cverts = this._getVerts(global.cgridlines,ix,iy) //circle grid
            var verts = []
            for( var i = 0 ; i < 4 ; i++ ){
                verts.push( va( sverts[i], cverts[i], global.rds ) )
            }
        }
        
        
        // fill quad formed by intersection points
        g.fillStyle = this.color
        g.strokeStyle = this.color
        g.lineWidth = .002
        g.beginPath()
        g.moveTo( ...verts[0].xy() )
        g.lineTo( ...verts[1].xy() )
        g.lineTo( ...verts[2].xy() )
        g.lineTo( ...verts[3].xy() )
        g.closePath()
        g.fill()

        // debug 
        if( global.debugTileIndices ){
            g.fillStyle = 'white'
            g.font = ".003em Arial";
            g.textAlign = "center";
            g.fillText(`${this.ix.toFixed(1)}, ${this.iy.toFixed(1)}, ${this.color}`, ...va(tr,bl).xy() );
        }
    }
    
    draw(g){
        
        var ix = this.ix
        var iy = (this.iy+global.gridyOffset) % global.gridSize
        
        
        // draw this tile
        this._draw(g,ix,iy)
        
        // if this tile is partially off-screen, 
        // draw this tile again at the opposite end of the screen
        if( (ix>(global.gridSize-1)) && (iy>(global.gridSize-1) ) ){
            this._draw(g,ix-global.gridSize,iy-global.gridSize)
        }if( ix>(global.gridSize-1) ){ 
            this._draw(g,ix-global.gridSize,iy)
        }if( iy>(global.gridSize-1) ){ 
            this._draw(g,ix,iy-global.gridSize)
        }
    }
}

var allPalettes = [
    ['#A6FF96','#F8FF95','#BC7AF9','#FFA1F5'],
    ['#EEEEEE','#64CCC5','#176B87','#053B50'],
    ['#141E46','#BB2525','#FF6969','#FFF5E0'],
    ['#FAF0E6','#B9B4C7','#5C5470','#352F44'],
    ['#FFC436','#337CCF','#1450A3','#191D88'],
    ['#F8DE22','#F94C10','#C70039','#900C3F'],
    ['#8CABFF','#4477CE','#512B81','#35155D'],
    ['#3D246C','#5C4B99','#9F91CC','#FFDBC3'],
    ['#EDE4FF','#D7BBF5','#A076F9','#6528F7'],
    ['#836096','#ED7B7B','#F0B86E','#EBE76C'],
    ['#CAEDFF','#D8B4F8','#FFC7EA','#FBF0B2'],
    ['#FF0060','#F6FA70','#00DFA2','#0079FF'],
    ['#D71313','#F0DE36','#EEEDED','#0D1282'],
    ['#2CD3E1','#A459D1','#F266AB','#FFB84C'],
    ['#06FF00','#FFE400','#FF8E00','#FF1700'],
    ['#00A1AB','#00263B','#6F0000','#FF5200'],
    ['#93D9A3','#CDF3A2','#ED8E7C','#A03C78'],
]


function getRandomPalette(){
    var result = allPalettes[Math.floor(randRange(0,allPalettes.length))]
    shuffle(result)
    return result
}

resetRand()

const global = {
    
    // graphics context
    canvas: null,
    ctx: null,

    // 
    backgroundColor: 'black',
    edgeWidth: .002,
    
    // relate screen pixels to virtual 2D units
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasScale: 0,
    centerPos: v(.5,.5),
    screenCorners: null, 
    
    // tile grid
    gridSizeRange: [12,20],
    gridSize: 15,
    sgridlines: null, // square grid shape
    cgridlines: null, // circular grid shape
    gridyOffset: 0,
    gridyOffsetSpeed: 1e-3, // tiles per ms
    grid: null, // grid index-color arrangement
    
    //
    rds: 0,
    targetRds: 0,
    rdst: 0,
    rdsTransitionDuration: 2000,
    
    //
    moveList: null,
    moveIndex: 0,
    moveDuration: 500, // ms per tile
    moveDelay: 2000, // ms between moves
    moveCountdown: 2000,
    
    // 
    autoResetCountdown: 0,
    autoResetDelay: 5000,
    
    // mouse
    canvasMousePos: v(0,0),     //pixels
    mousePos: v(0,0),           //virtual units
    
    //debug
    debugTileIndices: false,
    
}


    
    
// Render graphics
function draw(fps, t) {
    
    var ctx = global.ctx
    var canvas = global.canvas
    
    // draw background
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( -10,-10,20,20 )

    // restrict further drawing to square in center of screen
    ctx.beginPath()
    ctx.moveTo(0,0)
    ctx.lineTo(1,0)
    ctx.lineTo(1,1)
    ctx.lineTo(0,1)
    ctx.closePath()
    ctx.clip()

    if( false ){
        //debug
        // draw screen corners
        var r = .1
        ctx.fillStyle = 'red'
        global.screenCorners.forEach(c => ctx.fillRect( c.x-r, c.y-r, 2*r, 2*r ))
    }
    
    const center = global.centerPos
    

    
    // draw tiles
    global.grid.forEach(tile => tile.draw(ctx))

    // debug 
    if( false ){
        ctx.fillStyle = 'black'
        ctx.font = ".001em Arial";
        ctx.textAlign = "center";
        ctx.fillText(`${global.angleX.toFixed(2)},${global.angleY.toFixed(2)},${global.angleZ.toFixed(2)}`, .5,.5);
    }
}



function mouseDown(e){
      global.isDragging = true;
      global.prevMouseX = event.clientX;
      global.prevMouseY = event.clientY;
}

function mouseMove(e){
    
  if (!global.isDragging) return;
  
  global.autoSpin = false
  global.autoSpinCountdown = global.autoSpinDelay
      
    let dx = event.movementX;
    let dy = event.movementY;

    let scale = 1e-5
    global.avY -= dx * scale;
    global.avX += dy * scale;
}

function mouseUp(e){
    global.isDragging = false
      global.prevMouseX = null;
      global.prevMouseY = null;
}



function update(dt) {    

    // passive grid movement animation
    global.gridyOffset += dt*global.gridyOffsetSpeed
    while( global.gridyOffset > global.gridSize ){
        global.gridyOffset -= global.gridSize
    }
    if( global.moveIndex < global.moveList.length ){
        
        if( global.moveCountdown > 0 ){
            
            // delay between solution steps
            global.moveCountdown -= dt
            
        } else {
        
            // advance solving animation
            var m = global.moveList[global.moveIndex]
            if( m.advance(dt) ){
                global.moveCountdown = global.moveDelay
                global.moveIndex += 1
                
                if( global.moveIndex == 2 ){
                    // init transition to circle grid
                    global.targetRds = 1
                }
            
                var m = global.moveList[global.moveIndex]
                if(m){
                    m.init()
                } else {
                    global.autoResetCountdown = global.autoResetDelay
                    
                    // init transition to square grid
                    global.targetRds = 0
                }
            }
            
        }
    } else {
        
        // countdown to re-scramble solved grid
        global.autoResetCountdown -= dt
        if(global.autoResetCountdown <= 0){
            resetGame()
        }
    }

    // advance square/circle grid transition
    if( global.rds != global.targetRds ){
        
        var s = Math.sign( global.targetRds - global.rds )
        
        global.rdst += dt        
        var angle = twopi*global.rdst/global.rdsTransitionDuration - pi
        var m = Math.cos(angle)+1
        var d = s*m*dt/global.rdsTransitionDuration
        global.rds += d
        if( Math.sign(global.targetRds-global.rds) != s ){
            global.rds = global.targetRds 
            global.rdst = 0       
        }
    }

    // check for resized window
    fitToContainer()    
}


var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(){
    
    var cvs = global.canvas
    if( (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
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
    cvs.addEventListener("mousemove", mouseMove);
    cvs.addEventListener("mouseup", mouseUp);
    cvs.addEventListener("touchstart", mouseDown, false);
    cvs.addEventListener("touchend", mouseUp, false);
    
    // https://stackoverflow.com/a/63469884
    var previousTouch;
    cvs.addEventListener("touchmove", (e) => {
        const touch = e.touches[0];
        if (previousTouch) {
            e.movementX = touch.pageX - previousTouch.pageX;
            e.movementY = touch.pageY - previousTouch.pageY;
            mouseMove(e);
        };

        previousTouch = touch;
        e.preventDefault()
    });
    cvs.addEventListener("touchend", (e) => {
        previousTouch = null
        mouseUp(e)
    });
    
    
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    // 
    resetGame()
    
    //
    requestAnimationFrame(gameLoop);
}

function resetGame(){
    resetRand(hard = true)
    
    
    
    // init grid shape
    global.gridSize = Math.floor(randRange(...global.gridSizeRange))
    global.sgridlines = new SquareGrid()
    global.cgridlines = new CircleGrid()
    
    // init grid tiles
    global.grid = []
    for( var x = 0 ; x < global.gridSize ; x++ ){
        for( var y = 0 ; y < global.gridSize ; y++ ){
            var bx = (x<global.gridSize/2)
            var by = (y<global.gridSize/2)
            global.grid.push( new Tile(x,y,'white') )
        }
    } 
    
    // create random movement plan
    global.moveList = []
    var vert = rand() > .5
    for ( var i = 0 ; i < 6 ; i++ ){
        vert = !vert
        var offsets = []
        var mo = -global.gridSize
        for( var j = 0 ; j < global.gridSize ; j++ ){
            var o = Math.floor( randRange( -global.gridSize/2, global.gridSize/2 ) )
            if( Math.abs(o) > mo ) mo = Math.abs(o)
            offsets.push( o )
        }
        var duration = mo*global.moveDuration
        global.moveList.push(new Move(vert,duration,offsets))
    }
    
    
    // move tiles to final positions and apply colors
    var i = 0
    for( var x = 0 ; x < global.gridSize ; x++ ){
        for( var y = 0 ; y < global.gridSize ; y++ ){
            global.grid[i].ix = x
            global.grid[i].iy = y
            i += 1
        }
    }
    for( var i = 0 ; i < global.moveList.length ; i++ ){
        global.moveList[i].init()
        global.moveList[i].finish()
    }
    var p = getRandomPalette()
    global.grid.forEach(tile => {
        var bx = (tile.ix<global.gridSize/2)
        var by = (tile.iy<global.gridSize/2)
        var c = bx ? (by ? p[0] : p[1] ) : (by ? p[2] : p[3] )
        tile.color = c
    })
    
    
    // move tiles back to starting positions
    var i = 0
    for( var x = 0 ; x < global.gridSize ; x++ ){
        for( var y = 0 ; y < global.gridSize ; y++ ){
            global.grid[i].ix = x
            global.grid[i].iy = y
            i += 1
        }
    }
    
    
    global.moveList[0].init()   
    global.moveIndex = 0
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


