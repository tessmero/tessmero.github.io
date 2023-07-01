

function computeNearestPointOnPolygon(point, polygon) {

  let nearestPoint = null;
  let shortestDistance = Infinity;

  // Iterate through each edge of the polygon
  for (let i = 0; i < polygon.length; i++) {
    const currentPoint = polygon[i];
    const nextPoint = polygon[(i + 1) % polygon.length];

    // Compute the nearest point on the current edge
    const edgePoint = computeNearestPointOnEdge(point, currentPoint, nextPoint);

    // Compute the distance between the input point and the edge point
    const distance = computeDistance(point, edgePoint);

    // Update the nearest point if the distance is shorter
    if (distance < shortestDistance) {
      nearestPoint = edgePoint;
      shortestDistance = distance;
    }
  }

  return nearestPoint;
}

function computeNearestPointOnEdge(point, start, end) {
  // Compute the vector representing the edge
  const edgeVector = { x: end.x - start.x, y: end.y - start.y };

  // Compute the vector from the start point to the input point
  const pointVector = { x: point.x - start.x, y: point.y - start.y };

  // Compute the dot product of the edge vector and the point vector
  const dotProduct = pointVector.x * edgeVector.x + pointVector.y * edgeVector.y;

  // Compute the squared length of the edge vector
  const edgeLengthSquared = edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y;

  // Compute the parameter value along the edge
  const t = dotProduct / edgeLengthSquared;

  // Clamp the parameter value to the range [0, 1]
  const clampedT = Math.max(0, Math.min(1, t));

  // Compute the nearest point on the edge
  const nearestPoint = new Vector(
    start.x + clampedT * edgeVector.x,
    start.y + clampedT * edgeVector.y
  );

  return nearestPoint;
}

// return angle of incidence or null
function computeIntersection(line1Start, line1End, line2Start, line2End) {
  const denominator =
    (line2End.y - line2Start.y) * (line1End.x - line1Start.x) -
    (line2End.x - line2Start.x) * (line1End.y - line1Start.y);

  if (denominator === 0) {
    // The lines are parallel or coincident, so there is no intersection
    return null;
  }

  const ua =
    ((line2End.x - line2Start.x) * (line1Start.y - line2Start.y) -
      (line2End.y - line2Start.y) * (line1Start.x - line2Start.x)) /
    denominator;
  const ub =
    ((line1End.x - line1Start.x) * (line1Start.y - line2Start.y) -
      (line1End.y - line1Start.y) * (line1Start.x - line2Start.x)) /
    denominator;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    // The line segments intersect, so compute the intersection point
    //const intersectionX = line1Start.x + ua * (line1End.x - line1Start.x);
    //const intersectionY = line1Start.y + ua * (line1End.y - line1Start.y);
    //return new Vector( intersectionX, intersectionY );
    return Math.PI/2
        + Math.atan2( line2End.y-line2Start.y, line2End.x-line2Start.x )
        - Math.atan2( line1End.y-line1Start.y, line1End.x-line1Start.x )
  } else {
    // The line segments do not intersect
    return null;
  }
}

function isPointInsidePolygon(point, polygon) {
  // Ray casting algorithm to determine if the point is inside the polygon
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
          yi = polygon[i].y;
    const xj = polygon[j].x,
          yj = polygon[j].y;

    const intersect = ((yi > point.y) != (yj > point.y)) &&
      (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);

    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
}


function computeDistance(point1, point2) {
  // Compute the Euclidean distance between two points
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
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

// physics-enabled joint/vertex/particle

class Point {
    constructor( pos, vel, rad ){
        this.pos = pos
        this.vel = vel
        this.rad = rad
        
        this.bouyancyMultiplier = 1
        this.wallFrictionMultiplier = 0
        this.springs = []
    }
    
    copy(){
        return new Point(this.pos.copy(), this.vel.copy(), this.rad )
    }
    
    applyForce(f,dt){
        this.vel = this.vel.add(f.mul(dt))
    }
    
    update(dt, all_ents){
        
        this.vel = this.vel.add( gravity.mul(dt) )
        if( this.pos.y > puddleHeight ){
            if( this.parentPuppy ){
                this.parentPuppy.submerged = true
                submergedPointCount += 1
                this.vel = this.vel.add( startingBouyancy.mul(dt*this.bouyancyMultiplier*Math.pow(damageBouyancyPenalty,puppyDamage)) )
                this.vel = this.vel.add( puppySwimForce.mul(dt) )
            }
        }
        this.vel = this.vel.mul( (1.0-airFriction*dt) )
        
        var dp = this.vel.mul(dt)
        
        if( !this.passThroughWalls ) {
            //this.debug = false
            all_ents.filter( e => e instanceof Platform )
                    .forEach( plt => {
                
                /*
                var npos = w.getNp(this.pos)
                if( npos == null ){
                    continue
                }
                
                var d = npos.sub(this.pos).getMagnitude()
                if( d < this.rad ){
                    
                    // bounce
                    var speed = this.vel.getMagnitude()
                    var angle = this.vel.getAngle()
                    var newAngle = 2*w.angle - angle
                    this.vel = Vector.polar(newAngle,speed)
                }
                */
                
                // check current position
                var curr_cwnp = plt.collisionCheck(this)
                if( curr_cwnp ){
                    this.pos = curr_cwnp[0]
                }
                
                //check next positoin
                var next_p = this.copy()
                next_p.pos = this.pos.add(dp)
                var next_cwnp = plt.collisionCheck(next_p)
                if( next_cwnp ){
                    var w = next_cwnp[1]
                    var intr = computeIntersection(this.pos, next_p.pos, w.a, w.b)
                        
                        // bounce
                        var speed = this.vel.getMagnitude()
                        var angle = this.vel.getAngle()
                        var newAngle = 2*w.angle - angle
                        this.vel = Vector.polar(newAngle,speed*(1.0-bounceLoss))
                        if( w.vel ){
                            var dv = w.vel.sub(this.vel)
                            this.vel = this.vel.add( dv.mul(this.wallFrictionMultiplier*wallFriction*Math.cos(intr)) )
                        }
                }
                
            })
        }
        
        this.pos = this.pos.add(this.vel.mul(dt))
    }
    
    draw(g, debugColor='black'){
        if( this.debug ){
            g.fillStyle =  debugColor
            g.beginPath()
            g.arc( this.pos.x, this.pos.y, this.rad, 0, Math.PI*2 )
            g.fill()
        }
    }
}

// anchored obstacle for points to collide with

class Wall{
    constructor( a, b ){
        var d = b.sub(a)
        
        this.a = a
        this.b = b
        this.d = d 
        this.angle = d.getAngle()
        this.det = d.x*d.x + d.y*d.y
        this.vel = new Vector(0,0)
    }
    
    // get point on this wall, nearest to p
    getNp(p){
        var dp = p.sub(this.a)
        var r = (dp.x*this.d.x + dp.y*this.d.y) / this.det
        if(r<0) r = 0
        if(r>1) r = 1
        return this.a.add(this.d.mul(r))
    }
    
    getWallChildren(){ return this; }
    
    update(){}
   
    draw(g){
        g.strokeStyle = 'black'
        g.lineWidth = .001
        g.beginPath()
        g.moveTo( this.a.x, this.a.y )
        g.lineTo( this.b.x, this.b.y )
        g.stroke()
    }
}

// constraint between to points

class Spring {
    constructor(ball1, ball2, restLength) {
        this.ball1 = ball1;
        this.ball2 = ball2;
        this.restLength = restLength;
        this.prevLength = restLength;
        this.springConstant = 2e-3;
        this.dampingConstant = 1;
        
        ball1.springs.push(this)
        ball2.springs.push(this)
    }

    update(dt) {
        if( this.hitByBullet ){
            return
        }
        
        // Calculate the vector between the two balls
        let displacement = this.ball2.pos.sub(this.ball1.pos);

        // Calculate the current length of the spring
        let currentLength = displacement.getMagnitude();
        let dAngle = displacement.getAngle()

        // Calculate the force exerted by the spring
        let forceMagnitude = this.springConstant * (currentLength - this.restLength);
        let tooLong = true
        if( forceMagnitude < 0 ){
            tooLong = false
            dAngle += Math.PI
            forceMagnitude *= -1
        }

        // apply damping
        let relativeSpeed = (currentLength - this.prevLength) / dt
        if( tooLong == (relativeSpeed < 0) ){
            let dampingMagnitude = Math.abs(relativeSpeed) * this.dampingConstant
            forceMagnitude = Math.max( 0, forceMagnitude - dampingMagnitude )
        }
        this.prevLength = currentLength
        
        // Calculate the force vector
        let force = Vector.polar( dAngle, forceMagnitude )
        
        // Apply damping
        //let dampingForce = relativeVelocity.mul(this.dampingConstant);
        //force = force.sub(dampingForce);

        // Apply the force to the balls
        this.ball1.applyForce(force,dt);
        this.ball2.applyForce(force.mul(-1),dt);
    }

    draw(g) {
        if( this.debug ){
            g.strokeStyle = (this.hitByBullet ? 'red' : 'gray')
            g.lineWidth = .01;
            g.beginPath();
            g.moveTo(this.ball1.pos.x, this.ball1.pos.y);
            g.lineTo(this.ball2.pos.x, this.ball2.pos.y);
            g.stroke();
        }
    }
}








class PhysicsObject {
    
    constructor(){
        this.children = []
        this.deleteMe = false
    }
    
    update(dt, all_ents){
        if( !paused ){
            this.children.forEach(c => c.update(dt,all_ents))
        }
    }
    
    draw(g){
        this.children.forEach(c => c.draw(g))
    }
}

class Polygon extends PhysicsObject {
    
    constructor(pos,rad,n){
        super()
        
        var all_balls = []
        var a = .1
        var da = 2*Math.PI/n
        for( var i = 0 ; i < n ; i++ ){
            var pd = Vector.polar( a+da*i, rad )
            var p = pos.add( pd )
            var vel = new Vector( 0, 0 )
            all_balls.push( new Point( p, vel, .01 ) )
        }

        var all_springs = []
        for( var i = 0 ; i < n ; i++ ){
            for( var j = i+1 ; j < n ; j++ ){
                var a = all_balls[i]
                var b = all_balls[j]
                var d = a.pos.sub(b.pos).getMagnitude()
                all_springs.push(new Spring( a,b, d ))
            }
        }
        
        this.children = this.children.concat(all_balls).concat(all_springs)
    }
}

class Puppy extends PhysicsObject {
    
    constructor(pos){
        super()
        
        // structure specs
        var points = [
            [0,0],[1,0], //01 hips
            [0,.3],[1,.3], //23 feat
            [0,-.5],[1.,-.5], //45 top
            [1.3,-.5], //6 head
            [-.3,-.6] //7 tail
        ]
        var springs = [
            [0,1], //0 belly
            [0,2], //1 leg
            [0,3],[1,2], //23 animated
            [1,3], //4 leg
            
            [0,4],[1,5],[4,5],[0,5],[1,4], // top
            [2,4],[3,5], // 10 anim limiters
            
            [1,6],[5,6],[4,6],[0,6], //12 head support
            [1,7],[5,7],[4,7],[0,7], //16 tail support
        ]
        var gibs = [
            ['l',18], //tail
            
            //[0,1], // belly
            
            ['l',1],['l',4], // legs
            
            ['l',0],['l',5],['l',6],['l',7],['l',8],['l',9],
            //['r',1,0,4,5], //  top
            
            [.04,12], //head
        ]
        
        // structure scale/offset
        var m = .06
        var ox = 0
        var oy = 0
        
        // build structure
        var all_balls = []
        for( var i = 0 ; i < points.length ; i++ ){
            var p = new Vector( points[i][0]*m+ox, points[i][1]*m+oy ).add(pos)
            var vel = new Vector( 0, 0 )
            var ball = new Point( p, vel, .02 )
            ball.parentPuppy = this
            all_balls.push( ball )
        }
        this.feet = [all_balls[2],all_balls[3]]
        var all_springs = []
        for( var i = 0 ; i < springs.length ; i++ ){
            var a = all_balls[springs[i][0]]
            var b = all_balls[springs[i][1]]
            var d = a.pos.sub(b.pos).getMagnitude()
            var spring = new Spring( a,b, d )
            spring.parentPuppy = this
            all_springs.push(spring)
        }
        var all_gibs = []
        for( var i = 0 ; i < gibs.length ; i++ ){
            if( gibs[i][0] == 'r' ){
                var ps = gibs[i].slice(1).map(bi  => all_balls[bi])
                var gib = new RectGib( ps )
            } else if( gibs[i][0] == 'l' ){
                var gib = new LineGib( all_springs[gibs[i][1]] )
            } else {
                var gib = new FaceGib( all_springs[gibs[i][1]], gibs[i][0] )
                this.faceGib = gib
            }
            gib.parentPuppy = this
            all_gibs.push(gib)
        }
        
       // make some springs breakable
       this.breakSpecs = [
        //[0,[0,7,2,3,8,9,13,14,15,16,17]], //belly
        //[7,[0,7,2,3,8,9,13,14,15,16,17]], //back
        [18,[16,17,19],7], //tail
        //[12,[13,14,15]], //head
        [1,[3,10],2], //leg
        [4,[2,11],3], //leg
       ]
        all_springs.forEach( s => s.breakable = true )
        all_springs[0].breakable = false
        all_springs[5].breakable = false
        all_springs[6].breakable = false
        all_springs[7].breakable = false
        all_springs[12].breakable = false
        //this.breakSpecs.forEach( row => all_springs[row[0]].breakable = true )
       
        //adjust bouyancy
        all_balls[6].bouyancyMultiplier = 3 //head
        all_balls[5].bouyancyMultiplier = 3 //shoulder
        all_balls[7].bouyancyMultiplier = 2 //tail
        all_balls[0].bouyancyMultiplier = .2 //back hip
        all_balls[4].bouyancyMultiplier = .2 //back hip
        all_balls[2].bouyancyMultiplier = .2 //rear leg
        
        // leg animation specs
        this.animSprings = [all_springs[2],all_springs[3]]
        this.currDist = this.animSprings[0].restLength
        this.upDist = this.currDist
        this.shortDist = this.upDist * .8
        this.longDist = this.upDist * 1.2
        this.restDist = this.upDist * 1.3
        this.animTime = 0
        this.animSpeed = 3e-4 // dist units per ms
        this.phaseIndex = 1
        
        this.animPeriod = 150 // ms
        this.minPhaseDuration = 1000 
        this.maxPhaseDuration = 3000 
        this.phaseCountdown = 0 
        
        // wag animation specs
        this.currWag = 0 //radians
        this.minWag = 0 //radians
        this.maxWag = 1 //radians
        this.wagSpeed = 2e-2 // radians per ms
        this.wagPeriod = 80 // ms
        this.wagChild = all_gibs[0]
        this.wagChild.lineWidth = .03
        
        
        // assign member vars
        this.all_springs = all_springs
        this.all_balls = all_balls
        
        //this.children = all_balls.concat(all_springs).concat(all_gibs)
        this.children = all_gibs.concat(all_springs).concat(all_balls)
        
    }
    
    isOffScreen(){
        var miny = 1.05
        return (this.faceGib.spring.ball2.pos.y > miny) 
            & (this.all_balls.filter(b =>  b.pos.y > miny).length > 5)
    }
    
    update(dt, all_ents){
        super.update(dt,all_ents)
        
        //check for broken springs and maybe break more springs
       this.breakSpecs.forEach(spec => {
          if( this.all_springs[spec[0]].hitByBullet ){
            spec[1].forEach( j => this.all_springs[j].hitByBullet = true )
            this.all_balls[spec[2]].wallFrictionMultiplier = 0
          }
       })
       
        this.animTime += dt
        if( this.submerged ){
            this.phaseIndex = 1
        } else {
            this.phaseCountdown -= dt
            if( this.phaseCountdown <= 0 ){
                this.phaseCountdown = this.minPhaseDuration + Math.random() * (this.maxPhaseDuration-this.minPhaseDuration)
                this.phaseIndex = (this.phaseIndex+1)%2
            }
        }
        
        var targetDist = this.currDist;
        if( this.phaseIndex == 0 ){
            
            //standing legs
            targetDist = this.upDist
            this.feet[0].wallFrictionMultiplier = 1
            this.feet[1].wallFrictionMultiplier = 1
            
        } else if (this.phaseIndex == 1){
            
            // excited legs
            var animIndex = Math.floor(this.animTime/this.animPeriod)%2
            if( animIndex == 0 ){
                targetDist = this.longDist
                this.feet[0].wallFrictionMultiplier = 1
                this.feet[1].wallFrictionMultiplier = 0
            } else {
                targetDist = this.shortDist
                this.feet[0].wallFrictionMultiplier = 0
                this.feet[1].wallFrictionMultiplier = 1
            }
            
        } else if (this.phaseIndex == 2){
            
            //resting legs
            targetDist = this.longDist
            this.feet[0].wallFrictionMultiplier = 1
            this.feet[1].wallFrictionMultiplier = 1
        }
            
        // move legs
        if( targetDist > this.currDist ){ 
            this.currDist = Math.min( this.currDist+this.animSpeed*dt, targetDist )
        } else {
            this.currDist = Math.max( this.currDist-this.animSpeed*dt, targetDist )
        }
        this.animSprings.forEach(s => s.restLength = this.currDist)
            
        // wag tail
        var wagIndex = Math.floor(this.animTime/this.wagPeriod)%2
        if( wagIndex == 0 ){ 
            this.currWag = Math.min( this.currWag+this.wagSpeed*dt, this.maxWag )
        } else {
            this.currWag = Math.max( this.currWag-this.wagSpeed*dt, this.minWag )
        }
        this.wagChild.wagAngle = this.currWag
    }
}


class Platform extends PhysicsObject {
    
    constructor(x,y,w,h,angle=0){
        super()
        
        var all_corners = [[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]]
        var ctr = new Vector( x+w/2, y+h/2 )
        all_corners = all_corners.map( c => new Vector(...c).sub(ctr).rotate(angle).add(ctr) )
        
        this.all_verts = all_corners
        this.resetChildren()
    }
    
    draw(g){
        g.fillStyle = 'black'
        g.beginPath()
        g.moveTo(this.all_verts[0].x,this.all_verts[0].y)
        for( var i = 1 ; i < this.all_verts.length ; i++ ){
            g.lineTo(this.all_verts[i].x,this.all_verts[i].y)
        }
        g.fill()
    }
    
    resetChildren(){
        this.children = []
        for( var i = 0 ; i < 4 ; i++ ){
            var w = new Wall(this.all_verts[i],this.all_verts[i+1])
            w.vel = this.vel
            w.parentPlatform = this
            this.children.push( w )
        }
    }
    
    update(dt, all_objects){
        if( !paused ){
            
            if( this.vel ){
                var dp = this.vel.mul(dt)
                this.all_verts = this.all_verts.map(v => v.add(dp))
                this.resetChildren()
            }
            
        }
    }
    
    // if ball not intersecting platform return null
    // otherwise return better position for point
    collisionCheck(p){
        var wnp = this.getNearestWallPoint(p.pos)
        var w = wnp[0]
        var np = wnp[1]
        var inside = isPointInsidePolygon(p.pos,this.all_verts) 
        
        if( (!inside) & (np.sub(p.pos).getMagnitude()>=p.rad) ){
            return null // ball p not intersecting this platform
        }
        
        var normAngle = w.angle - Math.PI/2
        
        var corr = np.add(Vector.polar(normAngle,p.rad))
        
        return [corr,w,np]
    }
    



    getNearestWallPoint(point) {

      let nearestWall = null;
      let nearestPoint = null;
      let shortestDistance = Infinity;

      // Iterate through each edge of the polygon
      for (let i = 0; i < this.children.length; i++) {
          const w = this.children[i]
        const currentPoint = w.a
        const nextPoint = w.b

        // Compute the nearest point on the current edge
        const edgePoint = w.getNp(point)

        // Compute the distance between the input point and the edge point
        const distance = edgePoint.sub(point).getMagnitude()

        // Update the nearest point if the distance is shorter
        if (distance < shortestDistance) {
          shortestDistance = distance;
          nearestWall = w;
          nearestPoint = edgePoint;
        }
      }

      
      return [nearestWall,nearestPoint];
    }
}

class Bullet extends PhysicsObject {
    
    constructor(p){
        super()
        
        p.passThroughWalls = true
        
        this.p = p
        this.children = [p]
        this.lifetime = 1000
    }
    
    update(dt,all_ents){
        super.update(dt,all_ents)
        
        this.lifetime -= dt
        if( this.lifetime < 0 ){
            this.deleteMe = true
            return
        }
        
        // check points for collisions
        var a = this.p.pos
        var b = this.p.pos.sub(this.p.vel.mul(dt))
        
        // impact force
        var dv = Vector.polar(this.p.vel.getAngle(), bulletForce)
        
        //collide with balls
        all_ents.flatMap(e => e.children).filter(e => e instanceof Point).every(p=>{
            var np = computeNearestPointOnEdge(p.pos, a, b)
            if( np.sub(p.pos).getMagnitude() < p.rad ){
                //p.debug = true
                p.vel = p.vel.add(dv)
                p.hitByBullet = true
                //puppyDamage += 1
                this.deleteMe = true
                return true
            }   
            return true
        })
        
        //collide with springs
        all_ents.flatMap(e => e.children).filter(e => e instanceof Spring).every(s=>{
            if( (!s.breakable) | s.hitByBullet ){
                return true
            }
            if( computeIntersection(a,b,s.ball1.pos, s.ball2.pos ) ){
                //s.debug = true
                var balls = [s.ball1,s.ball2]
                balls.forEach(b => {
                    b.vel = b.vel.add(dv)
                    if( s.breakable ){
                        b.wallFrictionMultiplier = 0 
                        b.bouyancyMultiplier = .5
                    }
                })
                
                if( s.breakable ){
                    s.hitByBullet = true
                    puppyDamage += 1
                    this.deleteMe = true
                }
                return false
            }
            return true
        })
    }
    
    draw(g){
        super.draw(g)
        
        var tailPos = this.p.pos.sub(Vector.polar( this.p.vel.getAngle(), .1 ))
        
        g.strokeStyle = 'black'
        g.lineWidth = .01
        g.beginPath()
        g.moveTo( tailPos.x, tailPos.y )
        g.lineTo( this.p.pos.x, this.p.pos.y )
        g.stroke()
    }
}

class Gib{
    
     update(){}
     
     draw(){
         throw Error("not implemented")
     }
}

class LineGib extends Gib {
    
    constructor(spring){
        super()
        
        this.spring = spring
        
        this.lineWidth = .04
    }
    
    draw(g){
        
        if( this.spring.hitByBullet ){
            
            //draw broken
            g.fillStyle = (this.debug ? 'red' : puppyColor)
            var balls = [this.spring.ball1,this.spring.ball2]
            balls.forEach(b =>{
                g.beginPath();
                g.arc( b.pos.x, b.pos.y, this.lineWidth/2, 0, Math.PI*2 )
                g.fill();
            })
            
        } else {
            
            // draw connected
            var pos1 = this.spring.ball1.pos
            var pos2 = this.spring.ball2.pos
            if( this.wagAngle ){
                var d = pos2.sub(pos1)
                pos2 = pos1.add( Vector.polar( d.getAngle()+this.wagAngle, d.getMagnitude() ) )
            }
            
            g.strokeStyle = (this.debug ? 'red' : puppyColor)
            g.lineWidth = this.lineWidth;
            g.lineCap = "round";
            g.beginPath();
            g.moveTo(pos1.x, pos1.y);
            g.lineTo(pos2.x, pos2.y);
            g.stroke();
        }
    }
}

class RectGib extends Gib {
    
    constructor(points){
        super()
        
        this.points = points
    }
    
    draw(g){
        
        var rp = this.points.map(p=>p.pos)
        //rp = computeRectangle(rp)
        
        g.strokeStyle = (this.debug ? 'red' : puppyColor)
        g.fillStyle = (this.debug ? 'red' : puppyColor)
        g.lineWidth = .04;
        g.lineCap = "round";
        g.lineJoin = "round";
        
        g.beginPath();
        g.moveTo(rp[0].x,rp[0].y);
        g.lineTo(rp[1].x,rp[1].y);
        g.lineTo(rp[2].x,rp[2].y);
        g.lineTo(rp[3].x,rp[3].y);
        g.lineTo(rp[0].x,rp[0].y);
        g.stroke();
        
        g.beginPath();
        g.moveTo(rp[0].x,rp[0].y);
        g.lineTo(rp[1].x,rp[1].y);
        g.lineTo(rp[2].x,rp[2].y);
        g.lineTo(rp[3].x,rp[3].y);
        g.lineTo(rp[0].x,rp[0].y);
        g.fill();
    }
}

class FaceGib extends Gib {
    
    constructor(spring,rad){
        super()
        
        this.spring = spring
        this.p1 = spring.ball1
        this.p2 = spring.ball2
        this.p = spring.ball2
        this.rad = rad
    }
    
    draw(g){
        var angle = this.p2.pos.sub(this.p1.pos).getAngle()-.5
        var pos = this.p2.pos
        
        
        g.fillStyle = (this.debug ? 'red' : puppyColor)
        g.beginPath();
        g.arc(this.p.pos.x,this.p.pos.y,this.rad,0,Math.PI*2)
        g.fill();
        
        
        const eaDist = .038
        const eaDa = .7
        const eaRad = .015
        const eaO = Vector.polar( angle, 0 )
        const eaCenters = [
            pos.add( Vector.polar( angle+eaDa, eaDist ).add(eaO) ),
            pos.add( Vector.polar( angle-eaDa, eaDist ).add(eaO) )
        ] 
        g.fillStyle = puppyColor;
        eaCenters.forEach(p => {
            g.beginPath();
            g.arc(p.x,p.y, eaRad,0,Math.PI*2);
            g.fill();
        })
        
        drawPuppyFace( g, this.p.pos, angle )
    }
}
    
function drawPuppyFace(g, pos, angle) {
  
    const mDist = .02
    const mDa = .3
    const mRad = .008
    const mArc = .7
    const mO = Vector.polar( angle, -.022 )
    const mCenters = [
    pos.add( Vector.polar( angle+mDa, mDist ).add(mO) ),
    pos.add( Vector.polar( angle-mDa, mDist ).add(mO) )
    ] 
    const tCenter = pos.add(Vector.polar( angle, -.005 ))
    const tDa = Math.PI/2
    
    if( false ){
        //tongue
        g.fillStyle = 'red';
        g.beginPath();
        g.ellipse(tCenter.x,tCenter.y,.02,.006,angle,Math.PI-tDa,Math.PI+tDa);
        g.fill();

        //mouth
        g.fillStyle = puppyColor;
        mCenters.forEach(p => {
            g.beginPath();
            g.arc(p.x,p.y, mRad,0,Math.PI*2);
            g.fill();
        })
    }
    g.strokeStyle = 'black';
    g.lineWidth = .002
    mCenters.forEach(p => {
        g.beginPath();
        g.arc(p.x,p.y, mRad, Math.PI + angle-mArc, Math.PI + angle+mArc);
        g.stroke();
    })
    
    //nose
    const nCenter = pos.add(Vector.polar( angle, -.0065 ))
    g.fillStyle = 'black';
    g.beginPath();
    g.ellipse(nCenter.x,nCenter.y,.002,.003,angle,0,Math.PI*2);
    g.fill();
  
  
  // eyes
  const eyeDist = .012
  const eyeDa = .9
  const eyeRad = .004
  const eyeCenters = [
    pos.add( Vector.polar( angle+eyeDa, eyeDist ) ),
    pos.add( Vector.polar( angle-eyeDa, eyeDist ) )
  ]
  
  g.fillStyle = 'black';
  eyeCenters.forEach(p => {
      g.beginPath();
      g.arc(p.x,p.y, eyeRad, 0, 2 * Math.PI);
      g.fill();
  })
}


// graphics context
var canvas;
var ctx;
var graphics_scale = 1;

// tranlsate pixels on canvas to internal units
var canvasOffsetX = 0
var canvasOffsetY = 0
var canvasScale = 0

var paused = false
var score = 0


var puppyColor = "#777"
var backgroundColor = "#CCC"

// mouse
var canvasMousePos = new Vector(0,0) //pixels on canvas
var mousePos = 0 //internal units


// puppy physics
var gravity = new Vector( 0, 1e-6 ) // accel per ms
var puppyDamage = 0 // damage level (0-10)
var startingBouyancy = new Vector( 0, -1.5e-6 ) // accel per ms
var damageBouyancyPenalty = .9 // bouyancy multiplier per damage point
var puppySwimForce = new Vector( 0, 0 ) // accel per ms 
var airFriction = 1e-3 // fraction of speed lost per ms
var bounceLoss = .2 // fraction of speed lost per bounce
var wallFriction = .9 // puppy sliding on surface 0=slippery
var bulletForce = 1e-3 // delta-v per bullet

// puddle physics
var defaultPuddleHeight = .7 // y-axis position
var puddleHeight = defaultPuddleHeight
var recordPuddleHeight = defaultPuddleHeight
var dhPerPoint = .001 // increase in puddle height per submerged point
var submergedPointCount = 0

// game objects
var all_ents = []

//outer walls
var p = .05
//all_ents.push( new Platform( -p/2,p/2,2,p ) )
all_ents.push( new Platform( -p/2,p/2,p,2 ) )
all_ents.push( new Platform( 1-p/2,0,p,2 ) )
//all_ents.push( new Platform( 0,1,2,p ) )

//moving ledge
var ledge = new Platform(0,.3,.6,.05,angle=0) 
ledge.vel = new Vector(-3e-5,0)
all_ents.push( ledge )


var ledge2 = new Platform(.59,.27,.3,.05,angle=-.2) 
ledge2.vel = new Vector(-3e-5,0)
all_ents.push( ledge2 )

all_ents.push( new Platform(.5,.5,.4,.06,angle=-.3)  )

// ad puppy to last to draw on top
all_ents.push( new Puppy( new Vector( .2, -.05 ), .1, 4 ) )




function avg(p0,p1,r){
    return [p0[0]*(1.0-r)+p1[0]*r,p0[1]*(1.0-r)+p1[1]*r]
}
    
// Render graphics
function draw(fps, t) {
   
    ctx.fillStyle = backgroundColor
    ctx.fillRect( 0, 0, canvas.width, canvas.height )
    ctx.setTransform(canvasScale, 0, 0, canvasScale, canvasOffsetX, canvasOffsetY);
    // test
    //ctx.fillStyle = 'black'
    //ctx.fillRect( .25,.25,.5,.5 )
    
    
    // draw game objects
    for( var i = 0 ; i < all_ents.length ; i++ ){
        all_ents[i].draw(ctx)
    }
    
    //draw water
    ctx.fillStyle = "rgba(255, 50, 50, 0.5)";
    ctx.fillRect(0,recordPuddleHeight,1,1)
    
    //clip edges
    ctx.globalCompositeOperation = 'destination-in'
    ctx.fillStyle = "white";
    ctx.fillRect(0,0,1,1)
    ctx.globalCompositeOperation = 'source-over'
    
    // draw mouse position
    //ctx.fillStyle = 'red'
    //ctx.beginPath()
    //ctx.arc(mousePos.x,mousePos.y,.02,0,2*Math.PI)
    //ctx.fill()
    
    
    //draw score at puddle height
    ctx.font = ".04px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    var x = .03
    var y = recordPuddleHeight
    ctx.fillText("Score: " + score, x, y);
    
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
    //ctx.fillText(`canvas pos: ${canvasMouseX}, ${canvasMouseY}`, x, y);
    //y += .03
    //ctx.fillText(`virtual pos: ${virtualMouseX}, ${virtualMouseY}`, x, y);
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
}

function mouseClicked(event){
    paused = false
    
    updateMousePos(event)
    
    // random startign point on edge of screen
    var pos = computeNearestPointOnPolygon(
        {x:Math.random(),y:Math.random()}, 
        [{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}])
    
    var d = mousePos.sub(pos)
    var vel = Vector.polar( d.getAngle(), 5e-3 )
    all_ents.push( new Bullet(new Point(pos,vel) ) )
}



// Initialize the game
function init() {
    canvas = document.getElementById("gameCanvas");
    canvas.addEventListener("mousemove", updateMousePos);
    canvas.addEventListener("click", mouseClicked);
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
    canvasScale = dimension;
    canvasOffsetX = (canvas.width - dimension) / 2;
    canvasOffsetY = (canvas.height - dimension) / 2;
    if(paused){
        scale *= 5
    }
}

function update(dt) {
    fitToContainer()
    
    if( paused ) return
    
        
    // update entities and puddle
    submergedPointCount = 0
    all_ents.forEach(e => e.update(dt, all_ents))
    puddleHeight = defaultPuddleHeight - submergedPointCount*dhPerPoint
    if( puddleHeight < recordPuddleHeight ){
        recordPuddleHeight = puddleHeight
    }
    
    // remove entities marked for deletion
    all_ents = all_ents.filter( e => !e.deleteMe )
    
    // reset/advance if puppy is off-screen
    var pup = all_ents.find(e => e instanceof Puppy)
    if( pup.isOffScreen() ){
        all_ents = all_ents.filter(e => !(e instanceof Puppy))
        all_ents.push( new Puppy( new Vector( .6, -.05 ), .1, 4 ) )
        puppyDamage = 0
        defaultPuddleHeight = puddleHeight
        score += 1
    }
}
