
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


// used in segment.js
//
// given two points, get slope and intercept
function getMb(a,b){
    var m = (b.y-a.y)/(b.x-a.x)
    var b = a.y - m*a.x
    return {m:m,b:b}
}

function nnmod(a,b){
    var r = a%b
    return (r>=0) ? r : r+b
}
    
// draw arc the short way (not looping all the around backwards)
function shortArch(g,c,r,a1,a2){
    
    var a1 = cleanAngle(a1)
    var a2 = cleanAngle(a2)
    var a = cleanAngle(a2 - a1)
    
    if( a < 0 ){
        var t = a2
        a2 = a1
        a1 = t
    }
    
    var p1 = c.add(vp(a1,r))
    var p2 = c.add(vp(a2,r)) 
    
    g.moveTo(c.x,c.y)
    g.lineTo(p1.x,p1.y)
    g.lineTo(p2.x,p2.y)
    g.lineTo(c.x,c.y)
}

function cleanAngle(a){
    if( a > pi ){
        a -= twopi
    }
    if( a < -pi ){
        a += twopi
    }
    return a        
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


// beam of light defined by two points
// gsecond point should always be off-screen

class Ray{
    constructor( start, end ){
        this.debugSpecs = []
        
        this.start = start
        this.end = end
        
        // prepare for tracing
        var d = end.sub(start)
        this.d = d
        this.angle = d.getAngle()
        this.det = d.x*d.x + d.y*d.y
        
        // find where the ray hits the earth
        // (or off-screen endpoint)
        var nearestHit = null
        global.allPlanets.forEach(p => {
           var h = this.getHit(p)
           if( (nearestHit==null) || (h[5] < nearestHit[5]) ){
               nearestHit = h
           }
        })
        
        this.end = nearestHit[0] // REPLACE given endpoint
        this.aoi = nearestHit[1] // angle of incidence
        this.acp = nearestHit[2] // angular coord on planet surface
        this.hitPlanet = nearestHit[3] // true if terminates on surface
        this.touchAtmo = nearestHit[4] // true if intersects planet atmosphere
        this.rayLength = nearestHit[5]
        nearestHit[6].registerSurfaceAoi(this) // compute scattering
    }
    
    // find where this ray hits the given planet
    // return vals used to set member vars above
    //      end       vector  - position 
    //      aoi       angle   - angle of incidence
    //      acp       angle   - angular coord on planet surface
    //      hitPlanet boolean - true if terminates on surface
    //      touchAtmo boolean - true if touches atmosphere
    //      rayLength distance
    //      planet    Planet instance
    getHit(planet){      
        var p = planet.pos  
        var r2 = planet.r2
        
        // locate point nearest planet center
        var d = p.sub(this.start)
        var rat = (this.d.x*d.x + this.d.y*d.y)/this.det
        var np = this.start.add(this.d.mul(rat))
        //this.debugSpecs.push(['red',np])
        var npa = np.sub(p).getAngle()
        var d2 = planet.pos.sub(np).getD2()
        
        
        
        // compute point on planet surface
        var dist = Math.sqrt(d2)
        var theta = Math.acos( dist / planet.rad )
        var p1 = p.add(vp(npa-theta,planet.rad))
        var p2 = p.add(vp(npa+theta,planet.rad))
        var s = this.start
        var pd1 = p1.sub(s).getD2()
        var pd2 = p2.sub(s).getD2() 
        if( pd1 < pd2 ){
            var pos = p1
            var pd = pd1
            var acp = npa-theta
        } else {
            var pos = p2
            var pd = pd2
            var acp = npa+theta
        }
        
        //debug
        if( false ){
            console.log(`dist: ${dist.toFixed(2)}`)
            console.log(`theta: ${theta.toFixed(2)}`)
            console.log(`this.angle: ${this.angle.toFixed(2)}`)
        }
        if( false ){
            this.debugSpecs.push(['orange',p,p.add(vp(npa,dist))])
            this.debugSpecs.push(['white',p,p.add(vp(acp,planet.rad))])
            this.debugSpecs.push(['blue',pos])
        }
        
        // check if missed planet
        if( (rat < 0) || (d2 > r2) ){
            var touchAtmo = dist<(planet.rad+planet.scatterInfluenceRadius)
            return [this.end,pio2,npa,false,touchAtmo,this.d.getMagnitude(),planet]
        }
        
        //return [pos,theta,theta]
        return [pos,pio2-theta,acp,true,true,pd,planet]
    }
    
    draw(g, debug=false){
        
        //debug
        if( this.debugSpecs ){
            this.debugSpecs.forEach( s => {
                if( s.length == 2 ){
                    g.fillStyle = s[0]
                    g.beginPath()
                    g.arc( s[1].x, s[1].y, .005, 0, twopi )
                    g.fill()
                } else if( s.length == 3 ){
                    g.strokeStyle = s[0]
                    g.lineWidth = .002
                    g.beginPath()
                    g.moveTo( s[1].x, s[1].y )
                    g.lineTo( s[2].x, s[2].y )
                    g.stroke()
                }
            })
        }
        
        // trace ray
        if( true ){
            var s = this.start.sub(vp(this.angle,.02*rand()))
            g.moveTo( s.x,s.y )
            g.lineTo( this.end.x, this.end.y )
        }
        
        
        // debug angular coord on planet surface
        if( debug ){
            var p = global.earth
            var s = p.pos.add(vp(this.acp,p.rad))
            g.strokeStyle = 'red'
            g.lineWidth = .001
            g.beginPath()
            g.moveTo( p.pos.x, p.pos.y )
            g.lineTo( s.x, s.y )
            g.stroke()
        }
        
        // debug angle of incidence
        if( false && (this.endY < 1) ){
            g.font = ".01px Arial";
            g.textAlign = "center";
            g.fillStyle = "white";
            g.fillText(this.aoi.toFixed(2), this.x, this.endY)
        }
    }
}

class Planet {
    
    constructor( pos, rad ){
        this.pos = pos
        this.rad = rad
        this.r2 = rad*rad
        
        // angles of incidence of light rays hitting the surface
        this.surfaceAois = null
        
        // relative intensity of light at surface
        this.surfaceInts = null
    }
    
    resetSurfaceAois(){
        if( this.surfaceAois == null ){
            this.surfaceAois = new Array(this.nScatterPoints)
        }
        this.surfaceAois.fill(10)
        
        if( this.surfaceInts == null ){
            this.surfaceInts = new Array(this.nScatterPoints)
        }
        this.surfaceInts.fill(0)
    }
    
    // update surfaceAois to consider the given ray
    registerSurfaceAoi(ray){
        
        if( !ray.touchAtmo ){
            return
        }
        var index = nnmod( Math.floor( (ray.acp+global.planetSpinAngle) / this.scr ), this.nScatterPoints )
        
        var val = Math.min(ray.aoi, this.surfaceAois[index])
        this.surfaceAois[index] = val
        
        if( !val ){
            console.log('poop')
        }
        
        this.adjustNegihboringSurfaceVals( this.surfaceAois, index, val, this.adjustAoi )
        this.adjustNegihboringSurfaceVals( this.surfaceInts, index, 2*(1-(ray.aoi/pio2)), this.adjustInt )
        
    }
    
    // used in registerSurfaceAoi
    // apply rolling adjustment to neighboring values in a given array
    // arrayToAdjust is treated as a loop with nScatterPoints elements
    adjustNegihboringSurfaceVals( arrayToAdjust, index, val, func ){
        
        var count = 0
        var i = index
        var v = val
        while( true ){
            count += 1
            i = nnmod(i+1,this.nScatterPoints)
            v = func(arrayToAdjust[i],v,i,count)
            if( !v ) break
            arrayToAdjust[i] = v
        }
        
        
        count = 0
        i = index
        v = val
        while( true ){
            count += 1
            i = nnmod(i-1,this.nScatterPoints)
            v = func(arrayToAdjust[i],v,i,count)
            if( !v ) break
            arrayToAdjust[i] = v
        }
    }
    
    
}

class Earth extends Planet {
    
    constructor(){
        super(...arguments)
        
        
        // number of glowing spots around planet surface
        this.nScatterPoints = 100 
        this.scr = twopi/this.nScatterPoints
        
        // dist from surface to relevant rays
        this.scatterInfluenceRadius = .02
        
        // radius of glowing spots
        this.scatterVisibleRadius = .02
    }
    
    // propogate scattering effect across atmosphere
    // used in planet.js
    adjustAoi(oldv,v,i,count){
        return (count<30) && (oldv>v) && v+.08
    }
    
    // propogate intensity effect across atmosphere
    // used in planet.js
    adjustInt(oldv,v,i,count){
        return (count<30) && (oldv<v) && v-.04
    }
    
    
    draw(g){
        
        // draw scattered light around surface
        for( var i = 0 ; i < this.nScatterPoints ; i++ ){
            this.drawScatterPoint(g,i)
        }
        
        // draw landmass
        var sund = this.pos.sub(global.sunPos)
        var colAmt = .04*sund.getMagnitude()
        var innerD = .09-colAmt
        var innerR = 0+colAmt
        var outerD = 0-colAmt
        var outerR = .09+colAmt
        var angle = sund.getAngle()
        var innerC = this.pos.add(vp(angle,innerD))
        var outerC = this.pos.add(vp(angle,outerD))
        var gradient = g.createRadialGradient(
            innerC.x, innerC.y, innerR, 
            outerC.x, outerC.y, outerR)
            
        var colorSpecs = [
        [0,'rgb(10,0,30)'],
        [.2,'rgb(30,50,90)'],
        [.32,'rgb(65,150,120)'],
        [.52,'rgb(100,210,135,.95)'],
        [.68,'rgba(180,255,150,.8)']]
        var prev = null
        colorSpecs.forEach(p => {
            if( prev != null ){
                gradient.addColorStop(p[0]-.001, prev[1]);
            }
            gradient.addColorStop(p[0], p[1]);
            prev = p
        })
        gradient.addColorStop(1, prev[1]);
        g.fillStyle = gradient
        g.beginPath()
        g.arc( this.pos.x, this.pos.y, this.rad, 0, twopi )
        g.fill()
        
    }
    
    // used in draw
    drawScatterPoint(g,i){
        
        if( this.surfaceAois[i] == 10 ){
            return
        }
        
        var acp1 = i*this.scr - global.planetSpinAngle
        var aoi1 = this.surfaceAois[i]
        var int1 = this.surfaceInts[i]
        
        var color = this.getScatterColor(aoi1,int1)
        
        var gradient = g.createRadialGradient(
                            this.pos.x, this.pos.y, this.rad, 
                            this.pos.x, this.pos.y, this.rad + this.scatterVisibleRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(.5, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        g.fillStyle = gradient
        g.beginPath()
        var pos = this.pos.add(vp(acp1,this.rad))
        //shortArch()
        //g.arc( pos.x, pos.y, global.scatterVisibleRadius, 0, twopi )
        shortArch(g, this.pos, this.rad + this.scatterVisibleRadius, 
                    acp1-this.scr, acp1+this.scr )
        g.fill()
    }

    // given angle of incidence with atmosphere, 
    // get color of scattered light
    getScatterColor(angle,intensity){
        var ang = Math.abs(cleanAngle(angle))
        var frac = ang/pio2//Math.pow(ang/pio2,.7)
        
        var r = 100*frac
        var g = 200*(1.0-.7*frac) 
        var b = 255*(1.0-.7*frac) 
        
        r *= intensity
        g *= intensity
        b *= intensity
        var a = 5e-1*intensity//(intensity>1) ? 1 : Math.max(r,g,b)/255
        return `rgba(${r},${g},${b},${a})`
    }
    
}

class Moon extends Planet {
    
    constructor(){
        super(...arguments)
        
        
        // number of glowing spots around planet surface
        this.nScatterPoints = 20 
        this.scr = twopi/this.nScatterPoints
        
        // dist from surface to relevant rays
        this.scatterInfluenceRadius = .004
        
        // radius of glowing spots
        this.scatterVisibleRadius = .004
    }
    
    // propogate scattering effect across atmosphere
    // used in planet.js
    adjustAoi(oldv,v,i,count){
        return (count<5) && (oldv>v) && v+.2
    }
    
    // propogate intensity effect across atmosphere
    // used in planet.js
    adjustInt(oldv,v,i,count){
        return (count<5) && (oldv<v) && v-.05
    }
    
    draw(g){
        
        // draw scattered light around surface
        for( var i = 0 ; i < this.nScatterPoints ; i++ ){
            this.drawScatterPoint(g,i)
        }
        
        // draw landmass
        var sund = this.pos.sub(global.sunPos)
        var colAmt = .01*sund.getMagnitude()
        var innerD = .045-colAmt
        var innerR = 0+colAmt
        var outerD = 0-colAmt
        var outerR = .045+colAmt
        var angle = sund.getAngle()
        var innerC = this.pos.add(vp(angle,innerD))
        var outerC = this.pos.add(vp(angle,outerD))
        var gradient = g.createRadialGradient(
            innerC.x, innerC.y, innerR, 
            outerC.x, outerC.y, outerR)
            
        var colorSpecs = [
        [0,'rgb(0,0,0)'],
        [.1,'rgb(0,0,0)'],
        [.4,'rgb(50,50,50)'],
        [.5,'rgba(100,100,100,.8)'],
        [.6,'rgba(155,155,155,.5)']]
        var prev = null
        colorSpecs.forEach(p => {
            if( prev != null ){
                gradient.addColorStop(p[0]-.001, prev[1]);
            }
            gradient.addColorStop(p[0], p[1]);
            prev = p
        })
        gradient.addColorStop(1, prev[1]);
        g.fillStyle = gradient
        g.beginPath()
        g.arc( this.pos.x, this.pos.y, this.rad, 0, twopi )
        g.fill()
        
    }
    
    // used in draw
    drawScatterPoint(g,i){
        
        if( this.surfaceAois[i] == 10 ){
            return
        }
        
        var acp1 = i*this.scr-global.planetSpinAngle
        var aoi1 = this.surfaceAois[i]
        var int1 = this.surfaceInts[i]
        
        var color = this.getScatterColor(aoi1,int1)
        
        var gradient = g.createRadialGradient(
                            this.pos.x, this.pos.y, this.rad, 
                            this.pos.x, this.pos.y, this.rad + this.scatterVisibleRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        g.fillStyle = gradient
        g.beginPath()
        var pos = this.pos.add(vp(acp1,this.rad))
        //shortArch()
        //g.arc( pos.x, pos.y, global.scatterVisibleRadius, 0, twopi )
        shortArch(g, this.pos, this.rad + this.scatterVisibleRadius, 
                    acp1-this.scr, acp1+this.scr )
        g.fill()
    }

    // given angle of incidence with atmosphere, 
    // get color of scattered light
    getScatterColor(angle,intensity){
        var ang = Math.abs(cleanAngle(angle))
        var frac = Math.pow(ang/pio2,.7)
        
        
        
        var re = 100*frac
        var r = 255*(1.0-.7*frac) 
        var g = 255*(1.0-.7*frac) 
        var b = 255*(1.0-.7*frac) 
        
        r = avg(r,re,.3)
        
        r *= intensity
        g *= intensity
        b *= intensity
        var a = r//(intensity>1) ? 1 : Math.max(r,g,b)/255
        return `rgba(${r},${g},${b},${a})`
    }
    
}

resetRand()

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
    mousePos: v(0,0),           //virtual units

    // 
    backgroundColor: 'black',
    nSunrays: 200, // number of rays pointing out from sun
    
    //background
    nStars: 2000,
    minStarRad: .001,
    maxStarRad: .001,
    
    // total time elapsed in milliseconds
    t: 0,
    allPlanets: [],
    
    //
    planetSpinDa: 2e-4 * (rand()>.5? 1 : -1), //rads per ms
    planetSpinAngle: 0,
    
    //
    earth: null,
    earthRad: .05,
    
    //
    moon: null, 
    moonRad: .01,
    moonOrbitRx: .2, 
    moonOrbitRy: .1, 
    moonOrbitDa: .0001, // rads per ms
    moonOrbitOa: rand()*twopi, // rads offset
    
    //
    sunPos: v( .7,.3),
    sunRad: .02,
    sunSpinDa: 2e-5*randRange(.5,1) * (rand()>.5? 1 : -1), //rads per ms
    sunOrbitC: v(.5,.3),
    sunOrbitRx: .4,
    sunOrbitRy: .02,
    sunOrbitDa: 2e-5*randRange(.5,1),//rads per ms
    sunOrbitOa: pio2+randRange(-.5,.5), // rads offset
    
    sunTargetPos: null, // set value only when user clicks to direct sun
    sunTargetVel: v(0,0),
    sunTargetAccel: 5e-7, // dist per ms per ms
    sunTargetFriction: 3e-3, // fraction of speed lost per ms
    sunTargetMargin: 2e-2, // "close enough" distance to target
}


    
    
// Render graphics
function draw(fps, t) {
   var ctx = global.ctx
   var canvas = global.canvas
    global.ctx.fillStyle = global.backgroundColor
    global.ctx.fillRect( 0, 0, canvas.width, canvas.height )
   
   var prevRay = null
   var sp = global.sunPos
   
   //debug
   if( false ){
        ctx.strokeStyle = 'rgba(255,255,0,.5)'
        ctx.lineWidth = .001
        ctx.beginPath()
            
       resetRand()
       global.earth.resetSurfaceAois()
       var a = new Ray( sp, sp.add(vp(-pio2-.2,10)) )
       var b = new Ray( sp, sp.add(vp(-pio2+.2,10)) )
       a.draw(ctx)
       b.draw(ctx)
       global.earth.registerSurfaceAoi(a)
       global.earth.registerSurfaceAoi(b)
       //new Raynge( a, b ).draw(ctx)
       
         ctx.stroke()
   }
   
   // draw stars
   resetRand()
   var denseO = randRange(-1,0)
   //var denseA = randRange(-.5,.5)
   var denseB = randRange(-1,1)
   var denseC = .5
   var denseSpread = .2
   
   ctx.fillStyle = 'white'
   for( var i = 0 ; i < global.nStars ; i++ ){
       var x,y,r
       if( rand() > .2 ){
           x = rand()
           //y = denseA*Math.pow(x+denseO,2) + denseB*(x+denseO) + denseC
           y = denseB*(x+denseO) + denseC
           
           p = v(x,y).add(vp(rand()*twopi,rand()*denseSpread))
           r = global.minStarRad
       } else {
           p = v(rand(),rand())
           r = randRange( global.minStarRad, global.maxStarRad );
       }
       if( rand() > .5 ){
           var twp = randRange(1e3,3e3)
           o = rand()*1e3
           r *= Math.sin( (global.t-o)/twp )
       }
       
       ctx.fillRect( p.x-r,p.y-r,2*r,2*r )
   }
   
   
   // draw light from mouse position
   if( true ) {
       var n = global.nSunrays
       var da = twopi / (n-(1e-8))
       
       // clear scattering data
       global.allPlanets.forEach(p => p.resetSurfaceAois())
       
       // iterate through rays once per pass
       for( var pass = 0 ; pass < 2 ; pass += 1 ){
       
           
           if( pass==0 ){
               // first pass block stars
                ctx.fillStyle = 'black'
                ctx.lineWidth = .01
                ctx.lineCap = "round"
                ctx.beginPath()
                global.allPlanets.forEach(p => 
                    ctx.arc(p.pos.x,p.pos.y,p.rad,0,twopi)
                )
                ctx.fill()
               continue
           }
           
           // start ray drawing
            ctx.strokeStyle = 'rgb(150,150,0)'
            ctx.lineWidth = .001
            ctx.lineCap = "butt"
            ctx.beginPath()
           resetRand()
           
           for( var a = 0 ; a < twopi ; a += da ){
               
               var p = randRange(1e3,3e3)
               var o = rand()*1e3
               var oa = global.sunSpinDa*global.t + rand()*4e-2 * Math.sin( (global.t-o)/p )
               
               // construct ray and compute scattering
               var ray = new Ray(sp,sp.add(vp(a+oa,10+rand())))
               
               ray.draw(ctx)
           }
           
         // finish ray drawing
         ctx.stroke()
       }
   }
    // second pass draw planets and nearby scattered light
    global.allPlanets.forEach(p => p.draw(ctx))
   
   
   // draw sun circle
   ctx.fillStyle = 'yellow'
   ctx.beginPath()
   ctx.arc( global.sunPos.x, global.sunPos.y, global.sunRad, 0, twopi )
   ctx.fill()
   
   
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

function updateMousePos(event){
    fitToContainer()
    
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
    
    //global.sunPos = global.mousePos
}

function mouseClick(e){
    updateMousePos(e)
    global.sunTargetPos = global.mousePos
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


function update(dt) {    
    fitToContainer()
    
    global.t += dt
    
    global.planetSpinAngle = global.planetSpinDa * global.t
    
    // update moon position
    var ma = global.moonOrbitOa + global.moonOrbitDa*global.t
    global.moon.pos = v(.5,.5).add( v( 
                        Math.cos(ma)*global.moonOrbitRx, 
                        Math.sin(ma)*global.moonOrbitRy ))
                        
    // update sun position
    if( global.sunTargetPos ){
    
        // accel sun to user click location
        var d = global.sunTargetPos.sub(global.sunPos)
        var angle = d.getAngle()
        var dv = v(0,0)
        if( d.getMagnitude() > global.sunTargetMargin ){
            dv = vp( angle, global.sunTargetAccel )
        }
        global.sunTargetVel = global.sunTargetVel
                                .mul( (1.0-dt*global.sunTargetFriction) )
                                .add( dv.mul(dt) )
        global.sunPos = global.sunPos.add(global.sunTargetVel.mul(dt))
        
    } else {
        
        //procedural sun movement
        resetRand()
        var sa = global.sunOrbitOa + global.sunOrbitDa*global.t
        global.sunPos =  global.sunOrbitC.add( v( 
                    global.sunOrbitRx*Math.cos(sa), 
                    global.sunOrbitRy*Math.sin(sa) ))
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
    
    var c = v(.5,.5)
    global.earth = new Earth( c, global.earthRad )
    global.moon = new Moon( c, global.moonRad )
    global.allPlanets = [global.earth,global.moon]
    
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


