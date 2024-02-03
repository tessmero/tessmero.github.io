
var charWidth = 5
var charHeight = 5

// draw text centered at point xy
function drawText(g,x,y,s,center=true,pad=0,scale=1){
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
        drawLayout(g,x,y,charLayouts[c],false,pad,scale)        
        x += dx
    }
}

function getTextDims(s,scale=1){
    let cw = charWidth
    let ch = charHeight
    let tps = global.textPixelSize 
    let tls = global.textLetterSpace  
    let dx = tps * cw + tps * tls
    let tw = dx*s.length - tps*tls
    let th = tps*ch
    return [tw*scale,th*scale]
}

function drawLayout(g,x,y, layout, center=true, pad=0, scale=1){
    if( !layout ) return
    
    let tps = global.textPixelSize*scale
    let tls = global.textLetterSpace*scale
    let ch = charHeight
    
    if( center ){
        x -= tps*layout[0].length/2
        y -= tps*layout.length/2
    }
    
    for( let iy = 0 ; iy < ch ; iy++ ){
        let ix = 0
        for( const b of layout[iy] ){
            if( b!=' ' ) g.fillRect(x+tps*ix-pad,y+tps*iy-pad,tps+pad*2,tps+pad*2)
            ix += 1
        }
    }
}

var charLayouts = {
    
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

class Gui {
    
    constructor(){
        this.clickableElements = this.buildElements()
    }
    
    // build list of clickable elements
    // with "rect" and functions "click" and "draw" 
    buildElements(){ throw new Error('not implemented') }
    
    draw(g){
        this.clickableElements.forEach(e => e.draw(g))
    }
    
    // draw pixel art icon followed by a line of text
    drawStatReadout(g,xy,icon,s){
        let scale = .5
        s = '  '+s // make space for icon on left
        
        // clear surrounding rectangle
        let rdims = getTextDims(s,scale)
        let dims = padRect( ...xy, ...rdims, .005 )
        g.fillStyle = global.backgroundColor
        g.fillRect(...dims)
        g.fillStyle = global.lineColor
        
        let ch = charHeight
        let tps = global.textPixelSize 
        drawLayout(g,xy[0],xy[1],icon,false,0,scale) //character.js
        drawText(g,...xy, s,false,0,.5)
    }
    
    // draw button with pixel art icon 
    drawButtonWithIcon(g,rect,icon){
        this.drawButton(g,rect)
        drawLayout(g,...rectCenter(...rect),icon) //character.js
    }
    
    // draw typical button
    drawButton(g,rect,label=null,hoverable=true){
        let lineCol = global.lineColor
        let labelCol = global.lineColor
        if(hoverable && inRect(global.mousePos,...rect)){
            lineCol = 'white'
        }
        g.fillStyle = global.backgroundColor
        g.strokeStyle = lineCol
        g.fillRect(...rect)
        g.strokeRect(...rect)
        g.fillStyle = global.lineColor
        
        if( label ){
            g.fillStyle = labelCol
            drawText(g, ...rectCenter(...rect), label)
        }
    }
    
    // draw typical label
    drawLabel(g,rect,label){
        g.fillStyle = global.backgroundColor
        drawText(g, ...rectCenter(...rect), label, true, .05)
        g.fillStyle = global.lineColor
        drawText(g, ...rectCenter(...rect), label, true, 0)
    }
}


class StartMenu extends Gui {
    
    constructor(){
        super()
            
        
        this.rainIcon = [
            'W   W',
            '  W  ',
            'W   W',
            '  W  ',
            'W   W',
        ]
        
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
        
        return [
            {
                // message banner
                rect: null,
                draw: g => this.drawLabel(g,slots[2],message),//gui.js
                click: null, //game_states.js
            }, 
            {
                // message banner
                rect: null,
                draw: g => this.drawLabel(g,slots[3],'TO CATCH RAIN'),//gui.js
                click: null, //game_states.js
            }, 
            {
                // start button
                rect: slots[8],
                draw: g => {
                    if( global.particlesCollected>global.particlesRequiredToStart ) this.drawButton(g,slots[8],'PLAY')
                },//gui.js
                click: () => {
                    if( global.particlesCollected>global.particlesRequiredToStart ) play() //game_state.js
                    else return true
                }
            }
        ]
    }
}


class Hud extends Gui {
    
    constructor(){
        super()
        
        this.pauseIcon = [
            'ww ww',
            'ww ww',
            'ww ww',
            'ww ww',
            'ww ww'
        ]
        
        this.collectedIcon = [
            'WWWWW',
            'W   W',
            'WWWWW',
            'WWWWW',
            'WWWWW',
        ]
        
        this.rainIcon = [
            'W   W',
            '  W  ',
            'W   W',
            '  W  ',
            'W   W',
        ]
        
        this.catchIcon = [
            'W   W',
            'W WWW',
            'WWWWW',
            ' WWW ',
            ' WWW ',
        ]
        
        this.statsIcon = [
            'W WWW',
            '     ',
            'W WWW',
            '     ',
            'W WWW',
        ]
    }
    
    // implement gui
    buildElements(){
        let sc = global.screenCorners
        let sr = global.screenRect
        let m = .1
        
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
            {
                // stats button
                rect: topLeft,
                draw: g => this.drawButtonWithIcon(g,topLeft,this.statsIcon), //gui.js
                click: stats, //game_states.js
            },
            {
                // quick total falling display
                rect: null,
                draw: g => this.drawStatReadout( //gui.js
                                g,topClp,this.rainIcon,
                                global.nParticles.toString()),
                click: null, //game_states.js
            }, 
            {
                // quick catch rate (%) display
                rect: null,
                draw: g => this.drawStatReadout( //gui.js
                                g,topCenterP,this.catchIcon,
                                Math.floor(100*(global.grabbedParticles.size/global.nParticles)).toString()+'%'),
                click: null, //game_states.js
            },      
            {
                // quick total collected display
                rect: null,
                draw: g => this.drawStatReadout( //gui.js
                                g,topCrp,this.collectedIcon,
                                global.particlesCollected.toString()),
                click: null, //game_states.js
            },       
            {
                // options button
                rect: topRight,
                draw: g => this.drawButtonWithIcon(g,topRight,this.pauseIcon), //gui.js
                click: pause, //game_states.js
            }
        ]
        
        // build toolbar buttons
        for( let i = 0 ; i < toolList.length ; i++ ){
            result.push({
                rect: slots[i],
                draw: g => {
                    this.drawButton(g,slots[i])//gui.js
                    
                    // check if selected
                    if( i == global.selectedToolIndex ){
                        let outer  = slots[i]
                        let m = .005
                        let inner = [outer[0]+m,outer[1]+m,outer[2]-2*m,outer[3]-2*m]
                        this.drawButton(g,inner)
                    }
                    
                    // draw icon inside button
                    toolList[i].drawToolbarIcon(g,slots[i])
                }, 
                click: function(){ global.selectedToolIndex = i }, 
            })
        }
        
        return result
    }
}


class StatsMenu extends Gui {
    
    // implement gui
    buildElements(){
        let sc = global.screenCorners
        let m = .4
        let bigCenterRect = [sc[0].x+m,sc[0].y+m, (sc[2].x-sc[0].x)-2*m, (sc[2].y-sc[0].y)-2*m]
        return [
            {
                // resume button
                rect: bigCenterRect,
                draw: g => this.drawButton(g,bigCenterRect,'STATS'),//gui.js
                click: play, //game_states.js
            }
        ]
    }
}



class PauseMenu extends Gui {
    
    // implement gui
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
            {
                // resume button
                rect: slots[0],
                draw: g => this.drawButton(g,slots[0],'RESUME'),//gui.js
                click: resume, //game_states.js
            },
            {
                // quit button
                rect: slots[1],
                draw: g => this.drawButton(g,slots[1],'QUIT'),//gui.js
                click: quit, //game_states.js
            }
        ]
    }
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

function inRect(p,x,y,w,h){
    return (p.x>=x) && (p.x<=(x+w)) && (p.y>=y) && (p.y<=(y+h))
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
            let p0 = this.pressure
            let p1 = Math.max(0,this.pressure - dt*global.poiPressureReleaseRate)
            let dp = p0-p1
            this.pressure = p1
            if( this.pressure == 0 ) this.pressurePattern = null
            let n = Math.round( dp * this.md2 * global.poiParticlesReleased )
            if( n > 0 ){
                for( let i = 0 ; i < n ; i++ )
                    global.grabbedParticles.add(global.nParticles+i)
                global.nParticles += n
                global.activeReleasePatterns.push(randomReleasePattern(n,...this.pos.xy(),this.r))
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

class SpinPressurePattern extends PressurePattern {
    
    //get xy for given pressure 0-1 for pois of radius r
    getOffset(t,r, pressure) { 
        return vp(
            t*1e-2 + rand()*twopi,
            r * pressure * .2
        )
    }
}

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

let allPressurePatterns = [
    new SpinPressurePattern(),
    new ShakePressurePattern(),
]


function randomPressurePattern(){
    return randChoice(allPressurePatterns)
}


// release procedural particles from a poi

class ReleasePattern {
    
    constructor(n,x,y,r){
        this.n = n // total number of particles
        this.x = x
        this.y = y
        this.r = r
        this.startTime = global.t
    }
    
    // draw particles 
    // released t ms ago
    draw(g,t){ throw new Error('not implemented') }
}

class SimpleRingReleasePattern extends ReleasePattern{
    
    // draw released particles 
    draw(g,t){ 
        let speed = global.fallSpeed*5
        t -= this.startTime - this.r/speed
        let particle_radius = global.particle_radius
        let n = this.n
        let a0 = rand() * twopi
        let da = twopi/n
        let r = speed*t
        
        for( let i = 0 ; i < n ; i++ ){
            let a = a0+da*i
            let x = this.x+Math.cos(a)*r
            let y = this.y+Math.sin(a)*r
            g.fillRect( x-particle_radius, y-particle_radius, 2*particle_radius, 2*particle_radius )
        }
    }
}



function randomReleasePattern(...p){
    return new SimpleRingReleasePattern(...p)
}

// a tool is an aelement of the quick bar
// it determines the appearnace of the mouse cursor
// and the click behavior

class Tool{
   
    drawToolbarIcon(g,rect){ throw new Error("not implemented") }
   
    drawCursor(g,p){ throw new Error("not implemented") }
   
    mouseDown(){ throw new Error("not implemented") }
    
    update(dt){}
    
    mouseMove(){}
    
    mouseUp(){}
}

// default tool, collect raindrops, pressure/move pois

class DefaultTool extends Tool{
    
    constructor(){
        super()
        
        this.iconLayout = [
            '#### ',
            '###  ',
            '#### ',
            '# ###',
            '   ##']
            
        //null or falsey -> mouse not being pressed
        //Poi instance -> mouse pressed on poi
        //otherwise -> mouse pressed on background
        this.held = null 
    }
    
    drawToolbarIcon(g,rect){ 
        drawLayout(g,...rectCenter(...rect),this.iconLayout)
    }
   
    drawCursor(g,p,pad){ 
        if( this.held instanceof Poi ){
            
            //held on poi
            drawLayout(g,...p,this.iconLayout,false,pad) 
            
            
        } else if( this.held ){
            
            // held on background
            // catching rain
            let c = global.mousePos
            g.beginPath()
            g.moveTo(c.x+global.mouseGrabRadius,c.y)
            g.arc(c.x,c.y,global.mouseGrabRadius,0,twopi)
            g.stroke()
            
        } else {
            drawLayout(g,...p,this.iconLayout,false,pad) 
        }
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
            // grab procedural particles
            if( (this.held) && global.particlesInGrabRange ){ //draw.js
                let grabbedCount = 0
                global.particlesInGrabRange.forEach( i => {
                    if( !global.grabbedParticles.has(i) ){
                        global.grabbedParticles.add(i)
                        grabbedCount += 1
                        global.particlesCollected += 1
                    }
                })
            }
        }
    }
    
}

    



class BuildTool extends Tool{
    
    constructor(){
        super()
        
        this.iconLayout = [
            ' www ',
            'wwwww',
            'wwwww',
            'wwwww',
            ' www '
        ]
    }
    
    drawToolbarIcon(g,rect){ 
        drawLayout(g,...rectCenter(...rect),this.iconLayout)
    }
   
    drawCursor(g,p){ 
        drawLayout(g,...p,this.iconLayout) 
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

const toolList = [
    new DefaultTool(),
    new BuildTool(),
]

const GameStates = {
    startMenu: 0,
    playing: 1,
    statsMenu: 2,
    pauseMenu: 3,
}

function rebuildGuis(){
    global.allGuis = {
        0: new StartMenu(),
        1: new Hud(),
        2: new StatsMenu(),
        3: new PauseMenu(),
    }
}

function resume(){
    global.selectedToolIndex = 0
    global.gameState = GameStates.playing
    document.getElementById("navbar").style.display = "none";
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

function stats(){
    
    global.selectedToolIndex = 0
    global.gameState = GameStates.statsMenu
    document.getElementById("navbar").style.display = "none";
}

function pause(){
    global.selectedToolIndex = 0
    global.gameState = GameStates.pauseMenu
    document.getElementById("navbar").style.display = "none";
}

function quit(){
    global.selectedToolIndex = 0
    global.gameState = GameStates.startMenu
    document.getElementById("navbar").style.display = "block";
    resetGame()
}

resetRand()

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


let lastDrawTime = 0
    
// Render graphics
function draw(fps, t) {
    
    var ctx = global.ctx
    let g = ctx
    var canvas = global.canvas
    
    // draw background
    ctx.fillStyle = global.backgroundColor
    ctx.fillRect( ...global.screenRect )
    
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
    global.activeReleasePatterns.forEach(rp => {
        rp.draw(ctx,global.t)
    })
    
    // draw pois
    resetRand()
    global.allPois.forEach( p => p.draw(ctx) )
    
    // draw gui
    ctx.lineWidth = global.lineWidth
    global.allGuis[global.gameState].draw(ctx)

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
        g.arc(c.x,c.y,global.mouseGrabRadius,0,twopi)
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

function keyDown(event){
  if (event.key === "Escape") {
    pause()
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
    let clickedGui = gui.clickableElements.some( e => 
        e.rect && inRect(global.mousePos,...e.rect) && !e.click() )
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



function update(dt) {    
    if( global.gameState==GameStates.pauseMenu ) return
    
    global.t += dt
    
    // trigger passive tool behavior
    toolList[global.selectedToolIndex].update(dt)
    
    
    // shrink all pois and prepare for draw
    global.allPois = global.allPois.filter( p => p.update(dt) )
    
    // check for resized window
    fitToContainer()    
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
    cvs.addEventListener("mousemove", function(e){global.debug='MM',mouseMove(e)});
    cvs.addEventListener("mousedown", function(e){global.debug='MD',mouseDown(e)});
    cvs.addEventListener("mouseup", function(e){global.debug='MU',mouseUp(e)});
    cvs.addEventListener("touchstart", function(e){global.debug='TS',mouseDown(e)}, false);
    cvs.addEventListener('touchend', function(e){global.debug='TE',mouseUp(e)}, false );
    cvs.addEventListener('touchcancel', function(e){global.debug='TC',mouseUp(e)}, false );
    
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


