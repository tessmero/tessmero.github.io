
class GameState {
  static Start = new GameState('StartMenu');
  static ReadyFirstClick = new GameState('ReadyFirstClick');
  static Sunny = new GameState('Sunny');
  static ReadyForSecondClick = new GameState('ReadyForSecondClick');

  constructor(name,dx,dy) {
    this.name = name;
  }
  
  toString(){
    return this.name;
  }
}

class ActorState {
  static Jumping = new ActorState('Jumping');
  static Idle = new ActorState('Idle');

  constructor(name) {
    this.name = name;
  }
  
  toString(){
    return this.name;
  }
}

class JumpPath {

  constructor( x0, x1, h ) {
    this.x0 = x0;
    this.x1 = x1;
    this.h = h;
    this.t = 0;
    this.endT = 2*h/actorXSpeed;
  }
  
  advance(dt){
      this.t += dt;
  }
  
  getX(){
    return this.x0 + (this.x1 - this.x0) * (this.t/this.endT)
  }
  
  getY(){
    var t = (this.t/this.endT)
    return this.h * (4*t - 4*Math.pow(t,2));
  }
  
  done(){
    return this.t >= this.endT;
  }
}


class Actor {

      constructor(x) {
          this.x = x
          this.t = 0
          this.state = ActorState.Idle;
          this.targetX = x;
          this.jumpPath = null;
          
          this.shocked = false;
          this.eyesOpen = true;
          this.mouthOpen = true;
          this.jumpingFeetOffsets = this.getRandomJumpingFeetOffsets();
      }
      
    getY(){
        if( this.state == ActorState.Jumping ) {
            return this.jumpPath.getY();
        } else {
            return 0;
        }
    }
    
    atTarget(){
        return Math.abs(this.targetX-this.x)<actorXTolerance
    }
      
    update(dt){
        this.t += dt
        
        if( Math.random() < .0001*dt ){
            this.eyesOpen = !this.eyesOpen;  
        }

        if( Math.random() < .0001*dt ){
            this.mouthOpen = !this.mouthOpen;  
        }

        if( (!this.shocked) & (this.state == ActorState.Idle) & (!this.atTarget())){
            
            // start new jump towards target
            this.startNewJump()
            
        } else if (this.state == ActorState.Jumping) {
            this.jumpPath.advance( dt );
            this.x = this.jumpPath.getX()
            if( this.jumpPath.done() ){
                this.state = ActorState.Idle;
                this.jumpPath = null;
                this.t = 0;
            }
        }
    }
    
    startNewJump(h=null){
        // start new jump towards target
        var dx = this.targetX-this.x  
        var ajd = actorJumpDist*(1-Math.random()/2)
        if( dx < -ajd ){
            dx = -ajd
        }
        if( dx > ajd ){
            dx = ajd
        }
        this.state = ActorState.Jumping;
        if( !h ){
            h = Math.abs(dx)/2
        }
        this.jumpPath = new JumpPath( this.x, this.x+dx, h )
        this.jumpingFeetOffsets = this.getRandomJumpingFeetOffsets()
    }
    
    getRandomJumpingFeetOffsets(){
        var result = []
        for( var i = 0 ; i < 2 ; i++ ){
            result.push([])
            for( var j = 0 ; j < 2 ; j++ ){
                result[i].push([])
                for( var k = 0 ; k < 2 ; k++ ){
                    result[i][j].push(Math.random()-.5)
                }
            }
        }
        return result
    }

}    


  
function getRandomX(){
  var m = actorSize*2;
  return m + Math.random() * (canvas.width-2*m);
}

var nudgeSpeed = .001; //pixels per ms
function nudgeOverlappingActors(actors,dt){
    for( var i = 0 ; i < actors.length ; i++ ){
        if( actors[i].atTarget() ){
            for( var j = 0 ; j < i ; j++ ){
                if( actors[j].atTarget() ){
                    var dx = actors[j].x-actors[i].x
                    if( Math.abs(dx) < actorSize*1.2 ){
                        var m = nudgeSpeed * dt
                        actors[i].x -= dx*m
                        actors[i].targetX = actors[i].x
                        actors[j].x += dx*m
                        actors[j].targetX = actors[j].x
                    }
                }
            }
        }
    }
}

class Choreo {

  constructor( actors ) {
    this.actors = actors;
    this.t = 0
    this.actor_dts = this.getRandomDts(500)
  }
  
  update( dt ){
      this.t += dt
  }
  
  getRandomDts(max){
      var result = []
      for( var i = 0 ; i < this.actors.length ; i++ ){
          result.push(Math.random() * max)
      }
      return result
  }
}

class RandomChoreo extends Choreo {

  constructor( actors ) {
      super(actors)
  }
  
  update( dt ){
      super.update(dt)
      
      for( var i = 0 ; i < this.actors.length ; i++ ){
          var a = this.actors[i]
          if( (a.state==ActorState.Idle) & (Math.random() < .0005*dt) ){
            a.targetX = getRandomX();
          }
      }
      
      nudgeOverlappingActors(this.actors,dt)
  }
}

class SunupChoreo extends Choreo {

  constructor( actors ) {
      super(actors)
      this.phase = 0
  }
  
  update( dt ){
      super.update(dt)
      
      // shock actors
      var mint = 1000
      var maxt = 2000
      if( (this.t>mint) & (this.t<maxt) ){ 
          for( var i = 0 ; i < this.actors.length ; i++ ){
              var a = this.actors[i]
              if( (!a.shocked) & (this.t-this.actor_dts[i]>mint) ){
                a.shocked = true
              }
          }
      }
      
      // advance phase
      if( (this.phase==0) & (this.t>maxt) ){
        this.phase = 1
        this.actor_dts = this.getRandomDts(5000)
      }
      
      // unshock actors and start jumping in place
      var mint = 5000
      var maxt = 15000
      if( (this.t>mint) & (this.t<maxt) ){ 
          for( var i = 0 ; i < this.actors.length ; i++ ){
              var a = this.actors[i]
              if( a.shocked & (this.t-this.actor_dts[i]>mint) ){
                    a.shocked = false
              } else if ( (!a.shocked) & (a.state!=ActorState.Jumping) ){
                    a.targetX = a.x
                    a.startNewJump(100*(1.0-.5*Math.random()))
              }
          }
      }
      
      // switch to random choreo
      if( (this.phase==1) & (this.t>maxt) ){
        currentChoreo = new RandomChoreo(allActors);
      }
      
  }
}


// graphics context
var canvas;
var ctx;
var y0 = 400; // canvas y value to be considered y=0 in game coords

var canvasMouseX = null;
var canvasMouseY = null;


// src/core/game_state.js
var gameState = GameState.Start;
var gameTime = 0;

// game settings
var actorXSpeed = .2; //pixels per ms
var actorXTolerance = 10; //(pixels) allowed error in positioning
var actorSize = 30; //pixels
var actorJumpDist = 300; //(pixels) maximum x-distance for one jump

var allActors = []
var currentChoreo = null;

// environment animation
var sunRadius = 50;
var sunY;
var minSunY;
var sunSpeed = .2; //pixels per ms
var colorLevel = 0;
var colorUpSpeed = .001; // fraction per ms



// Update game logic
function update(dt) {
    
    // advance game clock
    gameTime += dt
    if( (gameState==GameState.Start) & (gameTime>10000) ){
        gameState = GameState.ReadyForFirstClick
    }
    
    // update dance sequence
    if( currentChoreo ) {
        currentChoreo.update(dt)
    }
    
    // update actors
    for (var i = 0 ; i < allActors.length ; i++ ){
        allActors[i].update(dt);
    }
    
    // update environment
    if( gameState == GameState.Sunny ){
        if( sunY > minSunY ){
            sunY  = Math.max( minSunY, sunY-sunSpeed*dt )
        }
        
        if( (colorLevel < 1) & (sunY < 400) ){
            colorLevel = Math.min( 1, colorLevel+colorUpSpeed*dt )
        }
    }
}


function leftClick(event){
    if( gameState == GameState.ReadyForFirstClick ){
        gameState = GameState.Sunny
        currentChoreo = new SunupChoreo(allActors)
    }
}



// Initialize the game
function init() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // Add event listeners
    canvas.addEventListener("click", leftClick);
    
    // init actors
    for( var i = 0 ; i < 10 ; i++ ){
        var a = new Actor(getRandomX()-canvas.width)
        a.targetX = getRandomX();
        allActors.push(a);
    }
    currentChoreo = new RandomChoreo(allActors);
    
    // init env
    sunY = canvas.height+sunRadius;
    minSunY = canvas.height/4

    // Start the game loop
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


    msPassed = Math.min(msPassed,200)

    update(msPassed);
    draw(fps);

    requestAnimationFrame(gameLoop);
}


// Initialize the game
init();


// Render graphics


// get a modified version of the given color
// based on global colorLevel
function getWhitenedColor( r,g,b ){
    r = 255*(1.0-colorLevel) + r*(colorLevel)
    g = 255*(1.0-colorLevel) + g*(colorLevel)
    b = 255*(1.0-colorLevel) + b*(colorLevel)
    return `rgb(${r},${g},${b})`
}

function draw(fps) {
    // draw sky
    ctx.fillStyle = getWhitenedColor(135,206,235)
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw invironment
    if( gameState == GameState.Sunny ){
        drawSun()
    }

    // draw actors
    for (var i = 0 ; i < allActors.length ; i++ ){
        drawActor( allActors[i] );
    }

    // draw ground
    ctx.fillStyle = getWhitenedColor(0,154,23)
    console.log(ctx.fillStyle )
    ctx.strokeStyle = 'black'
    ctx.fillRect( 0, y0, canvas.width, canvas.height)
    ctx.strokeRect( 0, y0, canvas.width, canvas.height)
    
    // draw click prompt
    if( (gameState==GameState.ReadyForFirstClick) | (gameState==GameState.ReadyForSecondClick) ){
        ctx.font = "25px Arial";
        ctx.textAlign = "center";
        ctx.fillStyle = "black";
        ctx.fillText("Click Here", canvas.width/2, canvas.height/3);
    }
    

    // Draw FPS on the screen
    //ctx.font = "25px Arial";
    //ctx.textAlign = "left";
    //ctx.fillStyle = "black";
    //var x = 10
    //var y = 30
    //ctx.fillText("FPS: " + fps, x, y);
    
    //y += 30
    //ctx.fillText(`camera: ${cameraX.toFixed(2)}, ${cameraY.toFixed(2)}, ${zoomLevel.toFixed(2)}`, x, y);
    //y += 30
    //ctx.fillText(gameState, x, y);
    //y += 30 
    //ctx.fillText(`canvas pos: ${canvasMouseX}, ${canvasMouseY}`, x, y);
    //y += 30
    //ctx.fillText(`virtual pos: ${virtualMouseX}, ${virtualMouseY}`, x, y);
}


// actor idle animation data
var all_specs = [
    [[0,.4,1,1,0],  [.2,1.4,.25],[.8,1.4,.25]],
    [[0,.2,1,1,-.2],[.1,1.2,.25],[.8,1.4,.25]],
    [[0,.2,1,1,-.2],[.1,1.2,.25],[.8,1.4,.25]],
    [[0,.4,1,1,0],  [.2,1.4,.25],[.8,1.4,.25]],
    [[0,.2,1,1,.2], [.2,1.4,.25],[.9,1.2,.25]],
    [[0,.2,1,1,.2], [.2,1.4,.25],[.9,1.2,.25]],
]        

// animation duration (ms)
var cp_dt = 500

// feet position in spec units
function getFootX( actor, foot_index ){
  var x = actor.jumpPath.t/actor.jumpPath.endT
  var k = .2
  var m = .3
  var result = (1.0-m) / 2 + m/(1+Math.exp(-(2*x-1)/k))
  
  var jfo = actor.jumpingFeetOffsets[foot_index]
  var dx = x*jfo[0][0] + (1.0-x)*jfo[0][1]
  
  if( actor.jumpPath.x1 < actor.jumpPath.x0 ){
    return .5 - (result-.5)
  }else if(actor.jumpPath.x1 == actor.jumpPath.x0){
    return (result + .5 - (result-.5))/2
  }
  return result + dx*.1;
}
function getFootY( actor, foot_index ){
  var x = actor.jumpPath.t/actor.jumpPath.endT
  
  var jfo = actor.jumpingFeetOffsets[foot_index]
  var dy = x*jfo[1][0] + (1.0-x)*jfo[1][1]
  return 1.4-.2*Math.sin(Math.PI*x) + dy*.1
}

function drawActor(actor){
    
    if( actor.shocked ){
        var prev_spec = all_specs[0]
        var next_spec = all_specs[0]
        var cp_r = 0
    } else if( actor.state!=ActorState.Jumping ){
        var cp_index = Math.floor( actor.t / cp_dt )
        var cp_r = (actor.t - (cp_index*cp_dt)) / cp_dt
       
        var prev_spec = all_specs[cp_index % all_specs.length]
        var next_spec = all_specs[(cp_index+1) % all_specs.length]
    } else {
        var prev_spec = all_specs[0]
    }
    
    for( var i = 0 ; i < prev_spec.length ; i++ ){
        if( actor.state!=ActorState.Jumping ){
            var interpRow = interpolateSpecRows(prev_spec[i],next_spec[i],cp_r)
        } else if( actor.state==ActorState.Jumping) {
            if( actor.jumpPath.x1 == actor.jumpPath.x0 ){
                var interpRow = all_specs[0][i]
            }else if( actor.jumpPath.x1 > actor.jumpPath.x0 ){
                var interpRow = all_specs[4][i]
            } else {
                var interpRow = all_specs[1][i]
            }
        }
        
        if( (i>0) & (actor.state==ActorState.Jumping) ){
            var dx = (i*2-3)/4 + (i-1)*.1*actor.jumpPath.t/actor.jumpPath.endT
            interpRow = [getFootX(actor, i-1)+dx, getFootY(actor, i-1), interpRow[2]]
        }
        
        ctx.strokeStyle = 'black'
        ctx.fillStyle = 'white'      
        drawSpecRow(interpRow, actor)  
       
        if( i == 0 ){
            ctx.strokeStyle = 'black'
            ctx.fillStyle = 'black'
            drawFace(interpRow, actor)  
        }
    }
    
    // draw precise location
    //ctx.fillStyle = 'red'           
    //ctx.beginPath()
    //ctx.arc( actor.x, y0 - actor.getY(), 4, 0, 2*Math.PI)
    //ctx.fill()
    
    // draw target location
    //ctx.fillStyle = 'blue'           
    //ctx.beginPath()
    //ctx.arc( actor.targetX, y0-4, 4, 0, 2*Math.PI)
    //ctx.fill()
}


       
function drawFace(row, actor){
   
    var m = actorSize
    var x = actor.x + m*row[0]-actorSize/2
    var y = y0 - actor.getY() + m*row[1]-3*actorSize/2
    var w = m*row[2]
    var h = m*row[3]
    var ox = m*row[4];
   
    // start clipping
    ctx.save()
    ctx.rect(x,y,w,h)
    ctx.clip()
   
    if( actor.shocked ){
        
        
        // draw shocked mouth
        ctx.beginPath()
        ctx.arc( x+w/2+ox, y+h/2, w/4,  0, 2*Math.PI)
        ctx.fill()
        
        // draw shocked eyes     
        ctx.beginPath()
        ctx.arc( x+w/4+ox, y+h/5, w/10, 0, 2*Math.PI)
        ctx.fill()
        ctx.beginPath()
        ctx.arc( x+3*w/4+ox, y+h/5, w/10, 0, 2*Math.PI)
        ctx.fill()
        
    } else {
        
        // draw idle mouth
        if( actor.mouthOpen ){
            ctx.beginPath()
            ctx.arc( x+w/2+ox, y+h/3, w/3, 0.1*Math.PI, 0.9*Math.PI )
            ctx.fill()
        } else {
            ctx.beginPath()
            ctx.arc( x+w/2+ox, y, w/2, 0.3*Math.PI, 0.7*Math.PI )
            ctx.stroke()
        }
        
        // draw idle eyes
        if( actor.eyesOpen ){                
            ctx.beginPath()
            ctx.arc( x+w/4+ox, y+h/5, w/10, 0, 2*Math.PI)
            ctx.fill()
            ctx.beginPath()
            ctx.arc( x+3*w/4+ox, y+h/5, w/10, 0, 2*Math.PI)
            ctx.fill()
        } else {
            ctx.beginPath()
            ctx.arc( x+w/4+ox, y+h/3, w/6, 1.25*Math.PI, 1.75*Math.PI)
            ctx.stroke()
            ctx.beginPath()
            ctx.arc( x+3*w/4+ox, y+h/3, w/6, 1.25*Math.PI, 1.75*Math.PI)
            ctx.stroke()
        }
    }
   
   
    // stop clipping
    ctx.restore()
}

function drawSpecRow(row, actor){
    var m = actorSize
    
    var x = actor.x + m*row[0]-actorSize/2
    var y = y0 - actor.getY() + m*row[1]-3*actorSize/2
   
    if( row.length >= 4){
        ctx.fillRect( x, y, m*row[2], m*row[3] )
        ctx.strokeRect( x, y, m*row[2], m*row[3] )
    } else if( row.length == 3 ){
        var a = Math.PI/6
        ctx.beginPath()
        ctx.arc( x, y, m*row[2], Math.PI-a, a, false)
        ctx.fill()
        ctx.beginPath()
        ctx.arc( x, y, m*row[2], Math.PI-a, a, false)
        ctx.closePath()
        ctx.stroke()
    }
}


       
function interpolateSpecRows(a,b,r){
    if( r == 0 ){
        return a;  
    } else if( r == 1){
        return b  
    } else {
        var result = []
        for( var i = 0 ; i < a.length ; i++ ){
            result[i] = a[i]*(1.0-r) + b[i]*r  
        }
        return result
    }
}

function drawSun(){
    ctx.fillStyle = 'yellow'
    ctx.beginPath();
    ctx.arc( canvas.width/2, sunY, sunRadius, 0, Math.PI*2 )
    ctx.fill()
}
