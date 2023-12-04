
'use strict';
let perlin = {
    rand_vect: function(){
        let theta = Math.random() * 2 * Math.PI;
        return {x: Math.cos(theta), y: Math.sin(theta)};
    },
    dot_prod_grid: function(x, y, vx, vy){
        let g_vect;
        let d_vect = {x: x - vx, y: y - vy};
        if (this.gradients[[vx,vy]]){
            g_vect = this.gradients[[vx,vy]];
        } else {
            g_vect = this.rand_vect();
            this.gradients[[vx, vy]] = g_vect;
        }
        return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
    },
    smootherstep: function(x){
        return 6*x**5 - 15*x**4 + 10*x**3;
    },
    interp: function(x, a, b){
        return a + this.smootherstep(x) * (b-a);
    },
    seed: function(){
        this.gradients = {};
        this.memory = {};
    },
    get: function(x, y) {
        if (this.memory.hasOwnProperty([x,y]))
            return this.memory[[x,y]];
        let xf = Math.floor(x);
        let yf = Math.floor(y);
        //interpolate
        let tl = this.dot_prod_grid(x, y, xf,   yf);
        let tr = this.dot_prod_grid(x, y, xf+1, yf);
        let bl = this.dot_prod_grid(x, y, xf,   yf+1);
        let br = this.dot_prod_grid(x, y, xf+1, yf+1);
        let xt = this.interp(x-xf, tl, tr);
        let xb = this.interp(x-xf, bl, br);
        let v = this.interp(y-yf, xt, xb);
        this.memory[[x,y]] = v;
        return v;
    }
}
perlin.seed();


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


    
    
// project map coords to isometric view
function get2DCoords(x,y,z=null){
    
    if(z==null){
        let s = 2
        z = 10*perlin.get(x*s,y*s)
    }
    
    return v(x,y-z*global.perlinMagnitude)
}
    
    
// shorthands
var pi = Math.PI
var pio2 = Math.PI/2
var twopi = 2*Math.PI
let phi = 1.618033988749894
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


resetRand()

const global = {
    
    // total time elapsed in milliseconds
    t: 0,
    
    // graphics context
    canvas: null,
    ctx: null,

    // 
    backgroundColor: 'rgb(200,200,255)',
    grassColor: '#3A3',
    dirtColor: '#973',
    
    // relate screen pixels to virtual 2D units
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasScale: 0,

    

    // 
    perlinMagnitude: 3e-2,
    perlinScale: 2,
    
    // array of height values for terrain shape
    elevationDetail: 40, // blades per screen length
    groundY: null,
    grassRadius: .003,
    pollenRadius: .005,
    
    // animation position
    targetWindSpeed: 0,
    windSpeed: 0, 
    pollenX: 0,
    
    // mouse
    canvasMousePos: v(0,0),     //pixels
    mousePos: v(0,0),           //virtual units
    
    //
    autoWindCountdown: 0, //ms
    autoWindDelay: [3000,7000], //ms
    autoResetCountdown: 30000, //ms
    autoResetDelay: 30000, //ms
}


    
    
// Render graphics
function draw(fps, t) {
    var ctx = global.ctx
    var g = ctx
    var canvas = global.canvas
    let n = global.elevationDetail
    
    // approx grass patch location
    let x0 = global.screenCorners[0].x
    let x1 = global.screenCorners[2].x
    let y0 = global.screenCorners[0].y
    let y1 = global.screenCorners[2].y
    let dy = y1-y0
    y0 += .5*dy
    y1 += .1*dy
            
    // draw background
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( global.screenCorners[0].x, global.screenCorners[0].y, 2, 2 )
    
    // draw ground
    let groundY = null
    if(!global.groundY){
        groundY = []
    } else {
        ctx.fillStyle = global.dirtColor
        let i=0, w = 1.2/n
        for( let x=x0 ; x<x1 ; x+=(1.0/n) ){
            ctx.fillRect( x, global.groundY[i++], w, 2 )
        }
    }

    // draw grass
    let d = .0005
    let specs = [
        [global.grassColor,v(d,d)],
        //['#3A3',v(0,0)],
        //['#6F6',v(-d,-d)],
    ]
    
    
    if( true ){
        specs.forEach(row => {
            resetRand()
            ctx.fillStyle = row[0]
            let maxOff = global.grassRadius
             
            for( let x=x0 ; x<x1 ; x+=(1.0/n) ){
                let ox = 0
                for( let y=y0 ; y<y1 ; y+=(1.0/n) ){
                    ox = (ox + phi/n) % (1.0/n)
                    let p = get2DCoords( x + ox, y )//.add( v(randRange(-maxOff,maxOff),0) )
                    
                    // prepare to draw ground extending below top row of grass
                    if( (global.groundY == null) && (y == y0) ){
                        groundY.push(p.y)
                    }
                    
                    
                    //
                    drawGrassBlade(ctx,p.add(row[1]))
                    
                    // rolling effect near horizon
                    let r = (y-y0)/(y1-y0)
                    y -= Math.max(0,1.7*(.5-r)/n)
                }
            }
        })
    }
    if(!global.groundY){
        global.groundY = groundY
    } 
    
    
    // draw pollen
    ctx.fillStyle = 'rgba(255,255,255,.1)'
    n = 10000
    let r = global.pollenRadius
    for( let i = 0 ; i < n ; i++ ){
        let dist = rand()
        let fallSpeed = 1e-6/(dist+.5)
        let maxy = .75-dist/2
        let x = x0 + (x1-x0)*nnmod(rand()+5e-5*global.pollenX,1)
        let y = nnmod((rand()+global.t*fallSpeed),maxy)
        ctx.fillRect( x-r,y-r,2*r,2*r )
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

}

function drawGrassBlade(ctx,p){
    
    
    
    let r = global.grassRadius
    let n = 4
    let s = 0, ds = .001
    let ao = randRange(0,twopi)
    let period = randRange(30,30)
    let lo_mf = -global.windSpeed*.6
    let hi_mf = global.windSpeed*.6
    let wf = Math.sin(ao+global.pollenX/twopi/period)
    wf = lo_mf + (hi_mf-lo_mf)*((wf/2)+1)
    for( let i = 0 ; i<n ; i++ ){
        ctx.fillRect( p.x-r, p.y-r, 2*r, 2*r )
        s += randRange(0,ds)
        let dx = s*wf
        p = p.add(v(dx,-1.8*r + .5*Math.abs(dx) ))
    }
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
        (global.canvasMousePos.x-global.canvasOffsetX)/global.canvasScale, 
        (global.canvasMousePos.y-global.canvasOffsetY)/global.canvasScale
    )
    
    // adjust target wind speed based on mouse X
    global.targetWindSpeed = (global.mousePos.x - .5)*2
    global.autoWindCountdown = global.autoWindDelay
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
    
    // sometimes randomly adjust target wind speed
    if( global.autoWindCountdown <= 0 ){
        global.targetWindSpeed = -1+Math.random()*2
        if( Math.random() > .5 ){
            global.targetWindSpeed = Math.sign(global.targetWindSpeed)
        }
        global.autoWindCountdown = global.autoWindDelay[0] + Math.random()*( global.autoWindDelay[1]- global.autoWindDelay[0])
    } else {
        global.autoWindCountdown -= dt
    }
    
    // sometimes reset completely
    if( global.autoResetCountdown <= 0 ){
        
        global.groundY = null
        resetRand(true)
        perlin.seed()
        
        global.autoResetCountdown = global.autoResetDelay
    } else {
        global.autoResetCountdown -= dt
    }
    
    // adjust wind speed based on target wind speed position
    let minWindSpeed = .2
    if( Math.abs(global.targetWindSpeed) < minWindSpeed ){
        let sgn = Math.sign(global.targetWindSpeed)
        if(sgn == 0) sgn = 1
        global.targetWindSpeed = sgn*minWindSpeed
    }
    let d = 1e-3*dt
    if( Math.abs(global.windSpeed-global.targetWindSpeed) > 2*d ){
        global.windSpeed -= d*Math.sign(global.windSpeed-global.targetWindSpeed)
    }
        
    
    // advance pollen x-axis animation
    global.pollenX += global.windSpeed*dt
}




var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(){
    
    var cvs = global.canvas
    if( (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
      cvs.width  = cvs.offsetWidth;
      cvs.height = cvs.offsetHeight;
      lastCanvasOffsetWidth = cvs.offsetWidth
      lastCanvasOffsetHeight = cvs.offsetHeight
      
        var dimension = avg(cvs.width, cvs.height)
        global.canvasScale = dimension;
        global.canvasOffsetX = (cvs.width - dimension) / 2;
        global.canvasOffsetY = (cvs.height - dimension) / 2;
    global.ctx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);
        
        var xr = -global.canvasOffsetX / dimension
        var yr = -global.canvasOffsetY / dimension
        global.screenCorners = [v(xr,yr),v(1-xr,yr),v(1-xr,1-yr),v(xr,1-yr)]
        
        global.groundY = null
    }
}



// Initialize the game
function init() {
    var cvs = document.getElementById("gameCanvas");
      cvs.style.width='100%';
      cvs.style.height='100%';  
    cvs.addEventListener("mousemove", mouseMove);
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


