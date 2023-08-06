
const pi = Math.PI
const pio2 = Math.PI/2
const twopi = 2*Math.PI

function randRange(lo,hi){
    return lo + Math.random() * (hi-lo)
}



var Engine = Matter.Engine,
    Events = Matter.Events,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Composites = Matter.Composites,
    Constraint = Matter.Constraint,
    MouseConstraint = Matter.MouseConstraint,
    Mouse = Matter.Mouse,
    Composite = Matter.Composite,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Vector = Matter.Vector;


var uni = null

// unicycle
function resetUni(){
    if( uni != null ){
        Composite.remove(world,uni)
    }
    var desiredX = (render.bounds.min.x+render.bounds.max.x)/2
    uni = buildUnicycle(desiredX, .9*render.bounds.max.y-300, 20, 250, 50)
    Composite.add(world, uni);


    iTerm = 0
    lastpitch = 0
}

function buildUnicycle(xx, yy, width, height, wheelSize) {

    var group = Body.nextGroup(true),
        wheelBase = 20,
        wheelYOffset = height/2;

    var car = Composite.create({ label: 'unicycle' }),
        body = Bodies.rectangle(xx-1, yy, width, height, { 
            collisionFilter: {
                group: group
            },
            //chamfer: {
            //    radius: height * 0.5
            //},
            mass:10
        });

    var wheelA = Bodies.circle(xx, yy + wheelYOffset, wheelSize, { 
        collisionFilter: {
            group: group
        },
        friction: 1,
        mass:1
    });
                
    var axelA = Constraint.create({
        bodyB: body,
        pointB: { x: 0, y: wheelYOffset },
        bodyA: wheelA,
        stiffness: 1,
        angularStiffness: 0,
        length: 0
    });
    
    Composite.addBody(car, body);
    Composite.addBody(car, wheelA);
    Composite.addConstraint(car, axelA);

    //poopy
    car.body = body
    car.wheel = wheelA

    return car;
};


var Kp = 4.5;                  // (P)roportional Tuning Parameter
var Ki = .01;                  // (I)ntegral Tuning Parameter        
var Kd = .001;                 // (D)erivative Tuning Parameter      

var iTerm = 0


var pidScale = 4e-4
var maxPid = 10
var maxAv = .2

var lastpitch = 0

    
function pidControl(timeChange){
    
    var desiredPitch = 0 // upright
    
    
    var desiredX = (render.bounds.min.x+render.bounds.max.x)/2
    var x = uni.body.position.x
    var adx = Math.abs(desiredX-x)
    
    
    // lean towards target

    var sdx = Math.sign(desiredX-x) 
    var adx = Math.abs(desiredX-x)
    
    desiredPitch = .08+Math.min( .2, 1e-4*adx )*sdx
    var pitch = uni.body.angle
    var error = pitch-desiredPitch

    // lean away from vel
    if( Math.sign(desiredPitch) == Math.sign(uni.wheel.velocity.x) ){
        desiredPitch *= .8
    }
    
    
    // Calculate our PID terms
    // PID values are multiplied/divided by 10 in order to allow the
    // constants to be numbers between 0-10.
    // -- -- -- -- -- -- -- -- -- -- -- -- -- --
    var pTerm = Kp * error * 10;
    iTerm += Ki * error * timeChange / 10;  
    var dTerm = Kd * (pitch - lastpitch) / timeChange * 100; 
  
  if (Ki == 0) iTerm = 0;
    lastpitch = pitch;


    // Obtain PID output value
    // -- -- -- -- -- -- -- -- -- -- -- -- -- --
    var PIDValue = pidScale * (pTerm + iTerm - dTerm)

    // Set a minimum speed (motors will not move below this - can help to reduce latency)
    //if(PIDValue > 0) PIDValue = PIDValue + 10;
    //if(PIDValue < 0) PIDValue = PIDValue - 10;

  // Limit PID value to maximum PWM values
    if (PIDValue > maxPid) PIDValue = maxPid;
    else if (PIDValue < -maxPid) PIDValue = -maxPid; 

    
    if( isNaN(PIDValue) ) return
    
    // apply torque
    //Body.setAngularVelocity(uni.body, uni.body.angularVelocity-.02*PIDValue);
    var av = uni.wheel.angularVelocity+PIDValue
    if( av > maxAv ){
        av = maxAv
    }
    if( av < -maxAv ){
        av = -maxAv
    }
    //Body.setAngularVelocity(uni.body, uni.body.angularVelocity-.01*PIDValue);
    Body.setAngularVelocity(uni.wheel, av);
}


var speed = 7e-2

function update(dt){

    cameraX += speed*dt
    
    if( (uni.body.position.x>(render.bounds.max.x+200)) || (uni.body.position.x<(cameraX-200)) || (uni.body.angle > pio2) || (uni.body.angle < -pio2) ){
        resetUni()
    }
    
    updateCamera()
    pidControl(dt)
    advanceObstacles(dt)
}



function updateCamera(){
  render.bounds.min.x = cameraX;
  render.bounds.max.x = cameraX + elem.clientWidth;
  render.bounds.min.y = 0;
  render.bounds.max.y = elem.clientHeight;
  render.options.width = elem.clientWidth;
  render.options.height = elem.clientHeight;
  render.canvas.width = elem.clientWidth;
  render.canvas.height = elem.clientHeight;
  Matter.Render.setPixelRatio(render, window.devicePixelRatio); // added this
}




// create engine
var engine = Engine.create(),
    world = engine.world;

var elem = document.body

// create renderer
var render = Render.create({
    element: elem,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        showAngleIndicator: true,
        showCollisions: true
    }
});

Render.run(render);



// create runner
var runner = Runner.create();
Runner.run(runner, engine);


var cameraX = 0

resetUni()


// fit the render viewport to the scene
Render.lookAt(render, {
    min: { x: 0, y: 0 },
    max: { x: 800, y: 600 }
});

var lastTime = null

// an example of using beforeUpdate event on an engine
Events.on(engine, 'beforeUpdate', function(event) {
    
    if( lastTime == null ){
        lastTime = (+new Date())
        return
    }
    
    
    var thisTime = (+new Date())
    var dt = thisTime - lastTime
    
    update(dt)
    
    lastTime = thisTime;
});

// Run the engine and renderer
Matter.Engine.run(engine);
Matter.Render.run(render);



var minCountdown = 1000
var maxCountdown = 3000
var countdown = maxCountdown
var maxObstacles = 10
var allObstacles = []

var groundWidth = 10000
var groundLim = .5*groundWidth
var groundY = .9*render.bounds.max.y
var groundHeight = 50

var ground1 = Bodies.rectangle(0, groundY, groundWidth, 50, 
    { isStatic: true, friction: 1 })
var ground2 = Bodies.rectangle(groundWidth, groundY, groundWidth, groundHeight, 
    { isStatic: true, friction: 1 })
Composite.add(world, [ground1,ground2]);

var allObstacles = []

function randomObstacle(){
    var x = render.bounds.max.x
    var y = render.bounds.max.y/2
    var obs = Bodies.polygon(x,y,Math.floor(randRange(3,6)),randRange(5,20),{friction:.8})
    Body.setVelocity( obs, {x: randRange(-20,0), y: 0});
    return obs
}

function advanceObstacles(dt){
    
    
    // shoot new obstacle at unicicle
    countdown -= dt
    if( (countdown < 0) && (allObstacles.length < maxObstacles) ){
        
        var x = render.bounds.max.x
        var y = randRange(render.bounds.min.y,render.bounds.max.y/2)
        var obs = randomObstacle()
        allObstacles.push(obs)
        Composite.add(world, obs);
        countdown = randRange(minCountdown,maxCountdown)
    }
    
    // remove old obstacles
    allObstacles = allObstacles.filter(obs => {
        if( obs.position.x < (cameraX-100) ){
            Composite.remove(world,obs)
            return false
        }
        return true
    })
    
    // keep rotating the two ground sections moving under the uni
    if( ground1.position.x < (cameraX-groundLim) ){
        Body.setPosition( ground1, Vector.create( ground2.position.x+groundWidth, groundY ))
    }
    if( ground2.position.x < (cameraX-groundLim) ){
        Body.setPosition( ground2, Vector.create( ground1.position.x+groundWidth, groundY ))
    }
}
