
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

// a geodesic is a circle that intersects with the 
// edge of the poincare disk at right angles

class Geodesic{
    constructor(center,radius){
        this.center = center
        this.radius = radius
    }
    
    // construct geodesic containing points p and q
    static withPoints(p,q){
        var pi = invert(p)
        var qi = invert(q)
        var n = perp_bisect(p,pi)
        var m = perp_bisect(q,qi)
        var c = intersection(n,m)
        var r = c.sub(p).getMagnitude()
        return new Geodesic(c,r)
    }
    
    draw(g){
        g.beginPath()
        this.path(g)
        g.stroke()
    }
    
    path(g){
        g.arc(
            this.center.x, this.center.y, 
            this.radius, 0,Math.PI*2)
    }
}

// a segment of a geodesic

class GeoSegment extends Geodesic{
    constructor(center,radius,a1,a2,p=null,q=null){
        super(center,radius)
        this.a1 = a1
        this.a2 = a2
        this.p = p || center.add(Vector.polar(a1,radius))
        this.q = q || center.add(Vector.polar(a2,radius))
        
        if( Math.abs(cleanAngle(a1-a2)) < 10e-4 ){
            this.straight = true
        }
    }
    
    // construct segment connecting points p and q
    static betweenPoints(p,q){
        var geo = Geodesic.withPoints(p,q)
        var c = geo.center
        var r = geo.radius
        var a1 = cleanAngle(p.sub(c).getAngle())
        var a2 = cleanAngle(q.sub(c).getAngle())
        var a = cleanAngle(a2 - a1)
        
        if( a < 0 ){
            var t = a2
            a2 = a1
            a1 = t
        }
        
        return new GeoSegment( c, r, a1, a2, p, q )
    }
    
    // get point on segment
    getMidPoint(r=.5){
        var a = midpoint( this.p, this.q, r ).sub( this.center ).getAngle()
        return this.center.add( Vector.polar( a, this.radius ) ) 
    }
    
    // assuming the given point is on our geodesic,
    // return true if it is contained in thie segment
    containsPoint(p){
        var a = p.sub(this.center).getAngle()
        var da = Math.abs(this.a1-this.a2)
        var d1 = Math.abs(cleanAngle(a-this.a1))
        var d2 = Math.abs(cleanAngle(a-this.a2))
        return (d1<=da) & (d2<=da)
    }
    
    // get intersection point with another segment
    // or null if they do not intersect
    intersect(o){
        var cints = circle_intersections( this.center, this.radius, o.center, o.radius )
        return cints.find( ci => ((ci.getMagnitude() < crad) && this.containsPoint(ci) && o.containsPoint(ci)) )
    }
    
    draw(g){
        g.beginPath()
        
        if( this.straight ){
            g.moveTo(this.p.x,this.p.y)
            g.lineTo(this.q.x,this.q.y)
            
        } else {
            g.arc(this.center.x, this.center.y, 
                this.radius, this.a1, this.a2)
        }
        
        g.stroke()
    }
}

// ball moving along a geodesic,

// moves a constant hyperbolic distance per ms
class Ball {
    
    // geo - the geodesic fo this ball to follow
    // angle - the position on the geodesic
    // speed - hyperbolic distance per millisecond
    constructor( geo, angle, speed ){
        this.geo = geo
        this.angle = angle
        this.speed = speed
        this.updatePos()
    }
    
    // construct ball with given position and velocity
    static fromPosVel( pos, vel ){
        var a = pos
        var b = pos.add(Vector.polar(vel.getAngle(),1e-2))
        var geo = Geodesic.withPoints(a,b)
        var angle = a.sub(geo.center).getAngle()
        var speed = vel.getMagnitude() * getDistScaleFactor(pos)
        if( isClockwise( a, b, geo.center ) ){
            speed *= -1
        }
        speed *= (1.0-bounceLoss)
        return new Ball( geo, angle, speed )
    }
    
    // get path segment assuming no obstacles
    getPath(){
        var start = this.geo.center.add( Vector.polar( this.angle, this.geo.radius) )
        var end = this.geo.center.add( Vector.polar( this.angle+.9*pi*Math.sign(this.speed), this.geo.radius) )
        var seg = GeoSegment.betweenPoints( start, end )
        return seg
    }
    
    
    // get path from current pos to next obstacle
    // return null if no obstacles
    getNextIntersection(debug=false){
        
        if( this.nextInt ){
            return this.nextInt
        }
        
        var start = this.geo.center.add( Vector.polar( this.angle, this.geo.radius) )
        var end = this.geo.center.add( Vector.polar( this.angle+.9*pi*Math.sign(this.speed), this.geo.radius) )
        var seg = GeoSegment.betweenPoints( start, end )
        
        var cw = isClockwise( start,end, seg.center )
        
        var wints = []
        allWalls.forEach(w => {
            let wint = seg.intersect(w)
            
            
            if( wint ){
                if(debug) debugPoints.push(wint)
                if( cw != isClockwise( start, wint, this.geo.center ) ){
                    return
                }
                wint.wa = wint.sub(w.center).getAngle()
                wints.push(wint)
                //debugPoints.push(wint)
            }     
        })
        
        if(debug) return seg
        
        if( wints.length == 0 ){
            return null
        }
        
        wints.forEach(wint => {
            wint.a = wint.sub(this.geo.center).getAngle()
            wint.dist = wint.sub(start).getMagnitude()
        })
        
                
        wints.sort(function(a, b) {
            return a.dist-b.dist
        });
        
        this.targetAngle = wints[0].a
        var start = this.geo.center.add( Vector.polar( this.angle, this.geo.radius) )
        var end = this.geo.center.add( Vector.polar( this.targetAngle, this.geo.radius) )
        var cw = isClockwise( this.geo.center, start, end )
        
        this.nextInt = GeoSegment.betweenPoints(start, end)
        this.nextInt.a = wints[0].a + (cw ? -pio2 : pio2 )
        this.nextInt.wa = wints[0].wa
        return this.nextInt
    }
    
    // get ball instance to replace this on the next bounce
    // return null if no obstacles in path
    getNextBall(){
        var nextInt = this.getNextIntersection()
        if( !nextInt ){
            return null
        }
        
        if( this.nextBall ){
            return this.nextBall
        }
        
        //compute trajectory after bounce
        var a = nextInt.q
        var angle = nextInt.a
        var wangle = nextInt.wa + pio2
        
        var params = this._bounce(a,angle,wangle)
        var nextBall = new Ball( ...params )
        nextBall.updatePos()
        
        var dt = 1
        var da = nextBall.angularVel * dt
        nextBall.angle += da
        
        this.nextBall = nextBall
        return this.nextBall
    }
    
    updatePos(){
        
        // compute euclidian distance from center
        this.pos = this.geo.center.add(Vector.polar( this.angle, this.geo.radius ) )
        
        // compute hyperbolic distance scale factor
        this.ds = getDistScaleFactor(this.pos)
        
        this.angularVel = this.speed*this.ds / this.geo.radius
    }
    
    update(dt){
        this.updatePos()
        var da = this.angularVel * dt
        var prad = this.pos.getMagnitude()
        
        // check for intersections with walls
        var bounced = false
        var seg = new GeoSegment( this.geo.center, this.geo.radius, this.angle, this.angle+da )
        allWalls.every(w => {
            let wint = seg.intersect(w)
            if( wint ){
                this.bounce(w,wint,da)
                return false
            }               
            return true
        })
        
        // move forward
        var da = this.angularVel * dt
        this.angle += da
        this.speed *= (1.0-friction*dt)
    }
    
    // used in update
    bounce(w,wint,da){
        
        var nextPos = this.geo.center.add(Vector.polar( this.angle+da, this.geo.radius ) )
        var d = nextPos.sub(this.pos)
        var a = this.pos
        var angle = d.getAngle()
        var wangle = wint.sub(w.center).getAngle() + pio2
        var params = this._bounce(a,angle,wangle)
        this.geo = params[0]
        this.angle = params[1]
        this.speed = params[2]
        this.updatePos()
    }
    
    _bounce(a,angle,wangle){
        var newAngle = 2*wangle - angle
        var b = a.add(Vector.polar(newAngle,1e-3))
        var geo = Geodesic.withPoints(a,b)
        var gangle = a.sub(geo.center).getAngle()
        var speed = Math.abs(this.speed)
        if( isClockwise( a, b, geo.center ) ){
            speed *= -1
        }
        speed *= (1.0-bounceLoss)
        
        //debugEuclidSegs.push([a,a.add(Vector.polar(angle,1e-1)),'green'])
        //debugEuclidSegs.push([a,a.add(Vector.polar(wangle,1e-1)),'red'])
        //debugEuclidSegs.push([a,a.add(Vector.polar(newAngle,1e-1)),'blue'])
        
        return [geo,gangle,speed]
    }
    
    draw(g){
        //this.geo.draw(g)
        g.beginPath()
        g.arc( this.pos.x, this.pos.y, playerEuclidRad, 0, Math.PI*2 )
        g.fill()
    }
}

// shorthand
var pio2 = Math.PI/2
var pi = Math.PI
var twopi = 2*Math.PI
function v(){
    return new Vector(...arguments)
}

// compute hyperbolic distance bewteen points p and q
function hdist(p,q){
    var geo = Geodesic.withPoints(p,q)
    var ab = circle_intersections(geo.center, geo.radius, center, crad)
    var ad = [p.sub(ab[0]).getMagnitude(), q.sub(ab[0]).getMagnitude()]
    var bd = [p.sub(ab[1]).getMagnitude(), q.sub(ab[1]).getMagnitude()]
    return Math.log( (Math.max(...ad)*Math.max(...bd)) / (Math.min(...ad)*Math.min(...bd)) )
}


// construct geodesic containing points p and q
// return center and radius of geodesic
function geodesic(p,q){
    var pi = invert(p)
    var qi = invert(q)
    var n = perp_bisect(p,pi)
    var m = perp_bisect(q,qi)
    var c = intersection(n,m)
    var r = c.sub(p).getMagnitude()
    return [c,r]
}

// compute arc length of geodesic on disk
function geo_arclength(c,r){
    var dints = circle_intersections(c,r,center,crad)
    var da = Math.abs(dints[1].sub(c).getAngle() - dints[0].sub(c).getAngle())
    if( da > Math.PI ){
        da = 2*Math.PI - da
    }
    return twopi*r * (da/twopi)
}

// compute points where the given geodesic intersects the disk
function circle_intersections(c1,r1,c2,r2){
    var d = c2.sub(c1)
    var dist = d.getMagnitude()
    
    var a = ((r1*r1) - (r2*r2) + (dist*dist)) / (2.0 * dist)
    var x2 = c1.x + (d.x * a/dist);
    var y2 = c1.y + (d.y * a/dist);
    var h = Math.sqrt((r1*r1) - (a*a));
    var rx = -d.y * (h/dist);
    var ry = d.x * (h/dist);
    
    var xi = x2 + rx;
    var xi_prime = x2 - rx;
    var yi = y2 + ry;
    var yi_prime = y2 - ry;
    
    return [
        new Vector(xi,yi),
        new Vector(xi_prime,yi_prime)
    ]
}

// circle inversion of xy point
function invert(p){
    
    var d = p.sub(center)
    var dist = d.getMagnitude()
    var angle = d.getAngle()
    var r = dist/crad
    return center.add( Vector.polar( angle, crad/r ) )
    
}


// compute perpendicular bisector line of the given segment
// return a list of two xy points on the result line
function perp_bisect( a, b ){
    var mid = midpoint(a,b)
    var angle = b.sub(a).getAngle() + pio2
    var d = Vector.polar( angle, 10 )
    return [
        mid.sub(d),mid.add(d)
    ]
}

// compute intersection point of two lines
// the two lines are described by pairs of points
// requires two lists, each containing 2 xy points
function intersection( ab1, ab2 ){
    var mb1 = mb(...ab1)
    var mb2 = mb(...ab2)
    //m1*x+b1 = m2*x+b2
    //m1*x-m2*x = b2-b1
    //x = (b2-b1)/(m1-m2)
    var x = (mb2.b-mb1.b)/(mb1.m-mb2.m)
    var y = mb1.m*x + mb1.b
    return new Vector( x, y )
}

// estimate scale factor at the given position
// euclidian distance vs hyperbolic distance
function getDistScaleFactor(p){
    var r = p.getMagnitude() / crad
    var dsi = Math.min(dscales.length-1, Math.floor(r*dscales.length))
    return 1/dscales[dsi]
}

// compute slope and intercept
// euclidean line with points a and b
function mb(a,b){
    var m = (b.y-a.y)/(b.x-a.x)
    var b = a.y - m*a.x 
    return {m:m,b:b}
}

// euclidean midpoint
function midpoint(a,b,r=.5){
    return a.mul(1.0-r).add(b.mul(r))
}

function isClockwise(p, q, r) {
    var crossProduct = (q.x - p.x) * (r.y - q.y) - (q.y - p.y) * (r.x - q.x);
    return (crossProduct < 0)
}

function cleanAngle(a){
    if( a > Math.PI ){
        a -= twopi
    }
    if( a < -Math.PI ){
        a += twopi
    }
    return a        
}

// get line segments tracing regular polygon in hyperbolic space
// radius is euclidian sdistance of verts from disk center
function getPolygonSegs( r, n, angleOffset=.1 ){
    
    var da = twopi / n
    var corners = []
    for( let i = 0 ; i < n ; i++ ){
        corners.push( Vector.polar( da*i+angleOffset, r ) )
    }
    return getSegs(corners)
}

// get line segments tracing the given vertices
function getSegs(verts){
    
    var result = []
    for( let i = 0 ; i < verts.length ; i++ ) {
        result.push( GeoSegment.betweenPoints( verts[i], verts[(i+1)%verts.length] ) ) 
    }
    return result
}

class Level{
    constructor(){
        
    }
    
    getStartPos(){
        throw Error('not implemented')
    }
    
    getTargetPos(){
        throw Error('not implemented')
    }
    
    getObstactles(){
        throw Error('not implemented')
    }
}

class Level1 extends Level {

    getStartPos(){
        return v(-.2,.2)
    }
    
    getTargetPos(){
        return v(.2,-.2)
    }

    getObstacles(){   
        return getPolygonSegs( .6, 10 )
    }
    
}

class Level1a extends Level {

    getStartPos(){
        return v(-.1,.3)
    }
    
    getTargetPos(){
        return v(0,-.6)
    }

    getObstacles(){   
        var lr = .4
        var r = .5
        var br = .7
        return getSegs( [v(-lr,r),v(-lr,-r),v(0,-br),v(lr,-r),v(lr,r),v(0,br)] )
    }
    
}

class Level2 extends Level {

    getStartPos(){
        return v(-.2,.2)
    }
    
    getTargetPos(){
        return v(.295,-.67)
    }

    getObstacles(){   
        return getPolygonSegs( .8, 10 )
    }
    
}

class Level3 extends Level {

    getStartPos(){
        return v(-.2,.2)
    }
    
    getTargetPos(){
        return v(.2,-.4)
    }

    getObstacles(){   
        return getPolygonSegs( .7, 5 ).concat( getPolygonSegs( .15, 5 ) )
    }
    
}

class Level4 extends Level {

    getStartPos(){
        return v(-.4,.4)
    }
    
    getTargetPos(){
        return v(.2,-.4)
    }

    getObstacles(){   
        return []
    }
    
}

class Level5 extends Level {

    getStartPos(){
        return v(-.2,.2)
    }
    
    getTargetPos(){
        return v(.2,-.4)
    }

    getObstacles(){   
        return getPolygonSegs( .15, 5 )
    }
    
}


var levelList = [
    new Level1(),
    new Level1a(),
    new Level2(),
    new Level3(),
    new Level4(),
    new Level5(),
]

var levelListIndex = -1

function getNextLevel(){
    levelListIndex = (levelListIndex+1)%levelList.length
    return levelList[levelListIndex]
}


    
function drawp(p,color){
    
    var rad = .04*getDistScaleFactor(p)
    
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(p.x,p.y,rad,0,2*Math.PI)
    ctx.fill()
}

function drawc(p,r,color,fill=false){
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.arc(p.x,p.y,r,0,Math.PI*2)
    ctx.stroke()
    if( fill ){
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x,p.y,r,0,Math.PI*2)
        ctx.fill()
    }
}

function drawl(a,b,color){
    ctx.strokeStyle = color
    ctx.lineWidth = .001
    ctx.beginPath()
    ctx.moveTo(a.x,a.y)
    ctx.lineTo(b.x,b.y)
    ctx.stroke()
}
    
// Render graphics
function draw(fps, t) {
   
    ctx.fillStyle = backgroundColor
    ctx.fillRect( 0, 0, canvas.width, canvas.height )
    ctx.setTransform(canvasScale, 0, 0, canvasScale, canvasOffsetX, canvasOffsetY);
    // test
    //ctx.fillStyle = 'black'
    //ctx.fillRect( .25,.25,.5,.5 )
    
    //clip edges
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = "white";
    ctx.fillRect(-1,-1,2,2)
    ctx.globalCompositeOperation = 'source-over'
    
    // draw mouse position
    //drawp(mousePos,'red')
    
    // draw second position
    //drawp(secondPos,'blue')
    
    
    // draw edge circle
    ctx.lineWidth = .006
    drawc(center,crad,'black')
    
    //walls
    ctx.lineWidth = .004
    ctx.strokeStyle = 'black'
    allWalls.forEach(w => {
        //ctx.strokeStyle = w.intersect(aimSeg) ? 'red' : 'black'
        w.draw(ctx)
    })
    
    // target
    drawc( targetPos, targetEuclidRad, 'black', fill = true )
    
    //balls
    ctx.fillStyle = 'blue'
    ctx.strokeStyle = 'blue'
    all_balls.forEach(b => b.draw(ctx) )
    playerBall.draw(ctx)
    
    // aiming cursor
    ctx.lineWidth = .005
    //aimSeg.draw(ctx)
    if( aimGeo ) drawAimIndicator()
    
    debugPoints.forEach(p => drawp(p,'red'))
    debugEuclidSegs.forEach(abc => drawl(...abc))
    
    // clip outside of disk
    ctx.beginPath();
    ctx.arc(0,0,crad,0,twopi)
    ctx.closePath();
    ctx.globalCompositeOperation = 'destination-in';
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    
    // draw reset button
    ctx.lineWidth = .004
    var hoverReset = mouseInResetButton()
    drawc( ...resetButton, '#FAA', fill=hoverReset)
    drawc( ...resetButton, 'red')
    ctx.font = ".05px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = 'middle';
    ctx.fillStyle = "black";
    var x = .4
    var y = .4
    ctx.fillText("RESET", resetButton[0].x, resetButton[0].y+.01 );
    if( hoverReset ){
        return
    }
    
    
    // Draw FPS on the screen
    //ctx.font = ".025px Arial";
    //ctx.textAlign = "left";
    //ctx.fillStyle = "black";
    //var x = .4
    //var y = .4
    //ctx.fillText("FPS: " + fps, x, y);
    
    
    // draw mouse location
    //if( mouse_forget_countdown > 0 ){
    //    ctx.fillStyle = "red"
    //    ctx.beginPath()
    //    ctx.arc( canvasMouseX, canvasMouseY, 10, 0, Math.PI*2 )
    //    ctx.fill()
    //}
    
    //y += 30
    //ctx.fillText(`camera: ${cameraX.toFixed(2)}, ${cameraY.toFixed(2)}, ${zoomLevel.toFixed(2)}`, x, y);
    //y += 30
    //ctx.fillText(gameState, x, y);
    //y += .03
    //ctx.fillText(`canvas pos: ${canvasMousePos.x}, ${canvasMousePos.y}`, x, y);
    //y += .03
    //ctx.fillText(`virtual pos: ${mousePos.x}, ${mousePos.y}`, x, y);
}

function drawAimIndicator(){
    
    if( !ballIsHittable() ){
        return
    }
    
    ctx.strokeStyle = 'black'
    ctx.lineWidth = .001
    if( aimGeo ) aimGeo.draw(ctx)
    
    if( aimArrowSeg ){
        ctx.strokeStyle = '#AAF'
        ctx.lineWidth = .01
        var dash = .1*aimStrength
        var b = null
        for( var i = 0 ; i < 2 ; i++ ){
            if( b == null ){
                b = aimBall
            } else {
                b = b.getNextBall()
            }
            var laserSeg = b.getNextIntersection()
            if( !laserSeg ){
                b.getPath().draw(ctx)
                break
            }
            laserSeg.draw(ctx)
        }
    }
    
    var basethickness = aimStrength*.5
    var headBasePos = aimArrowSeg.getMidPoint(.7)
    var tailPos = aimTailPos
    var tipPos = aimArrowSeg.getMidPoint(.9)
    
    var headBaseAngle = headBasePos.sub(aimGeo.center).getAngle()
    var tailAngle = tailPos.sub(aimGeo.center).getAngle()
    if( false & aimClockwise ){
        var t = headBaseAngle
        headBaseAngle = tailAngle
        tailAngle = t
    }
    
    var tailThickness = basethickness*getDistScaleFactor(aimTailPos)
    var tailNorm = Vector.polar( tailAngle, tailThickness/2 )
    
    var headBaseThickness = basethickness*getDistScaleFactor(headBasePos)
    var headBaseNorm = Vector.polar( headBaseAngle, headBaseThickness/2 )
    var headFlairNorm = headBaseNorm.mul(2)
    
    var verts = [
        aimTailPos.add(tailNorm),
        headBasePos.add(headBaseNorm),
        headBasePos.add(headFlairNorm),
        tipPos,
        headBasePos.sub(headFlairNorm),
        headBasePos.sub(headBaseNorm),
        aimTailPos.sub(tailNorm),
    ]
    
    ctx.strokeStyle = 'blue'
    ctx.lineWidth = .008
    ctx.lineCap = 'round'
    for( var i = 0 ; i < verts.length ; i++ ){
        GeoSegment.betweenPoints( verts[i], verts[(i+1)%verts.length] ).draw(ctx)
    }
}

function updateMousePos(event){
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    
    canvasMousePos = new Vector( 
        (event.clientX - rect.left) * scaleX, 
        (event.clientY - rect.top) * scaleY 
    
    )
    mousePos = new Vector( 
        virtualMouseX = (canvasMousePos.x-canvasOffsetX)/canvasScale, 
        virtualMouseY = (canvasMousePos.y-canvasOffsetY)/canvasScale
    )
    
    updateAim()
}


function mouseInResetButton(){
    if( !mousePos ){
        return false
    }
    return mousePos.sub(resetButton[0]).getMagnitude() < resetButton[1]
}

// touch device
function touchStart(event){
    isMobileDevice = true
    updateMousePos(event.touches[0])
    
}
function touchMove(event){
    isMobileDevice = true
    updateMousePos(event.touches[0])
}
function touchEnd(event){
    isMobileDevice = true
    if( mouseInResetButton() ){
        resetLevel()
    } else {
        playerHitBall()
    }
}

function mouseMove(event){
    if(isMobileDevice) return
    updateMousePos(event)
}

function mouseClick(event){   
    if(isMobileDevice) return
    updateMousePos(event)
    
    if( mouseInResetButton() ){
        resetLevel()
    } else {
        playerHitBall()
    }
}



// Initialize the game
function init() {
    canvas = document.getElementById("gameCanvas");
    canvas.addEventListener("touchstart", touchStart);
    canvas.addEventListener("touchmove", touchMove);
    canvas.addEventListener("touchend", touchEnd);
    canvas.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("click", mouseClick);
    ctx = canvas.getContext("2d");   
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


    msPassed = Math.max( 10, Math.min(msPassed,15) )

    update(msPassed);
    draw(fps);

    requestAnimationFrame(gameLoop);
}


// Initialize the game
init();



function fitToContainer(){
  canvas.style.width='100%';
  canvas.style.height='100%';  
  canvas.width  = canvas.offsetWidth/graphics_scale;
  canvas.height = canvas.offsetHeight/graphics_scale;
  
    
    var padding = 10; // Padding around the square region
    var dimension = Math.min(canvas.width, canvas.height) - padding * 2;
    canvasScale = dimension/2;
    canvasOffsetX = canvas.width/2;
    canvasOffsetY = canvas.height/2;
}

function update(dt) {
    debugPoints = []
    debugEuclidSegs = []
    fitToContainer()
    
    all_balls.forEach( b => b.update(dt) )
    playerBall.update(dt)
    
    updateAim()
    
    playerEuclidRad = playerBallRadius*getDistScaleFactor(playerBall.pos)
    targetEuclidRad = targetRadius*getDistScaleFactor(targetPos)
    
    // check if target was hit
    var d = playerBall.pos.sub(targetPos).getMagnitude()
    if( d < targetEuclidRad ){
        ballHitTarget()
    }
}

function updateAim(){
    if( !mousePos ){
        return
    }
    
    aimGeo = Geodesic.withPoints(mousePos,playerBall.pos)
    var angle = playerBall.pos.sub(aimGeo.center).getAngle()
    var tailHLen = 1 //hyperbolic
    var tailLen = tailHLen * getDistScaleFactor(playerBall.pos)//euclidian
    var da = tailLen / aimGeo.radius
    var mouseDa = Math.abs(cleanAngle(mousePos.sub(aimGeo.center).getAngle() - angle))
    var da = Math.min( da, mouseDa )
    aimClockwise = isClockwise(playerBall.pos, aimGeo.center, mousePos )
    if( aimClockwise ){
        da *= -1
    }
    aimStrength = da*aimGeo.radius
    aimTailPos = aimGeo.center.add( Vector.polar( angle-da, aimGeo.radius ) )
    aimArrowSeg = GeoSegment.betweenPoints(aimTailPos, playerBall.pos)

    angle = playerBall.pos.sub(aimGeo.center).getAngle()
    var speed = 2e-2 * Math.abs(aimStrength)
    if( isClockwise(playerBall.pos, aimGeo.center, mousePos ) ){
        speed *= -1
    }
    aimBall = new Ball( aimGeo, angle, speed )
}



// return true if the ball is
// not moving much and is ready to be hit by the player
function ballIsHittable(){
    return Math.abs(playerBall.speed) < 1e-4   
}

// set ball trajectory
// moving away from the mouse
function playerHitBall(){
    if( (!aimBall) || (!ballIsHittable()) ) return
    playerBall = aimBall
}

// player clicked red button
// also called on game start and level advancement
function resetLevel(){
    playerBall = Ball.fromPosVel(startPos,v(2e-5,1e-5))
    aimGeo = null
    mousePos = null
}

// called when ball is contained in target
function ballHitTarget(){
    advanceLevel()
}

// called on game start
// called after hitting target
function advanceLevel(){
    currentLevel = getNextLevel()
    allWalls = currentLevel.getObstacles()
    startPos = currentLevel.getStartPos()
    targetPos = currentLevel.getTargetPos()
    resetLevel()
}


// graphics context
var canvas;
var ctx;
var graphics_scale = 1;

// tranlsate pixels on canvas to internal units
var canvasOffsetX = 0
var canvasOffsetY = 0
var canvasScale = 0

var backgroundColor = '#DDD'

// parameters for poincare disk
var center = new Vector(0,0)
var crad = .85

// compute distance scaling factors
// at varying radii on disk
var delta = 1e-4
var nsteps = 1000
var dx = crad / nsteps
var dscales = []
for( var x = dx ; x < crad ; x += dx ){
    let a = new Vector( x+delta, -delta )
    let b = new Vector( x+delta, delta )
    let d = hdist(a,b)
    let r = d / (delta*2)
    dscales.push(r)
}


// game physics
var bounceLoss = 1e-1 // fraction of speed lost on bounce
var friction = 1e-3 // fraction of speed lost per ms

playerBallRadius = .05 //hyperbolic
targetRadius = .1 
playerEuclidRad = 0 // euclidian computed on update
targetEuclidRad = 0 

// game objects
var currentLevel = null
var startPos = null
var targetPos = null
var allWalls = null
var playerBall = null
advanceLevel()



var aimGeo = null
var aimArrowSeg = null
var aimTailPos = null
var aimStrength = 0 // ball (hyperbolic) speed multiplier
var aimClockwise = false
var aimBall = null

var debugPoints = []
var debugEuclidSegs = []

var all_balls = []

//geo = new Geodesic( new Vector(,),  )
//angle = 

//geo = new Geodesic( new Vector(1.025652065835253,0.22327813368886673),0.6158857727985811  )
//angle = -2.971543910049636


/*
var all_balls = []
for( var i = 0 ; i < 10 ; i++ ){
    a = Vector.polar( Math.random()*twopi, .1 )
    b = Vector.polar( Math.random()*twopi, .1 )
    geo = Geodesic.withPoints(a,b)
    angle = a.sub(geo.center).getAngle()
    all_balls.push( new Ball( geo,angle ) )
}
*/


var resetButton = [v(.8,.8),.15]


// mouse
var isMobileDevice = false
var canvasMousePos = null //pixels on canvas
var mousePos = null //internal units


