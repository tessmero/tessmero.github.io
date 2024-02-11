
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


function rectCenter(x,y,w,h){
    return [x+w/2,y+h/2]
}

function padRect(x,y,w,h,p){
    return [x-p,y-p,w+2*p,h+2*p]
}

function vInRect(p,x,y,w,h){
    let result = (p.x>=x) && (p.x<=(x+w)) && (p.y>=y) && (p.y<=(y+h))   
    return result
}

function inRect(px,py,x,y,w,h){
    return (px>=x) && (px<=(x+w)) && (py>=y) && (py<=(y+h))
}

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


class Gui {
    
    constructor(){
        this.clickableElements = []
    }
    
    // build list of GuiElement instances
    buildElements(){ throw new Error('not implemented') }
    
    draw(g){
        this.clickableElements.forEach(e => e.draw(g))
    }
    
    update(dt){
        this.clickableElements.forEach(e => e.update())
    }
    
    click(){
        return this.clickableElements.some( e => 
            e.rect && vInRect(global.mousePos,...e.rect) && !e.click() )
    }
    
    // hooks called in game_states.js
    open(){}
    close(){}
}

// base class for gui elements

// instances represent rectangles positioned on-screen
class GuiElement {

    constructor(rect){
        this.rect = rect
        this.hoverable = true
    }
    
    // set text to appear on hover
    withTooltip(s){
        this.tooltip = s
        return this
    }
    
    withDynamicTooltip(f){
        this.tooltipFunc = f
        return this
    }

    update(){
        
        // check if mouse is in this element's rectangle
        this.hovered = (this.hoverable && vInRect(global.mousePos,...this.rect))
        
        if( this.hovered && (this.tooltipFunc || this.tooltip) ){
            
            if( this.tooltipFunc ) this.tooltip = this.tooltipFunc()
            
            // build new tooltip gui element
            let anchorPoint = TooltipPopup.pickMouseAnchorPoint()
            let rect = TooltipPopup.pickTooltipRect(anchorPoint,this.tooltip)
            global.tooltipPopup = new TooltipPopup(rect,this.tooltip)
            if( this.tooltipScale ) global.tooltipPopup.scale = this.tooltipScale
        }
    }

    draw(g){
        throw new Error(`Method not implemented in ${this.constructor.name}.`);
    }

    click(){
        throw new Error(`Method not implemented in ${this.constructor.name}.`);
    }
}

// base class for pixel art icon layouts which may be animated


// icon instances are singletons
class Icon {
    
    static subclassNames = []
    
    // frames is a list of layouts like text characters (gui/characters.js)
    constructor(frames){
        this.frames = frames
        
        //debug
        //console.log(`icon constructed ${this.constructor.name}`)
    }
    
    getCurrentAnimatedLayout(){
        let n = this.frames.length
        let i = Math.floor(global.t / global.baseAnimPeriod) % n
        return this.frames[i]
    }
}

class Poi {
    constructor(p){
        this.pos = p
        this.vel = v(0,0)
        this.md2 = global.poiStartArea
        if( this.md2 > global.poiMaxArea ) this.md2 = global.poiMaxArea
        
        
        this.pressure = 0 //0-1 increases when held by player
        this.pressurePattern = null//instance of PressurePattern
    }
    
    update(dt){
        this.r = Math.sqrt(this.md2) // only allowed sqrt
        
        // push on-screen
        var sc = global.screenCorners
        if( this.pos.x < sc[0].x ) this.pos.x = sc[0].x
        if( this.pos.x > sc[2].x ) this.pos.x = sc[2].x
        if( this.pos.y < sc[0].y ) this.pos.y = sc[0].y
        if( this.pos.y > sc[2].y ) this.pos.y = sc[2].y
        
        this.vel = this.vel.mul(1.0-dt*global.poiFriction)
        this.pos = this.pos.add(this.vel.mul(dt))
        
        if( this.isHeld ){
            
            // build pressure
            if( !this.pressurePattern ) this.pressurePattern = randomPressurePattern()
            this.pressure = Math.min(1, this.pressure+dt*global.poiPressureBuildRate)
            
        } else if(this.pressure > 0) {           
            
            // release pressure
            if( !this.isReleasing ){
                
                // just started releasing, generate new pattern
                this.isReleasing = true
                let n = Math.round( this.pressure * this.md2 * global.poiParticlesReleased )
                global.activeReleasePatterns.push(randomReleasePattern(n,...this.pos.xy(),this.r))
            }
            
            // ongoing gradual release animation
            this.pressure = Math.max(0,this.pressure - dt*global.poiPressureReleaseRate)
            
            if( this.pressure == 0 ){
                
                // finished release animation
                this.pressurePattern = null
                this.isReleasing = false
            }

        }
        
        // shrink gradually
        if( !this.isHeld ) this.md2 -= dt*global.poiShrinkRate
        return ( this.md2 > 0 )
    }
    
    drawBuildCursor(g){
        
        let p = global.mousePos.xy()
        
        g.beginPath()
        g.moveTo(...p)
        g.arc(...p,this.r,0,twopi)
        g.fill()
    }
    
    draw(g){
        let p
        if( (this.pressure > 0) && this.pressurePattern ){
            // indicate pressure
            let off = this.pressurePattern.getOffset(
                                global.t,this.r,this.pressure)
            p = this.pos.add(off)
        } else {
            p = this.pos
        }
        p = p.xy()
        
        let r = this.r
        g.beginPath()
        g.moveTo(...p)
        g.arc(...p,r,0,twopi)
        g.fill()
        
        
        if( false ){
            
            // debug pressure level
            g.fillStyle = global.backgroundColor
            drawText(g,...p,this.pressure.toFixed(2).toString())
            g.fillStyle = global.lineColor
        }
        
    }
}


// movement pattern to represent pressure building

class PressurePattern {
    constructor(){}
    
    //get xy for given pressure 0-1
    getOffset(t,r, pressure) { throw new Error('not implemented') }
}


// release procedural particles from a poi
// each instance represents a specific event
class ReleasePattern {
    
    constructor(n,x,y,r){
        this.n = n // total number of particles
        this.x = x
        this.y = y
        this.r = r
        this.startTime = global.t
    }
    
    // draw particles
    // return the number of particles that just passed off-screen
    draw(g){ throw new Error('not implemented') }
}

// a tool is an aelement of the quick bar
// it determines the appearnace of the mouse cursor
// and the click behavior

// tool instances are singletons
class Tool{
   
    drawCursor(g,p){ 

        // get static cursor pixel art layout
        // or get animated cursor if idle
        let layout = (global.idleCountdown <= 0) ? 
            this.icon.getCurrentAnimatedLayout() : this.icon.frames[0]
        
        
        drawLayout(g,...p,layout,this.cursorCenter,.005,1,true) 
        drawLayout(g,...p,layout,this.cursorCenter,0,1,false) 

    }
    
    drawToolbarIcon(g,rect){ 

        // get static cursor pixel art layout
        // or get animated cursor if idle
        let layout = (global.idleCountdown <= 0) ? 
            this.icon.getCurrentAnimatedLayout() : this.icon.frames[0]
            
        drawLayout(g,...rectCenter(...rect),layout)
    }
   
    mouseDown(){ throw new Error("not implemented") }
    
    update(dt){}
    
    mouseMove(){}
    
    mouseUp(){}
}

// costs for using tools
class ToolProgression {
    
    constructor(){
        
    }
}



class BuildTool extends Tool{
    
    constructor(){
        super()
        
        this.icon = circleToolIcon
            
        this.tooltip = 'build circles'
        this.cursorCenter = true // tool.js
    }
   
    mouseDown(){
        if( global.allPois.length < global.maxPoiCount ){
            global.allPois.push(new Poi(global.mousePos))
        }
        global.selectedToolIndex = 0
    }
    
    mouseMove(){}
    
    mouseUp(){}
}

// abstract base class for typical rectangular buttons
class Button extends GuiElement {
    constructor(rect,action){
        super(rect)
        
        this.rect = rect
        this.action = action
    }
    
    click(){
        this.action()
    }
    
    
    draw(g){
        this.constructor._draw(g,this.rect,this.hovered)
    }
    
    static _draw(g,rect,hovered=false,fill=true)
    {
        let lineCol = global.lineColor
        
        if(hovered){
            lineCol = 'white'
        }
        //g.fillStyle = global.backgroundColor
        g.strokeStyle = lineCol
        if( fill ) g.clearRect(...rect)
        g.strokeRect(...rect)
        g.fillStyle = global.lineColor
    }
}

class CatchIcon extends Icon {
    constructor() {
        super([[
            'W   W',
            'W WWW',
            'WWWWW',
            ' WWW ',
            ' WWW ',
        ],[
            'W   W',
            'WWW W',
            'WWWWW',
            ' WWW ',
            ' WWW ',
        ]]);
    }
}

const catchIcon = new CatchIcon();

class CircleToolIcon extends Icon {
    constructor() {
        super([[
            ' www ',
            'wwwww',
            'wwwww',
            'wwwww',
            ' www '
        ],[
            '     ',
            ' www ',
            ' www ',
            ' www ',
            '     '
        ]]);
    }
}

const circleToolIcon = new CircleToolIcon();



class CollectedIcon extends Icon {
    constructor() {
        super([[
            'WWWWW',
            'W   W',
            'W   W',
            'WWWWW',
            'WWWWW',
        ],[
            'WWWWW',
            'W   W',
            'WwwwW',
            'WWWWW',
            'WWWWW',
        ]]);
    }
}

const collectedIcon = new CollectedIcon();


class DecreaseIcon extends Icon {
    constructor() {
        super([
            [
                '     ',
                '     ',
                ' www ',
                '     ',
                '     ',
            ],[
                '     ',
                '     ',
                '     ',
                ' www ',
                '     ',
            ]
        ]);
    }
}

const decreaseIcon = new DecreaseIcon();

// default tool, collect raindrops, pressure/move pois

class DefaultTool extends Tool{
    
    constructor(){
        super()
        
        this.icon = defaultToolIcon
            
        this.tooltip = 'default tool'
        this.cursorCenter = false // tool.js
            
        //null or falsey -> mouse not being pressed
        //Poi instance -> mouse pressed on poi
        //otherwise -> mouse pressed on background
        this.held = null 
    }
   
    drawCursor(g,p,pad){ 
            
        if( this.held instanceof Poi ){
            
            //held on poi
            super.drawCursor(g,p,pad)
            
            
        } else if( this.held ){
            
            // held on background
            // catching rain
            let c = global.mousePos
            let r = global.mouseGrabRadius
            
            g.strokeStyle = global.backgroundColor
            g.lineWidth = .005
            g.beginPath()
            g.moveTo(c.x+r,c.y)
            g.arc(c.x,c.y,r,0,twopi)
            g.stroke()
            
            g.strokeStyle = global.lineColor
            g.lineWidth = .0025
            g.beginPath()
            g.moveTo(c.x+r,c.y)
            g.arc(c.x,c.y,r,0,twopi)
            g.stroke()
            
        } else {
            
            // not held
            super.drawCursor(g,p,pad)
        }
    }
   
    mouseMove(p){
        
    }
   
    mouseDown(p){ 
        // either grab the poi or start catching rain
        this.held = global.allPois.find( poi => 
            poi.pos.sub(p).getD2() < poi.md2 ) 
        if(!this.held){
            this.held = 'catching'
        } else {
            this.held.isHeld = true
        }
    }
    mouseUp(p){ this.held = null }
    
    update(dt){
        if( this.held instanceof Poi ){
            
            //held on poi
            
            // build pressure
            let poi = this.held
            poi.pressure = Math.min(1, poi.pressure+dt*global.poiPressureBuildRate)
            
            //apply force
            let d = global.mousePos.sub(poi.pos)
            let d2 = d.getD2()
            if( d2 < 1e-4 ) return
            let angle = d.getAngle()
            
            let accel = vp( angle, global.poiPlayerF/poi.md2 )
            poi.vel = poi.vel.add(accel.mul(dt))
            
        } else if( this.held ){
            
            // held on background
            // grab particles from ongoing rain
            if( global.particlesInGrabRange ){ //draw.js
                global.particlesInGrabRange.forEach( i => {
                    if( !global.grabbedParticles.has(i) ){
                        global.grabbedParticles.add(i)
                        global.particlesCollected += 1
                    }
                })
            }
            
            // grab particles from release patterns
            if( global.activeReleasePatterns ){
                let totalGrabbed = 0
                global.activeReleasePatterns.forEach(rp => {
                    rp.inGrabRange.forEach(i => {
                        rp.offScreen[i] = true
                        global.particlesCollected += 1
                        totalGrabbed += 1
                    })
                    rp.inGrabRange.length = 0
                })
                
                // add to ongoing rain
                for( let i = 0 ; i < totalGrabbed ; i++ )
                    global.grabbedParticles.add(global.nParticles+i)
                global.nParticles += totalGrabbed
            }
        }
    }
    
}

    

class DefaultToolIcon extends Icon {
    constructor() {
        super([[
            '#### ',
            '###  ',
            '#### ',
            '# ###',
            '   ##'
        ],[
            '     ',
            ' ####',
            ' ### ',
            ' ####',
            ' # ##',
        ]]);
    }
}

const defaultToolIcon = new DefaultToolIcon();



class Hud extends Gui {
    
    constructor(){
        super()
    }
    
    // implement gui
    buildElements(){
        let sc = global.screenCorners
        let sr = global.screenRect
        let m = .08
        
        // layout buttons at top of screen
        let topRow = [sc[0].x,sc[0].y, (sc[2].x-sc[0].x), m]
        let topLeft = [sr[0],sr[1],m,m]
        let topRight = [sc[2].x-m,sr[1],m,m]
        let topClp = [sr[0]+sr[2]*.1,sr[1]+m/4]
        let topCenterP = [sr[0]+sr[2]*.4,topClp[1]]
        let topCrp = [sr[0]+sr[2]*.7,topClp[1]]
        
        // layout toolbar at bottom of screen
        let mx = .2
        let nbuttons = toolList.length
        let padding = .005
        let buttonWidth = m-padding*2
        let rowHeight = buttonWidth + padding*2
        let rowWidth = buttonWidth*nbuttons + padding*(nbuttons+1)
        let brow = [sr[0]+sr[2]/2-rowWidth/2,sr[1]+sr[3]-rowHeight, rowWidth, rowHeight]
        let slots = []
        for( let i = 0 ; i < nbuttons ; i++ ){
            slots.push([brow[0]+padding+i*(buttonWidth+padding),brow[1]+padding,buttonWidth,buttonWidth])
        }
        
        
        // build top hud
        let result = [
        
            // stats button
            new IconButton(topLeft,statsIcon,toggleStats) //game_state.js
                .withTooltip('toggle upgrades menu'),
            
            // particles on screen
            new StatReadout(topClp,rainIcon,() => 
                global.nParticles.toString())
                .withDynamicTooltip(() => `max ${global.nParticles} raindrops on screen`),
            
            // catch rate %
            new StatReadout(topCenterP,catchIcon,() => 
                Math.floor(100*(global.grabbedParticles.size/global.nParticles)).toString()+'%')
                .withDynamicTooltip(() => `caught ${global.grabbedParticles.size} / ${global.nParticles} raindrops`),
                
            // total caught
            new StatReadout(topCrp,collectedIcon,() => 
                global.particlesCollected.toString())
                .withDynamicTooltip(() => `${global.particlesCollected} raindrops collected`),
            
            // pause button
            new IconButton(topRight,pauseIcon,pause) //game_state.js
                .withTooltip('pause or quit the game'), 
        ]
        
        
        // build toolbar buttons
        for( let i = 0 ; i < toolList.length ; i++ ){
            result.push(
                new ToolbarButton(slots[i],toolList[i].icon,i)
                    .withTooltip(toolList[i].tooltip)
            )
        }
        
        return result
    }
}



class IncreaseIcon extends Icon{
    constructor(){ super([
        [
            '     ',
            '  w  ',
            ' www ',
            '  w  ',
            '     ',
        ],[
            '  w  ',
            ' www ',
            '  w  ',
            '     ',
            '     ',
        ]
    ]) }
}

const increaseIcon = new IncreaseIcon()

class PauseIcon extends Icon {
    constructor() {
        super([[
            '       ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            '       ',
        ],[
            '       ',
            ' ww  ww',
            ' ww  ww',
            ' ww  ww',
            ' ww  ww',
            ' ww  ww',
            '       ',
        ],[
            '       ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            '       ',
        ],[
            '       ',
            'ww  ww ',
            'ww  ww ',
            'ww  ww ',
            'ww  ww ',
            'ww  ww ',
            '       ',
        ],[
            '       ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            '       ',
        ],[
            ' WW    ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            '    ww ',
            '       ',
        ],[
            '       ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            '       ',
        ],[
            '       ',
            '    ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww    ',
        ],[
            '       ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            '       ',
        ],[
            '    ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww    ',
            '       ',
        ],[
            '       ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            '       ',
        ],[
            '       ',
            ' ww    ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            ' ww ww ',
            '    ww ',
        ]]);
    }
}

const pauseIcon = new PauseIcon();



class PauseMenu extends Gui {
    
    constructor(...p){
        super(...p)
        
        this.hasHudInBackground = true // checked in draw.js
    }
    
    // implement Gui
    buildElements(){
        let sc = global.screenCorners
        let sr = global.screenRect
        
        // layout a column of wide buttons in the middle of the screen
        let pad = .005
        let w = .4
        let h = .1
        let n = 4
        let th = h*n + pad*(n-1)
        let x = sr[0]+sr[2]/2-w/2
        let y = sr[1]+sr[3]/2-th/2
        let slots = []
        for( let i = 0 ; i < n ; i++ )
            slots.push([x,y+i*(h+pad),w,h])
        
        
        return [
            new TextButton(slots[0],'RESUME',resume),//game_states.js
            new TextButton(slots[2],'QUIT',quit)//game_states.js
        ]
    }
}




class RainIcon extends Icon{
    constructor(){ super([
        [
            'W   W',
            '  W  ',
            'W   W',
            '  W  ',
            'W   W',
        ],[
            '  W  ',
            'W   W',
            '  W  ',
            'W   W',
            '  W  ',
        ]
    ]) }
}

const rainIcon = new RainIcon()

class ShakePressurePattern extends PressurePattern {
    
    constructor(){
        super()
    }
    
    //get xy for given pressure 0-1
    getOffset(t,r, pressure) { 
        return vp(
            rand()*twopi,
            r * pressure * 1e-1 * Math.sin(t*1e-2 + rand()*twopi)
        )
    }
}

class SimpleRingReleasePattern extends ReleasePattern{
    
    constructor(...p){
        super(...p)
        
        // prepare to keep track of OOB particles
        this.offScreen = new Array(this.n).fill(false)
    
        // prepare to keep track of particles grabbed by the player
        this.inGrabRange = []
    }
    
    // draw released particles
    // return the number of particles that just passed off-screen
    draw(g,t){ 
        let result = 0
    
        let speed = global.fallSpeed*5
        t -= this.startTime - this.r/speed
        let particle_radius = global.particle_radius
        let n = this.n
        let a0 = rand() * twopi
        let da = twopi/n
        let r = speed*t
        this.inGrabRange.length = 0
        for( let i = 0 ; i < n ; i++ ){
            if( this.offScreen[i] ) continue //skip particles that previously passed off-screen
            
            let a = a0+da*i
            let x = this.x+Math.cos(a)*r
            let y = this.y+Math.sin(a)*r
            
            if( !inRect( x,y, ...global.screenRect ) ){
                //particle just passed off-screen
                this.offScreen[i] = true
                result += 1
            }
            
            ///
            let p = v(x,y)
            let d2 = global.mousePos.sub(p).getD2()
            if( d2 < global.mouseGrabMd2 ){
                this.inGrabRange.push(i)
            }
            
            // draw particle
            g.fillRect( x-particle_radius, y-particle_radius, 2*particle_radius, 2*particle_radius )
        }
        
        return result
    }
}

class SpinPressurePattern extends PressurePattern {
    
    //get xy for given pressure 0-1 for pois of radius r
    getOffset(t,r, pressure) { 
        return vp(
            t*1e-2 + rand()*twopi,
            r * pressure * .2
        )
    }
}


class StartMenu extends Gui {
    
    constructor(){
        super()
    }
    
    // implement gui
    buildElements(){
        let sc = global.screenCorners
        let sr = global.screenRect
        let m = .3
        
        // layout a column of wide buttons in the middle of the screen
        let message = 'PRESS AND DRAG'
        let dims = getTextDims(message)
        let pad = .005
        let w = dims[0] + pad*10
        let h = .1
        let n = 10
        let th = h*n + pad*(n-1)
        let x = sr[0]+sr[2]/2-w/2
        let y = sr[1]+sr[3]/2-th/2
        let slots = []
        for( let i = 0 ; i < n ; i++ )
            slots.push([x,y+i*(h+pad),w,h])
        this.slots = slots
        
        let textPad = .01 // padding around letters' pixels
        
        this.labels = [
            new TextLabel(slots[2],message).withPad(textPad),
            new TextLabel(slots[3],'TO CATCH RAIN').withPad(textPad),
        ]
        
        return [
            ...this.labels,
            new TextButton(slots[8],'PLAY',play),  //game_state.js
        ]
    }
}

class StatsIcon extends Icon {
    constructor() {
        super([[
            '       ',
            ' W WWW ',
            '       ',
            ' W WWW ',
            '       ',
            ' W WWW ',
            '       ',
        ],[
            'WWWWWWW',
            'W W   W',
            'WWWWWWW',
            'W W   W',
            'WWWWWWW',
            'W W   W',
            'WWWWWWW',
        ]]);
    }
}

const statsIcon = new StatsIcon();

// a line of unchanging on-screen text
class TextLabel extends GuiElement {
    constructor(rect,label){
        super(rect)
        
        this.rect = rect
        this.label = label
        this.scale = 1
        this.pad = .005
        this.center = true
    }
    
    withScale(s){ 
        this.scale = s
        return this
    }
    
    withPad(p){
        this.pad = p
        return this
    }
    
    // implement GuiElement
    draw(g){
        let rect = this.rect
        let label = this.label
        
        let p = rectCenter(...rect)
        if( !this.center ){
            p[0] = rect[0]
            p[1] -= global.textPixelSize
        }
        drawText(g, ...p, label, this.center, this.pad, this.scale, true)
        drawText(g, ...p, label, this.center, 0, this.scale, false)
    }
    
    // implement GuiElement
    click(){
        //do nothing
    }
}

// a rectangle of text that appears on top of all other elements
// considered static/immutable
class TooltipPopup extends GuiElement {
    constructor(rect,label){
        super(rect)
        
        this.scale = TooltipPopup.scale()
        this.rect = rect
        this.label = label
    }
    
    // override GuiElement (disable hover behavior)
    update(){
        //do nothing
    }
    
    // implement GuiElement
    draw(g){
        let rect = this.rect
        let label = this.label
        let center = false
        
        
        let p = rectCenter(...rect)
        if( !center ){
            p[0] = rect[0]
            p[1] -= global.textPixelSize
        }
        
        g.fillStyle = global.lineColor
        drawText(g, ...p, label, center, .05, this.scale) //characters.js
        g.fillStyle = global.backgroundColor
        drawText(g, ...p, label, center, 0, this.scale)
        
        new StatReadout()
    }
    
    // implement GuiElement
    click(){
        //do nothing
    }
    
    static scale(){ return .5 }
    
    static pad(){ return .05 }
    
    // pick anchor point for pickTooltipRect
    // called in gui_element.js
    static pickMouseAnchorPoint(){ 
        let p = global.mousePos
        let sr = global.screenRect
        let offset = .1
        
        if( p.x < (sr[0]+sr[2]/2) )
            p = p.add(v(offset,0))
        if( p.y < (sr[1]+sr[3]/2) ){
            p = p.add(v(0,offset))
        } else {
            p = p.add(v(0,-TooltipPopup.pad()))
        }
        
        return p
    }
    
    // pick position for tooltip 
    // called in gui_element.js
    static pickTooltipRect( anchorPoint, label ){
        let [w,h] = getTextDims(label,TooltipPopup.scale()) //character.js
        let sr = global.screenRect
        let ap = anchorPoint
        
        // pick x position
        // start with center screen
        let midx = sr[0]+sr[2]/2
        let xr = midx-w/2
        
        // nudge x to include anchor point
        if( xr>ap.x ) xr = ap.x
        if( (xr+w)<ap.x ) xr = ap.x-w
        
        // pick y position
        // start with center screen
        let midy = sr[1]+sr[3]/2
        let yr = midy-h/2
        
        // nudge y to include anchor point
        if( yr>ap.y ) yr = ap.y
        if( (yr+h)<ap.y ) yr = ap.y-h
        
        // return x,y,w,h
        return [xr,yr,w,h]
        
    }
}


class UpgradeMenu extends Gui {
    
    constructor(...p){
        super(...p)
        
        // prepare for tiled transition effect
        let sc = global.screenCorners
        let sr = global.screenRect
        let m = .1
        m = .05
        let bigCenterRect = [sc[0].x+m,sc[0].y+m, (sc[2].x-sc[0].x)-2*m, (sc[2].y-sc[0].y)-2*m]
        
        this.transitionRect = sr//bigCenterRect
        this.transitionTileSize = 10*global.textPixelSize
        let tr = this.transitionRect
        let ts = this.transitionTileSize
        let w = Math.ceil(tr[2]/ts)
        let h = Math.ceil(tr[3]/ts)
        let n = w*h
        this.transitionEffect = new Array(n).fill(false)
        
        this.maxTransitionRadius = sc[0].sub(sc[2]).getMagnitude()
        this.transitionSpeed = 6e-3 // radius increase per ms
        this.transitionCenter = v(.5,.5)//state
        this.transitionRadius = 0//state
        
        this.hasHudInBackground = true // checked in draw.js
    }
    
    // extend Hud
    buildElements(){
        
        let sc = global.screenCorners
        let sr = global.screenRect
        let m = .1*sr[2]
        let w = sr[2]-2*m
        let h = .1 
        let r0 = [sc[0].x+m,sc[0].y+m, w,h]
        let result = []
        
        let specs = [
            // variable names in global.js
            ['nParticles',1,'max raindrops on screen'],
            ['fallSpeed',3e-6 , 'rain fall speed'],
            ['particle_radius',.001, 'size of falling rain drops'],
            ['particle_wiggle',.01, 'horizontal movement of drops'],
            ['poiFriction',1e-3, 'circle friction'],
            ['baseAnimPeriod',100,'idle gui animations'],
        ]
        specs.forEach( row => {
            let varname = row[0]
            let inc = row[1]
            result.push(new AdjustableGlobalVar(
                r0,varname,inc) // rect, varname, increment,
                .withDynamicTooltip(()=>{
                    return [
                        Math.floor(global[varname]/inc).toString() + ` : ${varname} `,
                        row[2],
                        'shift-click for 10x',
                        'ctrl-click for 100x',
                    ].join('\n')
                })) // toolsip
            r0 = [...r0]
            r0[1] += h
        })
        
        return result
        
    }
    
    //extend gui
    draw(g){
        super.draw(g)
    }
    
    open(){
        // restart transition animation
        this.transitionRadius = 0
    }
    
    close(){
        // restart transition animation
        this.transitionRadius = 0
    }
    
    //called in update.js
    updateTransitionEffect(dt){
        
        // advance transition radius if necessary
        if( this.transitionRadius < this.maxTransitionRadius ){
            this.transitionRadius += dt*this.transitionSpeed
            
            // check if the upgrade menu is open
            let tval = (global.allGuis && (global.allGuis[global.gameState]==this))
            
            // set transition effect within radius
            let md2 = Math.pow(this.transitionRadius,2)
            let tc = this.transitionCenter
            let tr = this.transitionRect
            let ts = this.transitionTileSize
            let w = Math.ceil(tr[2]/ts)
            let h = Math.ceil(tr[3]/ts)
            for( let x = 0 ; x < w ; x++ ){
                for( let y = 0 ; y < h ; y++ ){
                    let dx = tc.x - (tr[0]+x*ts)
                    let dy = tc.y - (tr[1]+y*ts)
                    if( (dx*dx+dy*dy) < md2 )
                        this.transitionEffect[x*h+y] = tval
                }
            }
        }
    }
    
    // called in draw.js
    drawTransitionEffect(g){
        
        // invert colors for center rectangle
        let tr = this.transitionRect
        let ts = this.transitionTileSize
        let w = Math.ceil(tr[2]/ts)
        let h = Math.ceil(tr[3]/ts)
        g.globalCompositeOperation = "xor";
        g.fillStyle = 'black'
        
        for( let x = 0 ; x < w ; x++ ){
            for( let y = 0 ; y < h ; y++ ){
                if( this.transitionEffect[x*h+y] ){
                    g.fillRect(tr[0]+x*ts,tr[1]+y*ts,ts,ts)
                }
            }
        }
        
        
        g.globalCompositeOperation = "source-over";
        
    }
}


// a line of text that may change
class DynamicTextLabel extends TextLabel {
    
    constructor(rect,labelFunc){
        super(rect,'')
        this.labelFunc = labelFunc
    }
    
    draw(g){
        
        // get updated label
        this.label = this.labelFunc()
        
        if( !this.fixedRect ){
            // update bounding rectangle to fit label
            let [w,h] = getTextDims(this.label, this.scale)
            this.rect[2] = w+this.pad*2
            this.rect[3] = h+this.pad*2
        }
        
        super.draw(g)
    }
}

// a button with a pixel art icon
class IconButton extends Button {
    
    constructor(rect,icon,action){
        super(rect,action)
        this.icon = icon
    }
    
    // implement GuiElement
    draw(g){
        super.draw(g)
        
        // draw pixel art icon
        let layout = this.hovered ? 
            this.icon.getCurrentAnimatedLayout() : this.icon.frames[0] //icon.js
        drawLayout(g,...rectCenter(...this.rect),layout) //character.js
    }
}

// a button with text
class TextButton extends Button {
    
    constructor(rect,label,action){
        super(rect,action)
        this.label = label
    }
   
    draw(g){
        super.draw(g)
        drawText(g, ...rectCenter(...this.rect), this.label)
    }
    
}

// a stat readout with buttons to increase and decrease
class AdjustableGlobalVar extends DynamicTextLabel {
    
    constructor(rect,varname,inc){
        super(rect,() => 
            '        ' + Math.floor(global[varname]/inc).toString().padEnd(8,' ') + `${varname}`)
        
        
        let r = this.rect
        let d = .05
        let p = (r[3]-d)/2
        let r0 = [r[0]+p,r[1]+p,d,d]
        let r1 = [r0[0]+d+p,r[1]+p,d,d]
        
        this.children = [
            new IconButton(r0,decreaseIcon,()=>{
                let m = 1
                if( global.shiftHeld ) m = 10
                if( global.controlHeld ) m = 100
                global[varname]-=m*inc
            }),
            new IconButton(r1,increaseIcon,()=>{
                let m = 1
                if( global.shiftHeld ) m = 10
                if( global.controlHeld ) m = 100
                global[varname]+=m*inc
            }),
        ]
        
        // disable changing dimensions in dynamic_text_label.js
        this.fixedRect = true
        
        // text drawing settings
        this.scale = .5
        this.tooltipScale = .4
        this.center = false
        
    }
    
    update(){
        super.update()
        this.children.forEach(e=>e.update())
        
    }
    draw(g){
        Button._draw(g,this.rect)
        super.draw(g)
        this.children.forEach(e=>e.draw(g))
    }
    
    click(){
        return this.children.some( e => 
            e.rect && vInRect(global.mousePos,...e.rect) && !e.click() )
    }
}

// a pixel art icon followed by a line of dynamic text
class StatReadout extends DynamicTextLabel {
    
    constructor(rect,icon,labelFunc){
        super(rect,function(){ return '  ' + labelFunc() })
        this.icon = icon
        this.scale = this.constructor.scale()
    }
    
    update(){
        super.update()
    }
    
    static scale(){ return .5 }
    
    // implement GuiElement
    draw(g){
        super.draw(g)
        
        // draw icon
        let xy = [this.rect[0]+this.pad,this.rect[1]+this.pad]
        let ch = charHeight
        let tps = global.textPixelSize 
        
        let layout = this.icon.getCurrentAnimatedLayout()
        
        drawLayout(g,xy[0],xy[1],layout,false,this.pad,this.scale,true) //character.js
        drawLayout(g,xy[0],xy[1],layout,false,0,this.scale,false) //character.js
    }
}

// a button in the toolbar with a pixel art icon
class ToolbarButton extends IconButton {
    
    constructor(rect,icon,indexInToolbar){
        super(rect,icon,null)
        this.indexInToolbar = indexInToolbar
    }
                
    click(){ 
        global.selectedToolIndex = this.indexInToolbar
        
        // close the upgrades menu if it is open 
        if( global.gameState==GameStates.upgradeMenu ) toggleStats()
        
    }
    
    // override IconButton
    draw(g){
        
        // check if selected
        let selected = (this.indexInToolbar == global.selectedToolIndex )
        
        // draw pixel art icon (like in icon_button.js)
        let layout = (this.hovered || ((global.gameState==GameStates.playing)&&selected) ) ? 
            this.icon.getCurrentAnimatedLayout() : this.icon.frames[0] //icon.js
        drawLayout(g,...rectCenter(...this.rect),layout) //character.js
                    
        
        if( selected ){
            
            //draw extra rectangle to highlight selected
            let outer = this.rect
            let m = .005
            let inner = [outer[0]+m,outer[1]+m,outer[2]-2*m,outer[3]-2*m]
            Button._draw(g,inner,false,false)
        }
    }
}

var charWidth = 5
var charHeight = 5

// draw text centered at point xy
function drawText(g,x,y,s,center=true,pad=0,scale=1, clear=false){
    let lines = s.split('\n')
    let dy = scale * global.textPixelSize * (charHeight*1.9)
    lines.forEach( l => {
        _drawTextLine(g,x,y,l,center,pad,scale,clear)
        y +=dy
    })
}
function _drawTextLine(g,x,y,s,center,pad,scale, clear){
    s = s.toUpperCase()
    let cw = charWidth
    let ch = charHeight
    let tps = global.textPixelSize * scale 
    let tls = global.textLetterSpace * scale
    let dx = tps * cw + tps * tls
    
    if( center ){
        let [tw,th] = getTextDims(s,scale)
        x -= tw/2
        y -= th/2
    }
    
    for( const c of s ){
        drawLayout(g,x,y,charLayouts[c],false,pad,scale,clear)        
        x += dx
    }
}

function getTextDims(s,scale=1){
    let lines = s.split(/\r?\n/)
    let longest = Math.max(...lines.map(l => l.length))
    
    let cw = charWidth
    let ch = charHeight
    let tps = global.textPixelSize 
    let tls = global.textLetterSpace  
    let dx = tps * cw + tps * tls
    let tw = dx*longest - tps*tls
    let th = tps*ch//*lines.length
    
    return [tw*scale,th*scale]
}

function drawLayout(g,x,y, layout, center=true, pad=0, scale=1, clear=false){
    if( !layout ) return
    
    let tps = global.textPixelSize*scale
    let tls = global.textLetterSpace*scale
    let ch = layout.length//charHeight
    
    if( center ){
        x -= tps*layout[0].length/2
        y -= tps*layout.length/2
    }
    
    for( let iy = 0 ; iy < ch ; iy++ ){
        let ix = 0
        for( const b of layout[iy] ){
            if( b!=' ' ){
                if( clear ){
                    g.clearRect(x+tps*ix-pad,y+tps*iy-pad,tps+pad*2,tps+pad*2)
                }  else {
                    g.fillRect(x+tps*ix-pad,y+tps*iy-pad,tps+pad*2,tps+pad*2)
                }
            }
            ix += 1
        }
    }
}

var charLayouts = {
    
':': [
    '     ',
    '  #  ',
    '     ',
    '  #  ',
    '     ',
],
    
'-': [
    '     ',
    '     ',
    '#####',
    '     ',
    '     ',
],
    
'%': [
    '#   #',
    '#  # ',
    '  #  ',
    ' #  #',
    '#   #'
],

'/': [
    '    #',
    '   # ',
    '  #  ',
    ' #   ',
    '#    '
],

'(': [
    '  ## ',
    ' #   ',
    '#    ',
    ' #   ',
    '  ## '
],

')': [
    '##   ',
    '   # ',
    '    #',
    '   # ',
    '##   '
],

'0': [
    ' ### ',
    '#   #',
    '#   #',
    '#   #',
    ' ### '
],

'1': [
    '  #  ',
    ' ##  ',
    '  #  ',
    '  #  ',
    ' ### '
],

'2': [
    ' ### ',
    '#   #',
    '   # ',
    '  #  ',
    '#####'
],

'3': [
    '###  ',
    '   # ',
    ' ### ',
    '   # ',
    '###  '
],

'4': [
    '#   #',
    '#   #',
    '#####',
    '    #',
    '    #'
],

'5': [
    '#####',
    '#    ',
    '#####',
    '    #',
    '#####'
],

'6': [
    ' ### ',
    '#    ',
    '#####',
    '#   #',
    ' ### '
],

'7': [
    '#####',
    '   # ',
    '  #  ',
    ' #   ',
    '#    '
],

'8': [
    ' ### ',
    '#   #',
    ' ### ',
    '#   #',
    ' ### '
],

'9': [
    ' ### ',
    '#   #',
    ' ####',
    '    #',
    ' ### '
],

    
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


let lastDrawTime = 0
    
// Render graphics
function draw(fps, t) {
    
    var ctx = global.ctx
    let g = ctx
    var canvas = global.canvas
    
    // draw background
    //ctx.fillStyle = global.backgroundColor
    ctx.clearRect( ...global.screenRect )
    
    // draw falling particles
    ctx.fillStyle = global.lineColor
    resetRand()
    let n_particles = global.nParticles
    let sc = global.screenCorners
    let sr = global.screenRect
    let anim_angle = global.t*1e-4
    let particle_radius = global.particle_radius
    let particle_wiggle = global.particle_wiggle
    let md2 = global.mouseGrabMd2
    global.particlesInGrabRange.clear()
    for( var i = 0 ; i < n_particles ; i++ ){
        var a = anim_angle + rand() * Math.PI*2
        var r = randRange(0,particle_wiggle)
        var x = sr[0] + rand() * sr[2] + r*Math.cos(a * Math.floor(rand()*10))
        var yr = randRange(0,sr[3])
        var rawy = global.fallSpeed*global.t+yr
        var prawy = global.fallSpeed*lastDrawTime+yr
        
        // if this particle just looped, ungrab it
        if( Math.floor( rawy / sr[3] ) != Math.floor( prawy / sr[3] ) ){
            global.grabbedParticles.delete(i)
        }
        var y = sr[1] + nnmod( rawy, sr[3] ) //+ r*Math.sin(a)
        
        // check if currently grabbed
        if( global.grabbedParticles.has(i) ) continue
        
        ctx.fillRect( x-particle_radius, y-particle_radius, 2*particle_radius, 2*particle_radius )
        
        //check if in mouse grab radius
        let p = v(x,y)
        let d2 = global.mousePos.sub(p).getD2()
        if( d2 < md2 ){
            if( !global.particlesInGrabRange.has(i) ){
                global.particlesInGrabRange.add(i)
            }
        }
        
        // check if in any passive grab radius
        global.allPois.some( poi => {
            if( poi.pos.sub(p).getD2() < poi.md2 ){ 
                poi.md2 += global.poiGrowthRate 
                if( poi.md2 > global.poiMaxArea ) poi.md2 = global.poiMaxArea
                global.grabbedParticles.add(i)
                return true
            }
        })
        
    }
    lastDrawTime = global.t
    
    // draw released particles
    resetRand()
    let passed_offscreen_count = 0
    global.activeReleasePatterns.forEach(rp => {
        passed_offscreen_count += rp.draw(ctx,global.t)
        
        //check if in mouse grab radius
        let p = v(x,y)
        let d2 = global.mousePos.sub(p).getD2()
        if( d2 < md2 ){
            if( !global.particlesInGrabRange.has(i) ){
                global.particlesInGrabRange.add(i)
            }
        }
        
    })
        
    // given the total number of released particles 
    // that just passed off-screen,
    // add to ongoing rain
    for( let i = 0 ; i < passed_offscreen_count ; i++ )
        global.grabbedParticles.add(global.nParticles+i)
    global.nParticles += passed_offscreen_count
    
    
    // draw pois
    resetRand()
    global.allPois.forEach( p => p.draw(ctx) )
    
    // draw hud gui in background
    if( global.allGuis[global.gameState].hasHudInBackground ){
        global.allGuis[GameStates.playing].draw(ctx) 
    }
    
    // draw upgrade menu gui transition effect
    global.allGuis[GameStates.upgradeMenu].drawTransitionEffect(g) //upgrade_menu.js
    
    // draw gui
    ctx.lineWidth = global.lineWidth
    global.allGuis[global.gameState].draw(ctx) 

    if( global.tooltipPopup ){
        
        // draw tooltip
        global.tooltipPopup.draw(ctx)
    }

    // draw cursor
    let p = global.mousePos.xy()
    let tool = toolList[global.selectedToolIndex]
    ctx.fillStyle = global.backgroundColor
    tool.drawCursor(ctx,p,.01)
    ctx.fillStyle = global.lineColor
    tool.drawCursor(ctx,p,0)

    // debug draw mouse
    if( false ){
        let c = global.mousePos
        g.strokeStyle = 'red'
        g.beginPath()
        g.moveTo(c.x,c.y)
        g.arc(c.x,c.y,global.mouseGrabRadius/10,0,twopi)
        g.stroke()
    }
    
    //debug
    if( false && global.debug ){
        drawText(ctx,.5,.5,global.debug)
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

const GameStates = {
    startMenu: 0,
    playing: 1,
    upgradeMenu: 2,
    pauseMenu: 3,
}

function rebuildGuis(){
    global.allGuis = [
         new StartMenu(),
         new Hud(),
         new UpgradeMenu(),
         new PauseMenu(),
    ]
    global.allGuis.forEach(k => {
        k.clickableElements = k.buildElements()
    })
}

function hideWebsiteOverlays(){
    let ids = ['navbar','source-link']
    ids.forEach( id => {
        let elem = document.getElementById(id)
        if( elem ) elem.style.display = "none";
    })
}

function showWebsiteOverlays(){
    let ids = ['navbar','source-link']
    ids.forEach( id => {
        let elem = document.getElementById(id)
        if( elem ) elem.style.display = "block";
    })
}

// toggle the stats / upgrades menu overlay
function toggleStats(){
    if( global.gameState != GameStates.upgradeMenu ){
        setState( GameStates.upgradeMenu )
    } else {
        setState( GameStates.playing )
    }
    
}

// go from pause menu back to game
function resume(){
    setState( GameStates.playing )
    hideWebsiteOverlays()
}

function play(){
    
    // reset progress
    global.nParticles = 100
    global.particlesCollected = 0
    global.allPois = []
    global.grabbedParticles = new Set()
    global.activeReleasePatterns = []
    
    resume()
}

function pause(){
    if( global.gameState != GameStates.pauseMenu ){
        setState( GameStates.pauseMenu )
    } else {
        setState( GameStates.playing )
    }
    hideWebsiteOverlays()
}

function quit(){
    setState( GameStates.startMenu )
    showWebsiteOverlays()
    resetGame()
}

function setState(s){
    global.selectedToolIndex = 0
    if( global.allGuis ) global.allGuis[global.gameState].close()
    global.gameState = s
    if( global.allGuis ) global.allGuis[global.gameState].open()
        
    
    global.shiftHeld = false
    global.controlHeld = false
}


const global = {
    
    // graphics context
    canvas: null,
    ctx: null,
    

    // 
    backgroundColor: '#AAA',
    lineColor: 'black',
    lineWidth: .002,
    
    // relate screen pixels to virtual 2D units
    canvasOffsetX: 0,
    canvasOffsetY: 0,
    canvasScale: 0,
    centerPos: v(.5,.5),
    screenCorners: null, 
    
    
    // text
    textPixelSize: .01, //virtual units
    textLetterSpace: 1, // text pixels
    
    
    // syncronized gui elements idle animations
    baseAnimPeriod: 500, //ms
    
    // start animating mouse cursor if idle
    idleCountdown: 0, //state
    idleDelay: 2000, //ms
    
    //
    fallSpeed: 3e-5,
    particle_radius: .005,
    particle_wiggle: .05,
    
    // game state
    gameState: GameStates.startMenu,
    selectedToolIndex: 0,
    t: 0, // total ellapsed time
    allPois: [], // Poi instances
    maxPoiCount: 10,
   
    
   
    // game advancement
    nParticles: 100, // particles on screen at once
    particlesCollected: 0,
    particlesRequiredToStart: -1, //
    activeReleasePatterns: [], //list of ReleasePattern instances
    
    //
    poiShrinkRate: 1e-6,// vunits^2 area lost per ms
    poiGrowthRate: 4e-3,// vunits^2 area gained per drop eaten
    poiStartArea: 1e-2, // free area for new poi
    poiMaxArea: 1e-2,
    poiPressureBuildRate: 2e-4, // pressure (max 1) increase per ms while held
    poiPressureReleaseRate: 1e-3, 
    poiParticlesReleased: 1e4,// total parts released per unit area at full pressure
    
    
    
    // strength of "forces" on poi
    // force=(area/accel) in vunits...ms...
    poiPlayerF: 1e-7, // player clicking and dragging
    poiScreenF: 1e-7, // automatic correction if poi is off-screen
    poiNeighborF: 1e-7, // two overlapping pois push eachother
    
    poiFriction: 1e-2, //fraction of speed lost per ms
    
    // mouse
    canvasMousePos: v(0,0),     //pixels
    mousePos: v(0,0),           //virtual units
    mouseGrabRadius: .05,
    mouseGrabMd2: .05*.05,
    grabbedParticles: new Set(), // particle indices
    particlesInGrabRange: new Set(),
    
    //debug
    debugTileIndices: false,
    
}

function keyDown(event){
  if (event.key === "Escape") {
    pause()
  }
  if (event.which==16) {
    global.shiftHeld = true
  }
  if (event.which==17) {
    global.controlHeld = true
  }
}
function keyUp(event){
  if (event.which==16) {
    global.shiftHeld = false
  }
  if (event.which==17) {
    global.controlHeld = false
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
}

function mouseMove(e){
    updateMousePos(e)
    
    // animate cursor if idle 
    global.idleCountdown = global.idleDelay
    
    // trigger selected tool movement behavior
    toolList[global.selectedToolIndex].mouseMove(global.mousePos)
}

function mouseDown(e){
    if( global.mouseDownDisabled ) return
    
    // update mouse position
    if( e.touches ){
        mouseMove(e.touches[0])
    } else {
        mouseMove(e)
    }
    
    global.mouseDown = true
    
    // trigger clickable gui
    let gui = global.allGuis[global.gameState]
    let clickedGui = gui.click()
    if( clickedGui ) return
    if( gui.hasHudInBackground ){
        let hud = global.allGuis[GameStates.playing]
        clickedGui = hud.click()
    }
    if( clickedGui ) return
    
    // or trigger selected tool
    toolList[global.selectedToolIndex].mouseDown(global.mousePos)
    
}
function mouseUp(e){
    global.mouseDownDisabled = false
    global.mouseDown = false
    
    // release tool if it was being held down
    toolList[global.selectedToolIndex].mouseUp(global.mousePos)
    
    global.allPois.forEach(p => p.isHeld = false )
}

let allPressurePatterns = [
    new SpinPressurePattern(),
    new ShakePressurePattern(),
]


function randomPressurePattern(){
    return randChoice(allPressurePatterns)
}



function randomReleasePattern(...p){
    return new SimpleRingReleasePattern(...p)
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


const toolList = [
    new DefaultTool(),
    new BuildTool(),
]



function update(dt) {    
    
    // check for resized window
    fitToContainer()    
    
    // advance countdown for user to be considered idle
    if( global.idleCountdown > 0 ){
        global.idleCountdown -= dt
    }
    
    // update gui hovering status and tooltip 
    global.tooltipPopup = null
    if( global.allGuis[global.gameState].hasHudInBackground ){
        global.allGuis[GameStates.playing].update(dt) // hud may set global.tooltipPopup
    }
    global.allGuis[global.gameState].update(dt) // gui in front may set global.tooltipPopup
    
    //// stop if game is paused
    if( global.gameState==GameStates.pauseMenu ) return
    
    global.t += dt
    
    // trigger passive tool behavior
    toolList[global.selectedToolIndex].update(dt)
    
    // upgrades menu transtiino effect
    global.allGuis[GameStates.upgradeMenu].updateTransitionEffect(dt)
    
    // shrink all pois and prepare for draw
    global.allPois = global.allPois.filter( p => p.update(dt) )
    
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
        
        let sc = [v(xr,yr),v(1-xr,yr),v(1-xr,1-yr),v(xr,1-yr)]
        global.screenCorners = sc 
        global.screenRect = [sc[0].x,sc[0].y,(sc[2].x-sc[0].x),(sc[2].y-sc[0].y)]
        rebuildGuis() //game_states.js
    }
}



// Initialize the game
function init() {
    
    var cvs = document.getElementById("gameCanvas");
      cvs.style.width='100%';
      cvs.style.height='100%';  
    cvs.addEventListener("mousemove", function(e){global.debug='MM',global.dminput||mouseMove(e)});
    cvs.addEventListener("mousedown", function(e){global.debug='MD',global.dminput||mouseDown(e)});
    cvs.addEventListener("mouseup", function(e){global.debug='MU',global.dminput||mouseUp(e)});
    cvs.addEventListener("touchstart", function(e){global.dminput=true,global.debug='TS',mouseDown(e)}, false);
    cvs.addEventListener('touchend', function(e){global.dminput=true,global.debug='TE',mouseUp(e)}, false );
    cvs.addEventListener('touchcancel', function(e){global.dminput=true,global.debug='TC',mouseUp(e)}, false );
    
    // https://stackoverflow.com/a/63469884
    var previousTouch;
    cvs.addEventListener("touchmove", (e) => {
        global.debug = 'TM'
        const touch = e.touches[0];
        mouseMove({
            clientX: touch.pageX,
            clientY: touch.pageY
        })
        e.preventDefault()
    });
    
    document.addEventListener("keydown", keyDown )
    document.addEventListener("keyup", keyUp )
    
    document.querySelector('body').addEventListener('contextmenu', (event) => {
      event.preventDefault();
    })
    global.canvas = cvs
    global.ctx = cvs.getContext("2d");
    
    // go to start menu
    quit()
    
    //
    requestAnimationFrame(gameLoop);
}

function resetGame(){
    
    // init start menu background sim
    global.nParticles = 1000
    global.particlesCollected = 0
    global.grabbedParticles = new Set()
    global.allPois = []
    global.activeReleasePatterns = []
    
    
    resetRand(hard = true)
    fitToContainer()   
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


