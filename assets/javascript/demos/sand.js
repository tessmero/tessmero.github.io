
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

var rngSeed = null;
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

function randomSeed(){
    return cyrb128(randomString(10))
}

function resetRand(hard=false){
    if( hard || (rngSeed==null) ){
        rngSeed = randomSeed()
    }
    rand = sfc32(rngSeed[0], rngSeed[1], rngSeed[2], rngSeed[3])
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


// one vertical slice of sand resting at the bottom of the screen
class Stack {
    
    // init empty stack at given x-position
    constructor(x){
        this.x = x
        this.colors = new Array(global.stackHeight).fill(null) 
        this.height = 0
    }
    
    // add one particle to top of stack
    push(color){        
        if(!color) return
        if(this.height >= global.stackHeight) return
        this.colors[this.height] = color
        this.height += 1
    }
    
    // remove particle from top of stack
    // return the removed particle's color
    pop(){
        if( this.height <= 0 ) return
        var i = this.height - 1
        var result = this.colors[i]
        this.colors[i] = null
        this.height -= 1
        return result
    }
    
    // remove all particles
    clear(){
        this.colors.fill(null)
        this.height = 0
    }
    
    // draw single block in this stack
    // used only for drawing front layer
    drawSingle(g,i,color){
        if( this.colors[i] != color ) return
        var x = this.x
        var r = global.particleRadius
        var y = 1-i*global.ish
        g.fillRect( x-r, y-r, r, r )
    }
    
    // fill particles in this stack matching the given color
    // used only for drawing back layer
    draw(g,color){
        var x = this.x
        var r = global.particleRadius
        
        // slow draw
        if( false ){
            for( var i = 0 ; i < this.height ; i++ ){
                if( this.colors[i] != color ) continue
                var y = 1-i*global.ish
                g.fillRect( x-r, y-r, r, r )
            }
        }
        
        //fast draw
        if( true ){
            var startedRect = false
            var span = global.ish+2e-3 
            var y = 0
            for( var i = global.snowAccIndex ; i < this.height ; i++ ){
                if( startedRect ){
                    if( this.colors[i] == color ){
                        
                        //expand rect
                        y = 1-i*global.ish
                        span += global.ish
                        
                    } else {
                        
                        //finish rect
                        g.fillRect( x-r, y-r, r, span)
                        startedRect = false
                        
                    }
                } else if(this.colors[i]==color)  {
                    
                    //start rect
                    y = 1-i/global.stackHeight
                    startedRect = true
                    span = global.ish+2e-3 
                    
                }
            }
            
            if( startedRect ){
                    
                //finish last rect
                g.fillRect( x-r, y-r, r, span)
                startedRect = false
                
            }
        }
    }
}


// allow sand to flow downhill one tick
function sandFlow(){
    
    var n = global.stacks.length - 1
    for( var i = 0 ; i < n ; i++ ){
        var slide = false
        while( (global.stacks[i].height-global.stacks[i+1].height)>global.sandFlowThreshold ){
            
            // move one particle to the right
            global.stacks[i+1].push( global.stacks[i].pop() )
            slide = true
        }
        if( slide ) i += 1
    }
    
    for( var i = n ; i > 0 ; i-- ){
        var slide = false
        while( (global.stacks[i].height-global.stacks[i-1].height)>global.sandFlowThreshold ){
            
            // move one particle to the left
            global.stacks[i-1].push( global.stacks[i].pop() )
            slide = true
        }
        if( slide ) i -= 1
    }
}

var allPalettes = [
    ['#ECF2FF','#95BDFF','#B4E4FF','#DFFFD8'],
    ['#FFFAD7','#FCDDB0','#FF9F9F','#E97777'],
    ['#FFE6F7','#FFABE1','#C689C6','#937DC2'],
    ['#EEF1FF','#D2DAFF','#AAC4FF','#B1B2FF'],
]

function getRandomColor(palette=null){
    if( !palette ) palette = allPalettes[Math.floor(randRange(0,allPalettes.length))]
    return palette[Math.floor(randRange(0,palette.length))]
}

function getRandomPalette(){
    return [...allPalettes[Math.floor(randRange(0,allPalettes.length))]]
}

class Word{
    
    constructor(s,pos,color){
        this.s = s
        this.pos = pos
        this.vel = v(0,this.randSpeed())
        this.color = color
        
        this.d = v(0,0)
    }
    
    randSpeed(){
        var r = global.wordFallSpeed
        return r[0] + Math.random() * (r[1]-r[0])
    }
    
    update(dt){
        this.d = this.vel.mul(dt)
        this.pos = this.pos.add(this.d)
        
        return (this.pos.y < global.snowAccHeight)
    }
    
    draw(g){
        g.fillStyle = this.color
        
        var r = global.particleRadius
        
        for( var i = 0 ; i < this.s.length ; i++ ){
            var layout = charLayouts[this.s[i]]
            for( var cx = 0 ; cx < charWidth ; cx++ ){
                var x = this.pos.x + global.wordLetterDx*i + global.letterParticleDx*cx
                for( var cy = 0 ; cy < charHeight ; cy++ ){
                    if( layout[cy][cx] != ' ' ){
                        var y = this.pos.y + global.letterParticleDx*cy
                        g.fillRect( x-r, y-r, r, r )
        
                        //ctx.fillRect( x-r, y1-r, r, r )
                        // check if landed on top of stack
                        var y1 = y
                        var y0 = y - this.d.y
                        var si = Math.floor( x*global.nStacks )
                        if( (si<0) || (si>=global.nStacks) ){
                            continue
                        }
                        var stack = global.stacks[si]
                        var sy = 1-(stack.height/global.stackHeight)
                        if( (sy > y0) && (sy <= y1) ) stack.push(this.color)
            
                    }
                }
            }
        }
    }
}

var charWidth = 5
var charHeight = 5

var charLayouts = {
    
    'A': [
        ' ### ',
        '#   #',
        '#####',
        '#   #',
        '#   #'
    ],
    
    'B': [
        '#### ',
        '#   #',
        '#### ',
        '#   #',
        '#### '
    ],
    
    'C': [
        ' hhh ',
        'h   h',
        'h    ',
        'h   h',
        ' hhh '
    ],
    
    'D': [
        'wwww ',
        'w   w',
        'w   w',
        'w   w',
        'wwww '
    ],
    
    'E': [
        'wwwww',
        'w    ',
        'wwwww',
        'w    ',
        'wwwww'
    ],
    
    'F': [
        'wwwww',
        'w    ',
        'wwwww',
        'w    ',
        'w    '
    ],
    
    'G': [
        ' www ',
        'w    ',
        'w  ww',
        'w   w',
        ' www '
    ],
    
    'H': [
        'w   w',
        'w   w',
        'wwwww',
        'w   w',
        'w   w'
    ],
    
    'I': [
        'wwwww',
        '  w  ',
        '  w  ',
        '  w  ',
        'wwwww'
    ],
    
    'J': [
        'wwwww',
        '  w  ',
        '  w  ',
        'w w  ',
        ' w   '
    ],
    
    'K': [
        'w   w',
        'w  w ',
        'www  ',
        'w  w ',
        'w   w'
    ],
    
    'L': [
        'w    ',
        'w    ',
        'w    ',
        'w    ',
        'wwwww'
    ],
    
    'M': [
        'w   w',
        'ww ww',
        'w w w',
        'w   w',
        'w   w'
    ],
    
    'N': [
        'w   w',
        'ww  w',
        'w w w',
        'w  ww',
        'w   w'
    ],
    
    'O': [
        ' www ',
        'w   w',
        'w   w',
        'w   w',
        ' www '
    ],
    
    'P': [
        'wwww ',
        'w   w',
        'wwww ',
        'w    ',
        'w    '
    ],
    
    'Q': [
        ' www ',
        'w   w',
        'w   w',
        ' www ',
        '   ww'
    ],
    
    'R': [
        'wwww ',
        'w   w',
        'wwww ',
        'w  w ',
        'w   w'
    ],
    
    'S': [
        'wwwww',
        'w    ',
        'wwwww',
        '    w',
        'wwwww'
    ],
    
    'T': [
        'wwwww',
        '  w  ',
        '  w  ',
        '  w  ',
        '  w  '
    ],
    
    'U': [
        'w   w',
        'w   w',
        'w   w',
        'w   w',
        ' www '
    ],
    
    'V': [
        'w   w',
        'w   w',
        'w   w',
        ' w w ',
        '  w  '
    ],
    
    'W': [
        'w   w',
        'w w w',
        'w w w',
        'w w w',
        ' w w '
    ],
    
    'X': [
        'w   w',
        ' w w ',
        '  w  ',
        ' w w ',
        'w   w'
    ],
    
    'Y': [
        'w   w',
        ' w w ',
        '  w  ',
        '  w  ',
        '  w  '
    ],
    
    'Z': [
        'wwwww',
        '   w ',
        '  w  ',
        ' w   ',
        'wwwww'
    ],
}

resetRand()

const global = {
    
    // time elapsed
    t: 0,
    dt: 0,
    
    // graphics context
    backCanvas: null,
    backCtx: null,
    frontCanvas: null,
    frontCtx: null,

    // colors
    backgroundColor: 'black',
    snowColor: '#FAF3F0',
    colorPalette: null, // populated in setup.js
    
    // relate screen pixels to virtual 2D units
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasScale: 0,
    centerPos: v(.5,.5),
    screenCorners: null, 
    
    // particles
    particleRadius: 1/200+2e-3,
    nSnowParticles: 2e3, // max visible falling snow particles
    snowFallSpeed: 1e-4, // distance units per ms
    snowSeed: null, // rng seed for falling snow particle positions
    snowAccIndex:200, // current lowest stack height
    frontLayerIndex:0, // height where front layer transitions to back layer
    snowAccHeight: 0, // current lowest stack y-value
    
    //words
    wordFallSpeed: [1e-4,3e-4],
    wordLetterDx: 4e-2,
    letterParticleDx: 1/200+2e-3,
    allWords: [], // list of word Instances
    
    // stacks 
    nStacks: 200,
    stackHeight: 200, // number of particles in max-height stack
    ish: 1/200, // reciprocal of stackHeight for faster math
    sandFlowThreshold: 1, // minimum height difference for particles to flow between stacks
    stacks: null, // list of Stack instances, populated in setup.js
    
    // 
    autoResetCountdown: 0,
    autoResetDelay: 5000,
    
    // mouse
    canvasMousePos: v(0,0),     //pixels
    mousePos: v(0,0),           //virtual units
    
    //debug
    
}


    
    
// Render graphics
function draw(fps) {
    
    var ctx = global.backCtx
    
    // draw background
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( -10,-10,20,20 )

    //debug
    if( false ){
        // draw screen corners
        var r = .1
        ctx.fillStyle = 'red'
        global.screenCorners.forEach(c => ctx.fillRect( c.x-r, c.y-r, 2*r, 2*r ))
    }
    
    
    // draw falling snow particles
    ctx.fillStyle = global.snowColor
    var r = global.particleRadius
    rngSeed = global.snowSeed
    resetRand()
    var dy = global.snowFallSpeed * global.t
    var ddy = global.snowFallSpeed * global.dt
    for( var i = 0 ; i < global.nSnowParticles ; i++ ){
        var x = rand()
        var y = rand()
        var y0 = nnmod( y + dy, 1 )
        if( y0 > global.snowAccHeight ) continue
        var y1 = y0+ddy
        ctx.fillRect( x-r, y1-r, r, r )
        
        
        // check if landed on top of stack
        var stack = global.stacks[Math.floor( x*global.nStacks )]
        var sy = 1-(stack.height/global.stackHeight)
        if( (sy > y0) && (sy <= y1) ) stack.push(global.snowColor)
    }

    // draw words
    global.allWords.forEach(w => w.draw(ctx))

    
    // draw stacks
    var stackWidth = 1/global.nStacks
    global.colorPalette.forEach( c => {
        ctx.fillStyle = c
        global.stacks.forEach(s => s.draw(ctx,c))
    })
    
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

    // advance falling particles
    global.dt = dt
    global.t += dt
    
    // advance falling words
    global.allWords = global.allWords.filter(word => word.update(dt))
    
    // spawn words
    r = .02*global.dt
    spawnWords( r, 30000, 0, global.colorPalette[1], 'A' )
    spawnWords( r, 50000, pi, global.colorPalette[2], 'B' )
    spawnWords( r, 20000, pio2, global.colorPalette[3], 'C' )
    
    // allow stacked particles to flow downhill
    sandFlow()
    
    // update lowest stack height
    var sah = global.stackHeight
    global.stacks.forEach( s => {
        if( s.height < sah ) sah = s.height
    })
    global.snowAccIndex = sah
    global.snowAccHeight = (1.0-sah/global.stackHeight)
    while( global.frontLayerIndex < global.snowAccIndex ){
        global.colorPalette.forEach( c => {
            global.frontCtx.fillStyle = c
            global.stacks.forEach( s => s.drawSingle( global.frontCtx, global.frontLayerIndex, c ))
        })
        global.frontLayerIndex += 1
    }
    

    // check for resized window
    //fitToContainer()    
    
    if( false ){
        // countdown to automatically reset
        global.autoResetCountdown -= dt
        if(global.autoResetCountdown <= 0){
            resetGame()
        }
    }
}

function spawnWords( r, p,ao,color,s ){
    
    if( Math.random()<r){
        var x = .9*(Math.sin(global.t/(p/twopi)+ao) + 1) / 2
        global.allWords.push( new Word(s,v(x+Math.random()*.1,-.1),color) )
    }
}


var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(){
    
    var cvs = global.backCanvas
    if( (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
      global.backCanvas.width  = cvs.offsetWidth;
      global.backCanvas.height = cvs.offsetHeight;
      global.frontCanvas.width  = cvs.offsetWidth;
      global.frontCanvas.height = cvs.offsetHeight;
      lastCanvasOffsetWidth = cvs.offsetWidth
      lastCanvasOffsetHeight = cvs.offsetHeight
      
        var padding = 0; // Padding around the square region
        var dimension = Math.min(cvs.width, cvs.height) - padding * 2;
        global.canvasScale = dimension;
        global.canvasOffsetX = (cvs.width - dimension) / 2;
        global.canvasOffsetY = (cvs.height - dimension) / 2;
    global.backCtx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);
    global.frontCtx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);
        
        var xr = -global.canvasOffsetX / global.canvasScale
        var yr = -global.canvasOffsetY / global.canvasScale
        global.screenCorners = [v(xr,yr),v(1-xr,yr),v(1-xr,1-yr),v(xr,1-yr)]
        //resetGame()
        
            
        var both = [global.frontCtx,global.backCtx]
        both.forEach(ctx => {
            
            // restrict further drawing to square in center of screen
            ctx.beginPath()
            ctx.moveTo(0,0)
            ctx.lineTo(1,0)
            ctx.lineTo(1,1)
            ctx.lineTo(0,1)
            ctx.closePath()
            ctx.clip()
        })
        
    }
}



// Initialize the game
function init() {
    
    // init back layer 
    var cvs = document.getElementById("backLayer");
      cvs.style.width='100%';
      cvs.style.height='100%';  
      cvs.lineWidth = 0;
    //cvs.addEventListener("mousedown", mouseDown);
    //cvs.addEventListener("mousemove", mouseMove);
    //cvs.addEventListener("mouseup", mouseUp);
    //cvs.addEventListener("touchstart", mouseDown, false);
    //cvs.addEventListener("touchend", mouseUp, false);
    global.backCanvas = cvs
    global.backCtx = cvs.getContext("2d");
    global.backCtx.lineWidth = 0
    
    // init front layer 
    var cvs = document.getElementById("frontLayer");
      cvs.style.width='100%';
      cvs.style.height='100%';  
    cvs.addEventListener("mousedown", mouseDown);
    cvs.addEventListener("mousemove", mouseMove);
    cvs.addEventListener("mouseup", mouseUp);
    cvs.addEventListener("touchstart", mouseDown, false);
    cvs.addEventListener("touchend", mouseUp, false);
    global.frontCanvas = cvs
    global.frontCtx = cvs.getContext("2d");
    global.frontCtx.lineWidth = 0
    
    // init stacks
    global.stacks = new Array(global.nStacks+1).fill(null) 
    for( var i = 0 ; i < global.nStacks+1 ; i++ ){
        var x = i/global.nStacks
        global.stacks[i] = new Stack(x)
    }
    
    // 
    requestAnimationFrame(function(){
        fitToContainer()    
        resetGame()
        gameLoop()
    });
}

function resetGame(){
    
    // reset RNG
    resetRand(hard = true)
    global.snowSeed = randomSeed()
    
    // reset color pallete
    global.colorPalette = getRandomPalette()
    global.snowColor = global.colorPalette[0]
    
    // clear words
    global.allWords = []
    
    // clear stacks
    global.snowAccHeight = 0
    global.stacks.forEach(s => s.clear())
    global.frontCtx.clearRect(-10000,-10000,30000,30000)
    
    // set automatic reset timer
    global.autoResetCountdown = global.autoResetDelay
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


