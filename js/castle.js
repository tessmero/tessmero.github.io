
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



/** 
 * 
 * 
 * 
 */
class BlockGrid {
    
    constructor(){
        var n = global.gridWidth * global.gridHeight; 
        
        // tile properties
        this.heights = new Array(n).fill(0) // precise z
        this.blockedByConstruction = new Array(n).fill(false) 
        this.underConstruction = new Array(n).fill(false) 
        
        // set ground height with perlin noise
        if( true ){
            var i = 0
            for( var x=0 ; x < global.gridWidth ; x++ ){
                for( var y=0 ; y < global.gridHeight ; y++ ){
                    var h = .5+perlin.get(x/10,y/10)
                    if( h > .9 ) h = .9
                    if( h < .01 ) h = .01
                    this.heights[i++] = h
                }
            }
        }
        
        this.pathIndices = new Array(n)
        this.computePathIndices()
        
        // edges extending down to off-screen
        this.sideFaceEdge = global.blockUnits.z.mul(-50)
        
        // queue of blocks to be built at the start of the next update
        this.requestedBlockPlacements = []
    }
    
    //get internal array index for block
    getI(x,y){
        return y*global.gridWidth + x;
    }
    
    //populate blockedByConstruction member with bools
    computeBlockedByConstruction(){
        this.blockedByConstruction.fill(false)
        
        global.allBuildTasks.forEach( bt => {
            bt.path.blockCoords.forEach(xy => {
                var i = this.getI(...xy)
                this.blockedByConstruction[i] = true
            })
        })
    }
    
    // populate pathIndices member with integers
    computePathIndices(){
        this.pathIndices.fill(-1)
        
        var x = global.spawnPos[0]
        var y = global.spawnPos[1]
        var pathIndex = 0
        var i = this.getI(x,y)
        this.pathIndices[i] = pathIndex
        var h = this.heights[i]
        var propCoords = [[x,y,h]]
    
        while( propCoords.length > 0 ){
            pathIndex += 1
            var newCoords = []
            propCoords.forEach( xyh => {
                global.allDirections.forEach(d => {
                    var x1 = xyh[0]+d[0]
                    var y1 = xyh[1]+d[1]
                    if( (x1<0) || (x1>=global.gridWidth) || (y1<0) || (y1>=global.gridHeight) ){
                        return
                    }
                    var i1 = this.getI(x1,y1)
                    var h1 = this.heights[i1]
                    if( (this.pathIndices[i1] != -1) || (Math.abs(h1-xyh[2])>1) ){
                        return
                    }
                    this.pathIndices[i1] = pathIndex 
                    
                    //penalize jumps
                    var adh = Math.abs(h1-xyh[2])
                    if( adh > .5 ){
                        this.pathIndices[i] += 1e-4*adh
                    }
                    
                    newCoords.push([x1,y1,h1])
                })
            })
            propCoords = newCoords
        }
    }
    
    // get path from given tile to pathIndex 0 tile
    getPath(x,y){
        var result = []
        var i
        while( true ){
            i = this.getI(x,y)
            var pi = this.pathIndices[i]
            var z =  this.getHeightForPathfinding(i)
            result.push( [x,y,this.heights[i]] )
            
            // check if path is complete
            if((x==global.spawnPos[0]) && (y==global.spawnPos[1])){
                break
            }
            
            // check neightboring path indices
            var minNpi = 1e4
            var bestX,bestY
            global.allDirections.forEach(d => {
                var nx = x+d[0]
                var ny = y+d[1]
                if( (nx<0) || (nx>=global.gridWidth) || (ny<0) || (ny>=global.gridHeight) ){
                    return
                }
                var ni = this.getI(nx,ny)
                var nz = this.getHeightForPathfinding(ni)
                
                var npi = this.pathIndices[ni]
                if( npi == -1 ){
                    return
                }
                if( Math.abs(nz-z) > 1 ){
                    return
                }
                if( (npi < minNpi) || ((npi == minNpi) && Math.random()<.5) ){
                    
                    minNpi = npi
                    bestX = nx
                    bestY = ny
                }
            })
            x = bestX
            y = bestY
            
            
        }
            
        // return two-way path
        var rev = [...result].reverse()
        return new Path(rev.concat(result))
    }
    
    // get tile height for purposes of pathfinding
    getHeightForPathfinding(i){
        var h = this.heights[i]
        if( h%1==0 ){
            return h
        }
        return 0
    }
    
    // project world coords to isometric 2d view
    // based on (0,0,0) 1x1x1 block edges 
    // defined in global.js
    get2DCoords(x,y,z=null){
        
        if(z==null){
            z = this.heights[this.getI(x,y)]
        }
        
        return global.blockOrigin
            .add(global.blockUnits.x.mul(x))
            .add(global.blockUnits.y.mul(y))
            .add(global.blockUnits.z.mul(z))
    }
    
    // request z coordinate to be increased to nearest integer
    // called in build_task.js
    requestBlockPlacement(x,y){
        this.requestedBlockPlacements.push([x,y])
    }
    
    // called once per update
    processBlockPlacements(){
        var placedAny = false
        while( this.requestedBlockPlacements.length > 0 ){
            var xy = this.requestedBlockPlacements.pop()
            var i = this.getI(...xy)
            var z = this.heights[i]
            if( z%1==0 ){
                z++
            } else {
                z = Math.ceil(z)
            }
            this.heights[i] = z
            placedAny = true
        }
        if( placedAny ) this.computePathIndices()
    }
    
    draw(g){
        for( var x=global.gridWidth-1 ; x>=0 ; x-- ){
            for( var y=global.gridHeight-1 ; y>=0 ; y-- ){
                var i = this.getI(x,y)
                var z = this.heights[i]
                var c = this.underConstruction[i]
                this.drawBlock(g,x,y,z,(!c) && (z!=Math.floor(z)))
                if( c ){
                    var d = global.blockUnits.z.mul(Math.floor(z)-z)
                    this.drawBlock(g,x,y,z,false,d,true)
                }
            }
        }
    }
    
    // used in draw() above
    drawBlock(g,x,y,z,isDirt,depth=null,underConstruction=false){
        if( depth == null ){
            depth = this.sideFaceEdge
        }
        
        var a = this.get2DCoords(x,y,z)
        var b = a.add(global.blockUnits.x)
        var c = b.add(global.blockUnits.y)
        var d = a.add(global.blockUnits.y)
        
        // dirt
        var topColor = '#7ec850'
        var leftColor = '#9b7653'
        var rightColor = '#9b7653'
        
        if( underConstruction ){
            
            // block under construction
            topColor = '#AAA'
            leftColor = '#666'
            rightColor = '#888'
            
        } else if( !isDirt ){
            
            // built block
            topColor = '#DDD'
            leftColor = '#AAA'
            rightColor = '#CCC'
        }
        
        var edgeColor = null//'black'
        
        // draw top of block
        this.drawQuad(g,a,b,c,d,topColor,edgeColor)
        
        // draw visible left face of block
        this.drawQuad(g,a,d,d.add(depth),a.add(depth),leftColor,edgeColor)
        
        // draw visible right face of block
        this.drawQuad(g,a,b,b.add(depth),a.add(depth),rightColor,edgeColor)
        
        if( global.debugBlockCoords ){
            g.fillStyle = 'black'
            g.font = ".001em Arial";
            g.textAlign = "center";
            g.fillText(`${x},${y},${z.toFixed(1)}`, a.x, a.y-.01);
        }
        
        if( global.debugPathIndices ){
            var pathIndex = this.pathIndices[this.getI(x,y)]
            g.fillStyle = 'black'
            g.font = ".001em Arial";
            g.textAlign = "center";
            g.fillText(pathIndex.toFixed(0), a.x, a.y-.005);
        }
    }
    
    drawQuad(g,a,b,c,d,fillStyle,strokeStyle=null){
        g.fillStyle = fillStyle
        g.beginPath()
        g.moveTo( a.x, a.y )
        g.lineTo( b.x, b.y )
        g.lineTo( c.x, c.y )
        g.lineTo( d.x, d.y )
        g.lineTo( a.x, a.y )
        g.fill()
    }
}

/**
 * a walkable path on a block grid
 *
 * defined by a list of 3D coords 
 * which are assumed to be a loop
 */
class Path{
    constructor(blockCoords){
        this.blockCoords = blockCoords
        
        this.nSteps = this.blockCoords.length-1
        this.duration = this.nSteps/global.workerSpeed
        this.stepDuration = this.duration/this.nSteps
        
    }
    
    // draw worker on path after t millisecs
    drawWorker(g,t){
        
        // which step
        var stepIndex = Math.floor(t/this.stepDuration) % this.nSteps
        
        // offset within step
        var r = (t % this.stepDuration) / this.stepDuration
        
        // neighboring 3d coords
        var a = this.blockCoords[stepIndex]
        var b = this.blockCoords[stepIndex+1]
        
        // interpolated 3d coords
        var ir = (1.0-r)
        var c = [a[0]*ir+b[0]*r,a[1]*ir+b[1]*r,a[2]*ir+b[2]*r]
        
        // translated 2d coords
        var p = global.grid.get2DCoords(...c).add(global.blockUnits.c)
        
        // jump between tiles
        p.y -= 3e-3*Math.abs(Math.sin(r*Math.PI))
        
        var holdingCargo = (stepIndex<this.nSteps/2)
        
        // draw body
        var w = .005
        var h = .008
        g.fillStyle = 'white'
        g.fillRect( p.x-w/2,p.y-h/2,w,h)
        
        // draw cargo
        if( holdingCargo ){
            w = h
            g.fillStyle = 'gray'
            g.fillRect( p.x-w/2,p.y-h/2-h,w,h)
        }
    }
    
    draw(g){
        var first = true
        g.strokeStyle = 'red'
        g.lineWidth = .001
        g.beginPath()
        this.blockCoords.forEach( xyz => {
            var p = global.grid.get2DCoords(...xyz).add(global.blockUnits.c)
            if( first ){
                g.moveTo(p.x,p.y)
                first = false
            } else {
                g.lineTo(p.x,p.y)
            }
        })
        g.stroke()
    }
}

// an assignemnt to build one specific block
//    - path for workers to follow
//    - deploy,update,remove workers
//    - track building progress
//    - 
class BuildTask{
    constructor(x,y,path){
        this.x = x
        this.y = y
        this.i = global.grid.getI(x,y)
        this.path = path
        this.deliveryTimeOffset = this.path.duration/2
        this.workerOffsets = [] // position of workers on path
        this.orCount = 0 // number of workers in first half of path
        this.workerDeployCountDown = this.randCountdown()
        this.remainingDeliveries = global.deliveriesPerBlock
        this.firstDelivery = true
    }
    
    // called in update() when a worker arrives at the block
    madeDelivery(){
        
        // flatten terrain
        if( this.firstDelivery ){
            global.grid.heights[this.i] = Math.floor(global.grid.heights[this.i])
            this.firstDelivery = false
        }
        
        this.remainingDeliveries--
        this.orCount--
        
        // add visual indication of progress
        global.grid.underConstruction[this.i] = true
        global.grid.heights[this.i] += (.9/global.deliveriesPerBlock)
        
        
        // check if construction completed
        if( this.remainingDeliveries==0 ){
            global.grid.underConstruction[this.i] = false
            global.grid.requestBlockPlacement(this.x,this.y)
        }
    }
    
    randCountdown(){
        return randRange(...global.workerDeployDelay) * (global.allBuildTasks.length/global.taskCountLimit)
    }
    
    update(dt){
        
        // deploy worker periodically
        if( this.workerDeployCountDown <= 0 ){
            if( this.orCount < this.remainingDeliveries ){
                this.workerOffsets.push(0)
                this.orCount++
            }
            this.workerDeployCountDown = this.randCountdown()
        }
        this.workerDeployCountDown -= dt
        
        // advance workers 
        this.workerOffsets = this.workerOffsets.flatMap(wo => {
            
            // check if delivery made during this update
            if( (wo<this.deliveryTimeOffset) && (wo+dt>=this.deliveryTimeOffset) ){
                this.madeDelivery()
            }
            wo += dt
            if( wo > this.path.duration ){
                return []
            }
            return [wo];
        })
        
        
        if( (this.remainingDeliveries<=0) && (this.workerOffsets.length==0) ){
            
            // signal task complete
            return false
            
        }
        
        // signal task ongoing
        return true
    }
    
    draw(g){
        if( global.showPaths ) this.path.draw(g)
        this.workerOffsets.forEach(wo=>this.path.drawWorker(g,wo))
        
        if( global.debugBuildTaskProgress ){
            var p = global.grid.get2DCoords(this.x,this.y)
            g.fillStyle = 'black'
            g.font = ".001em Arial";
            g.textAlign = "center";
            g.fillText(`${this.remainingDeliveries}`, p.x,p.y-.01);
        }
    }
}

// long-term construction plan

class Castle{
    constuctor(){}
    
    // called in setup.js
    getSpawnPos(){
        throw new Exception('not implemented')
    }
    
    // called in building_logic.js
    getTargetHeight(x,y){
        throw new Exception('not implemented')
    }
}

class SimpleCastle extends Castle{
    constructor(){
        super()
        this.heightMap = [
            "00000000000000000000",
            "00000000000000000000",
            "00000000000000000000",
            "00000000000000055556",
            "00000000000000045555",
            "00000000000000035556",
            "00000000000000025555",
            "00000000000000015556",
            "00000000000000005555",
            "00065000000000005556",
            "00055000000000015555",
            "00065000000000025556",
            "000550000000S0035555",
            "00065000000000045556",
            "00055000000000055555",
            "00065432111234555556",
            "00055555555555555555",
            "00065555555555555556",
            "00055555555555555555",
            "00065656565656565656",
        ]        
    }
    
    //helper
    getPos(c){
        
        for( var y = 0 ; y < this.heightMap.length ; y++ ){
            for( var x = 0 ; x < this.heightMap[0].length ; x++ ){
                if( this.heightMap[y].charAt(x) == c ){
                    return [x,y]
                }
            }
        }
    }
    
    // implement castle
    // called in setup.js
    getSpawnPos(){
        return this.getPos('S')
    }
    

    // implement castle
    getTargetHeight(x,y){
        try{
            return parseInt(this.heightMap[y].charAt(x))
        } catch {
            return 0
        }
    }
}

class TempleCastle extends Castle{
    constructor(){
        super()
        
        // one quarter
        var h =  [
            "0000000000",
            "000000000S",
            "0065600000",
            "0055500010",
            "0065440020",
            "0000444030",
            "0000044444",
            "0000004555",
            "0001234566",
            "0000004567",
        ] 
        
        // unfold snowflake twice
        var n = h.length
        for( var i = 0 ; i < n ; i++ ){
            h[i] = h[i].concat(h[i].split('').reverse().join('').replace('S','0'))
        }
        for( var i = 0 ; i < n ; i++ ){
            h.push(h[n-i-1])
        }
        
        this.heightMap = h
    }
    
    //helper
    getPos(c){
        
        for( var y = 0 ; y < this.heightMap.length ; y++ ){
            for( var x = 0 ; x < this.heightMap[0].length ; x++ ){
                if( this.heightMap[y].charAt(x) == c ){
                    return [x,y]
                }
            }
        }
    }
    
    // implement castle
    // called in setup.js
    getSpawnPos(){
        return this.getPos('S')
    }
    

    // implement castle
    getTargetHeight(x,y){
        try{
            return parseInt(this.heightMap[y].charAt(x))
        } catch {
            return 0
        }
    }
}

var allCastles = [
    new TempleCastle(),
    new SimpleCastle(),
]

function getCastle(){
    var i = Math.floor( Math.random() * allCastles.length )
    return allCastles[i]
}





// member methods implement building logic 
//  - build according to blueprint (global.castle)
//  - build at global.currentBuildHeight
//  - build longest path first
//  - do not build on active paths
    
function getNextBlockToBuild(){
    var maxPi = 0
    var bestX=null,bestY=null
    for( var x = 0 ; x < global.gridWidth ; x++ ){
        for( var y = 0 ; y < global.gridHeight ; y++ ){
            var i = global.grid.getI(x,y)
            if( global.grid.blockedByConstruction[i] ){
                continue
            }
            var h = global.grid.getHeightForPathfinding(i)
            var pi = global.grid.pathIndices[i]
            var th = global.castle.getTargetHeight(x,y)
            if( (h==global.currentBuildHeight) && (pi > maxPi) && (h<th) ) {
                bestX = x
                bestY = y
                maxPi = pi
            }
        }
    }
    if( bestX == null ){
        return null
    }
    return [bestX,bestY]
}

function verifyLevelComplete(){
    
    for( var x = 0 ; x < global.gridWidth ; x++ ){
        for( var y = 0 ; y < global.gridHeight ; y++ ){
            var i = global.grid.getI(x,y)
            var h = global.grid.heights[i]
            var th = global.castle.getTargetHeight(x,y)
            if( (h<th) && (h<(global.currentBuildHeight+1)) ){
                return false
            }
        }
    }
    return true
}

resetRand()

const global = {
    
    // total time elapsed in milliseconds
    t: 0,
    
    // graphics context
    canvas: null,
    ctx: null,

    // 
    backgroundColor: 'white',
    
    // relate screen pixels to virtual 2D units
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasScale: 0,
    

    // relate 3D blocks to virtual 2D units
    // based on (0,0,0) 1x1x1 block edges 
    blockOrigin: v(.5,.75),
    blockUnits: {
        x: v(2,-1).mul( 8e-3),
        y: v(-2,-1).mul(8e-3),
        z: v(0,-1.5).mul( 8e-3),
        
        // offset to center of surface
        c: v(0,-1).mul( 8e-3), 
    },
    
    // BlockGrid instance
    grid: null,
    gridWidth: 20,
    gridHeight: 20,
    
    // active contruction projects
    allBuildTasks: [],
    workerDeployDelay: [20,500], //millisecs 
    newTaskDelay: 200,
    newTaskCountdown: 700,
    taskCountLimit: 20,
    currentBuildHeight: 0, // z-value of new blocks
    workerSpeed: 7e-3, //tiles per ms
    deliveriesPerBlock: 5, // trips per block
    
    // long-term construction plan
    castle: null,
    spawnPos: null,
    
    // mouse
    canvasMousePos: v(0,0),     //pixels
    mousePos: v(0,0),           //virtual units
    
    // core logic helper
    allDirections: [
        [1,0],[-1,0],[0,1],[0,-1]
    ],
    
    //debug
    showPaths: false,
    debugBlockCoords: false,
    debugPathIndices: false,
    debugBuildTaskProgress: false,
}


    
    
// Render graphics
function draw(fps, t) {
    
    var ctx = global.ctx
    var canvas = global.canvas
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( 0, 0, canvas.width, canvas.height )

    // draw map and built blocks
    global.grid.draw(global.ctx)

    // draw spawn
    var sp = global.grid.get2DCoords(...global.spawnPos).add(global.blockUnits.c)
    ctx.fillStyle = 'black'
    ctx.beginPath();
    ctx.ellipse(sp.x,sp.y, 8e-3,3e-3, 0, 0, 2 * Math.PI);
    ctx.fill();

    // draw workers and partially built blocks
    global.allBuildTasks.forEach(bt=>bt.draw(global.ctx))

    //debug
    //trace always-visible circle
    //ctx.strokeStyle = 'yellow'
    //ctx.beginPath()
    //ctx.arc( .5, .5, .2, 0, twopi )
    //ctx.stroke()


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
    
    // assign new build tasks if necessary
    if( global.newTaskCountdown <= 0 ){
        while( (global.allBuildTasks.length<global.taskCountLimit) ){
            
            // request build target
            var xy = getNextBlockToBuild()
            
            // if no build target
            if(xy == null){
                if(global.allBuildTasks.length == 0){
                    if(global.noBuildTasksLastUpdate){
                        if( verifyLevelComplete() ){
                            // advance build height
                            global.currentBuildHeight++
                            if( global.currentBuildHeight > 1000 ){
                                global.currentBuildHeight = 1000
                            }
                        }
                        global.noBuildTasksLastUpdate = false
                        
                    } else {
                        
                        // maybe advance build height next update
                        global.noBuildTasksLastUpdate = true
                    }
                }
                break
            } else {
                
                // foudn build target, start building
                var path = global.grid.getPath(...xy)
                var bt = new BuildTask(...xy, path)
                global.allBuildTasks.push( bt )
                bt.path.blockCoords.forEach( xy => {
                    var i = global.grid.getI(...xy)
                    global.grid.blockedByConstruction[i] = true
                })
            }
        }
        global.newTaskCountdown=global.newTaskDelay
    }
    global.newTaskCountdown -= dt
    
    // advance tasks and remove finished tasks
    var oldN = global.allBuildTasks.length
    global.allBuildTasks = global.allBuildTasks
                            .filter( bt=> bt.update(dt) )
                            
    // unblock grid if any tasks were removed
    if( global.allBuildTasks.length != oldN ){
        global.grid.computeBlockedByConstruction()
    }
    
    global.grid.processBlockPlacements()
}




var lastCanvasOffsetWidth = -1;
var lastCanvasOffsetHeight = -1;
function fitToContainer(){
    
    var cvs = global.canvas
    if( (cvs.offsetWidth!=lastCanvasOffsetWidth) || (cvs.offsetHeight!=lastCanvasOffsetHeight) ){
        
      cvs.width  = cvs.offsetWidth;
      cvs.height = cvs.offsetHeight;
        
        var padding = 10; // (extra zoom IN) thickness of pixels CUT OFF around edges
        var dimension = Math.max(cvs.width, cvs.height) + padding*2;
        global.canvasScale = dimension;
        global.canvasOffsetX = (cvs.width - dimension) / 2;
        global.canvasOffsetY = (cvs.height - dimension) / 2;
    global.ctx.setTransform(global.canvasScale, 0, 0, 
        global.canvasScale, global.canvasOffsetX, global.canvasOffsetY);
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
    
    global.castle = getCastle();
    global.spawnPos = global.castle.getSpawnPos();
    global.grid = new BlockGrid();
    
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


