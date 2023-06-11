
// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.5
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if (typeof define === 'function' && define.amd) {
  define(function () { return LZString; });
} else if( typeof module !== 'undefined' && module != null ) {
  module.exports = LZString
} else if( typeof angular !== 'undefined' && angular != null ) {
  angular.module('LZString', [])
  .factory('LZString', function () {
    return LZString;
  });
}


class Direction {
  static Up = new Direction('Up',0,-1);
  static Down = new Direction('Down',0,1);
  static Left = new Direction('Left',-1,0);
  static Right = new Direction('Right',1,0);

  constructor(name,dx,dy) {
    this.name = name;
    this.dx = dx;
    this.dy = dy;
  }
  
  toString(){
    return this.name;
  }
}

var allDirections = [Direction.Up,Direction.Right,Direction.Down,Direction.Left];

var directionsByName = {}
for( var i = 0 ; i < allDirections.length ; i++ ){
    var dir = allDirections[i];
    directionsByName[dir.name] = dir;
}

class GameState {
  static StartMenu = new GameState('StartMenu');
  static PauseMenu = new GameState('PauseMenu');
  static Playing = new GameState('Playing');

  constructor(name,dx,dy) {
    this.name = name;
  }
  
  toString(){
    return this.name;
  }
}

function isTileOnMap(tx,ty){
    return (tx >= 0 && tx < mapWidth && ty >= 0 && ty < mapHeight);
}

// player places a single block by left-clicking
// called in src/mouse.js : leftClick
function attemptPlaceBlock(x,y,dir,block){

    if( tileMap[x][y] ){
        return;
    }

    var newBlock = block.getCopy(x,y,dir);
    tileMap[x][y] = newBlock;
    
    // update existing blocks that may be effected
    for( var i = 0 ; i < allDirections.length ; i++ ){
        var td = getTargetAndDistance( x,y,allDirections[i] )
        if( td[0] ){
            td[0].mapUpdated()
        }
    }
    
    
    newBlock.justPlaced();

}

function clearMap(){
    for( var x = 0 ; x < mapWidth ; x++ ){
        for( var y = 0 ; y < mapHeight ; y++ ){
            tileMap[x][y] = null
        }
    }
}

// destroy a single block
// called in src/mouse.js : rightClick
// called in src/blocks/wall.js : hitByLaser
function attemptDeleteBlock(x,y){
    tileMap[x][y] = null
    
    // update existing blocks that may be effected
    for( var i = 0 ; i < allDirections.length ; i++ ){
        var td = getTargetAndDistance( x,y,allDirections[i] )
        if( td[0] ){
            td[0].mapUpdated()
        }
    }
}

// plan a straight path to a solid block
// called in src/blocks/shooter.js
function getTargetAndDistance( x,y,dir ) {
    
    var tx = x
    var ty = y
    var dist = 0
    
    while( true ){
        tx += dir.dx
        ty += dir.dy
        
        if( !isTileOnMap(tx,ty) ) {
            return [null,dist] // no target
        }
        
        var tileObject = tileMap[tx][ty];
        if( tileObject && tileObject.isSolid() ) {
            return [tileObject,dist] // found target
        }
        
        dist += tileSize;
    }
}

// import/export map strings


function exportTilemapToString(){
    
    // compile tile data
    var td = []
    for( var x = 0 ; x < mapWidth ; x++ ){
        td[x] = []
        for( var y = 0 ; y < mapHeight ; y++ ){
            if( tileMap[x][y] ){
                td[x][y] = tileMap[x][y].toString()
            } else {
                td[x][y] = ''
            }
        }
    }
    
    return LZString.compressToBase64(JSON.stringify(td))
}


function importTilemapFromString(s){
    td = JSON.parse(LZString.decompressFromBase64(s))
    
    // replace all map tiles
    var all_new_blocks = [];
    for( var x = 0 ; x < mapWidth ; x++ ){
        for( var y = 0 ; y < mapHeight ; y++ ){
            var newBlock = importTileFromString(td[x][y],x,y)
            tileMap[x][y] = newBlock
            if( newBlock != null ){
                all_new_blocks.push(newBlock)
            }
        }
    }
    
    // init all blocks on the map
    for( var i = 0 ; i < all_new_blocks.length ; i++ ){
        all_new_blocks[i].justPlaced();
    }
    
}

function importTileFromString(s,x,y){
    if( s == '' ){
        return null
    }
    
    var parts = s.split(',')
    var structor = getConstructor(parts[0])
    if( parts.length == 1 ){
        return new structor(x,y)
    }
    
    var dir = directionsByName[parts[1]];
    return new structor(x,y,dir)   
}

// poopy
function getConstructor(name){
    if( name == "Wall" ){
        return Wall
    }
    if( name == "Shooter" ){
        return Shooter
    }
    if( name == "Laser" ){
        return Laser
    }
    throw Error(`unrecognized block constructor name: ${name}`)
}

class Block {

  constructor(x,y) {
    this.x = x;
    this.y = y;
  }
  
  isSolid(){
    return true;
  }
  
  toString(){
      return this.constructor.name;
  }
  
  drawChildren(){}
  
  justPlaced(){}
  
  mapUpdated(){}
  
  update(time_elapsed){}
  
  hitByBullet(){}
  hitByLaser( timeElapsed ){}
}

class DirectedBlock extends Block {

  constructor(x,y,dir) {
    super(x,y);
    this.dir = dir;
  }  
  
  toString(){
      return this.constructor.name + "," + this.dir
  }
}



class Shooter extends DirectedBlock {  

      constructor(x,y,dir) {
        super(x,y,dir);
        this.cooldown = 0;
        this.target = null;
        this.targetDistance = null;
        this.bullets = [];
        this.bulletSpeed = .5;
      } 
  
    getCopy(x,y,dir){
        return new Shooter(x,y,dir);
    }
    
    draw(x,y,w,h){
        ctx.fillStyle = 'blue';
        ctx.fillRect(x,y,w,h);
        
        ctx.fillStyle='white';
        var a = 1.0 - Math.max(0,this.cooldown) / baseShooterCooldown;
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        drawDirectionIndicator(x,y,w,h,this.dir);
    }
    
    drawChildren(){
        // draw bullets
        ctx.fillStyle='blue';
        for( var i = 0 ; i < this.bullets.length ; i++ ){
            var bxy = this.getBulletPos(this.bullets[i])
            ctx.beginPath();
            ctx.arc(bxy[0],bxy[1], 10, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    getBulletPos(d){
        return [
            this.x*tileSize+tileSize/2 + (d+tileSize/2)*this.dir.dx,
            this.y*tileSize+tileSize/2 + (d+tileSize/2)*this.dir.dy
        ]
    }
    
    justPlaced() {
        this.cooldown = Math.random() * baseShooterCooldown;
        var td = getTargetAndDistance(this.x,this.y,this.dir);
        this.target = td[0];
        this.targetDistance = td[1];
    }
    
    mapUpdated() {
        
        var td = getTargetAndDistance(this.x,this.y,this.dir);
        if( td[0] != this.target ){
            this.target = td[0];
            this.targetDistance = td[1];
            for( var i = 0 ; i < this.bullets.length ; i++ ){
                if( this.bullets[i] >= this.targetDistance ){
                    this.bullets.splice(i,1)
                    i--;
                }
            }
        }
    }
    
    hitByBullet(){
        this.cooldown = Math.max( this.cooldown - bonusShooterCooldown, minShooterCooldown )
    }
    
    update(time_elapsed){
        if( (this.targetDistance != null) || (this.cooldown > 0) ){
            this.cooldown -= time_elapsed;
        }
        if( this.cooldown <= 0 ){
            this.shoot()
        }
        
        // advance bullets
        if( this.targetDistance != null ){
            var d = time_elapsed * this.bulletSpeed
            for( var i = 0 ; i < this.bullets.length ; i++ ){
                
                var bxy = this.getBulletPos(this.bullets[i])
                var oldtilex = Math.floor(bxy[0]/tileSize)
                var oldtiley = Math.floor(bxy[1]/tileSize)
                this.bullets[i] += d;
                
                var bxy = this.getBulletPos(this.bullets[i])
                var tilex = Math.floor(bxy[0]/tileSize)
                var tiley = Math.floor(bxy[1]/tileSize)
                
                if( (oldtilex!=tilex) || (oldtiley!=tiley) ){
                    if( isTileOnMap(tilex,tiley) ){
                        var block = tileMap[tilex][tiley] 
                        if( block ){
                            block.hitByBullet();
                        }
                    }
                }
                
                if( this.bullets[i] >= this.targetDistance ){
                    if( this.target ){
                        this.target.hitByBullet();
                    }
                    this.bullets.splice(i,1)
                    i--;
                }
            }
        }
    }
    
    shoot(){
        if( this.targetDistance == null ){
            return
        }
        this.bullets.push(0)
        this.cooldown += baseShooterCooldown
    }
}



class Laser extends DirectedBlock {  

      constructor(x,y,dir) {
        super(x,y,dir);
        this.laserTime = 0;
        this.target = null;
        this.targetDistance = null;
        this.laserActiveLastUpdate = false;
      } 
  
    getCopy(x,y,dir){
        return new Laser(x,y,dir);
    }
    
    isSolid(){
        return false;
    }
    
    draw(x,y,w,h){
        ctx.fillStyle = 'red';
        ctx.fillRect(x,y,w,h);
        
        ctx.fillStyle='white';
        var a = 1.0 - Math.max(0,this.cooldown) / baseShooterCooldown;
        drawDirectionIndicator(x,y,w,h,this.dir);
        
    }
    
    drawChildren(){
        if( this.laserActiveLastUpdate ){
            
            var x = this.x * tileSize
            var y = this.y * tileSize
            var w = tileSize;
            var h = tileSize;
            
            ctx.strokeStyle='red';
            ctx.lineWidth = 10;
            ctx.beginPath();
            ctx.moveTo(x+w/2,y+h/2);
            ctx.lineTo(
                x+w/2 + this.targetDistance*this.dir.dx,
                y+h/2 + this.targetDistance*this.dir.dy
            );
            ctx.stroke();
        }
    }
    
    justPlaced() {
        var td = getTargetAndDistance(this.x,this.y,this.dir);
        this.target = td[0];
        this.targetDistance = td[1];
    }
    
    mapUpdated() {
        var td = getTargetAndDistance(this.x,this.y,this.dir);
        this.target = td[0];
        this.targetDistance = td[1];
    }
    
    hitByBullet(){
        var oldlt = this.laserTime;
        this.laserTime = Math.max( bonusLaserTime, Math.min( this.laserTime + bonusLaserTime, maxLaserTime ) )
        this.laserActiveLastUpdate = true;
    }
    
    update(time_elapsed){
        if( this.laserTime > 0 ){
            this.laserActiveLastUpdate = true;
            var targetHitTime = Math.max(this.laserTime,time_elapsed)
            this.laserTime -= targetHitTime
            if( this.target ) {
                this.target.hitByLaser(targetHitTime)
            }
        } else {
            this.laserActiveLastUpdate = false;
        }
    }
}

class Wall extends Block {
    getCopy(x,y,dir){
        return new Wall(x,y,dir);
    }
    
    draw(x,y,w,h){
        ctx.fillStyle = 'gray';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = .5;
        ctx.fillRect(x,y,w,h);
        
        // brick pattern
        var xs = [x,x+w/4,x+2*w/4,x+3*w/4,x+w]
        var ys = [y,y+h/4,y+2*h/4,y+3*h/4,y+h]
        var lines = [
           [[0,0],[4,0]],
           [[0,1],[4,1]],
           [[0,2],[4,2]],
           [[0,3],[4,3]],
           [[0,4],[4,4]],
           [[1,0],[1,1]],
           [[3,0],[3,1]],
           [[1,2],[1,3]],
           [[3,2],[3,3]],
           [[2,1],[2,2]],
           [[2,3],[2,4]],
        ]
        for( var i = 0 ; i < lines.length ; i++ ){
            
            ctx.beginPath()
            ctx.moveTo(xs[lines[i][0][0]],ys[lines[i][0][1]])
            ctx.lineTo(xs[lines[i][1][0]],ys[lines[i][1][1]])
            ctx.stroke()
        }
    }
}

class BackgroundSimulation {

  constructor( camCheckpoints, mapString ) {
    this.camCheckpoints = camCheckpoints;
    this.mapString = mapString;
    this.simtime = 0;
  }
  
  toString(){
      return this.constructor.name;
  }
  
  update(time_elapsed){
    this.simtime += time_elapsed
    
    if( this.simtime >= this.camCheckpoints[this.camCheckpoints.length-1][0] ){
        resetStartMenuSim();
    }
    
    // identify neighboring checkpoints
    var prev = null
    var next = null
    for( var i = 1 ; i < this.camCheckpoints.length ; i++ ){
        prev = this.camCheckpoints[i-1]
        next = this.camCheckpoints[i]
        if( next[0] > this.simtime ){
            break
        }
    }
    
    // update camera position
    var dt = this.simtime-prev[0]
    if( dt == 0 ){
        return;
    }
    var r = dt/(next[0]-prev[0])
    cameraX = prev[1] + r*(next[1]-prev[1])
    cameraY = prev[2] + r*(next[2]-prev[2])
    zoomLevel = prev[3] + r*(next[3]-prev[3])
  }
}

// laser loop shooting wall to the right

var bg_sim_1 = new BackgroundSimulation(
    
    [
        //[time,x,y,z]
        [0,0,2,1.3],
        [10000,15,2,1],
        [15000,15,2,1],
    ],
    "NrBEoGnLOvYTJ9mJetnXYzruD8i8TDTizKLrzaryBdCMG+t1juz9r3n/7oL5CBjZqIkipwmZNnS5ihcrEtkAZQAWAe20AXAKYAnCABFtAdwB2Kglt2GTAJQCWAc017b3+b6V+ffyDlJjVggIjwqMCYyNjo1FCE5PjUuPSUjLTCJOy8rILMovzirlyNHX1jCAAZAwAzL2QagEMAZ2rXDybQVo7nd09YPs7BnpGB7uH20amoCYguofmZyeXe1cWx6f6tubh7KpMAVQAHEovCy9KbkPFrh6un2+fHpXKXz7fv19+vmA+P3+wKBoL+UkB4KhIOhYJhwUh8LhyNhqKRiXuaJR6Jx2IeiLxWKJuOJ3wJpIpJKphIRmOplJpjIZAXJ9LZTPZzPgrI5vK5fNxPP5ws5osZSQA6i0ADbS2BS2XymVyqAKlWgNVKxWq5Va9WanXajW6w36k3Go0Gi1my3mq3280Cp0i5GSu3u22em3evW+01+60Bh1eoMen3+l2RsVR0BukMRwMJ4PhxOp5Oh+NpsMZlPO6P5/HidNJ7MlzPFrPl0uVlMVq15hsx2Fx2vVuttjtVrut7s5xsFptfFt9ss9scjmsT9u9hP9ueD1JCgfL+crsp01ebhfbyRLrdrg+bvc7/enk8Ajfnw9Xs85S/Xh+3ufHx83t+Hl9P99fwX3n//78XU/QDX1A8U/xAgCwKAiDoLgqDQWA+DIJQpEkIQ1CMOidDMNw5Dbhw/CsOI+RCJIoi8LuMJyJoyirjIuiKKYqjmMY2jigY1iuPYzBOJ4tiBLvajBP47iWVg0TJJEvA+OksT5IQWSFLkmilKk5T4LUlTtO4rSNPU089IMnTDIkkzzP0jFhMsmyDKMizjI/MzbIckz7JcjyG3cxyfJjbzXM8k9/MCkLwOs3zQrY4KIpihlooC2LqXiyKUsQ5zEoym9ksy1Lm3ShKCuY7LCpysl8tyiqvPK0qSqy6rasqurwoamrH2KxqOsXerOpahd2taga4n63qepSYbRsG3dusmmasXG2aJuEeaRoWljVpWprFq2p1lu2japuavajrSw71uOubpv2s6ytOq67oLXbrvu6hHuet6BFe86vtjS7vvevJPqe47Af+0GhL+iGbshsHXV+oH4ZZBggA=="
)

// shooter spiral

var bg_sim_2 = new BackgroundSimulation(
    
    [
        //[time,x,y,z]
        [0,22,19,2],
        [20000,22,19,.7],
        [21000,22,19,.7],
    ],
    "NrBEoGnLOvYTJ9mJetnXYzruD8i8TDTizKLrzaryBdCMG+t1juz9r3n/7oL5CBjZqIkipwmZNnS5ihcrEt56pRpWad2vVoMCma3Yf2mL5q2ZuWYxu4+tPbzt648YH7l75//PAL88b0Cw4IigqPD/UMiYhPik6OTVVPSUzMSsyLic/OzCjKLY8QLiivKqkq48msr66obmhDqWxo72rqi2pr7O/u7A3oHRofHB5RGJscnZ+clpuZmV5cmlhbXN7dXUDd2DrcOY/aOznfOM04ub47vSk0un2+fk6/uXz4+ld9e/r/+RjKAJB30BVl+oPBUJhVEhYNh0LB8JSAGUABYAe0xABcAKYAJwgACUAJYAc3ROMuGOx+KJAFUAA5I1muFH1Wm4wkkilU5Zc+kQZlshGWDnpQU8smU6ljKWMlmI5W5YF3BW82U5DUilWih5ijUy/mJHVKsX6k5qpFGvlyixmy0W7ISgVY7lE432hSOvV+q7W/2wW1a2S+50RzKur4hk2UcNOxMuwOR5Cx71p91C3Wp3NRlNJuDpnwJoNl9jRvPlwsGms4DUAEUxAHcAHZoDUAGTxADMM1WB25KzSszym22KF3e/264OzMPbo2W+2+FO+7ON/OC/6lxONGuZ9Wj7oF81dyudAfN3OgY8VeeS6Oid318fr4JT9qnxBxxegle30A29vgfToAJvd89m3cZQLPb8X0PCCgNAT9wlgt06R5BDIIg1CHW/X9XnAnDEzwkjkIorxoPIpDaKkMjKJo98GLoxi2PAFimPYmtOO4vjB141ihJ46j+K44SQlEiTpPE1opNksTFI4+SlIU4TBLUzSAQ01TdPuHSZL0v4DK0wzVhMozLImCyzNMtYbLsqy+gcpzXMqFzbLc5yVM83yNw8xy/IGAKvNC1U7yCyLmJ8wLYr1EKorCnoYqS1LDgSuLEr8DK0syiEUqyvKoRywrcvZAqitK8yKrKqr7JquravWBrKtazYSraxrFhapreoDCLOsG7Seq6ob+tGvrwQ6yaZsIaaJoWjh5rGlbJIG2bVpaZaNp25T1sW3bvP2zaTuCkbToOpxtsui6UIYIA="
)

// loose shooter matrix focused to one

var bg_sim_3 = new BackgroundSimulation(
    
    [
        //[time,x,y,z]
        [0,2,38,2],
        [10000,3,31,2],
        [20000,26,20,.6],
        [25000,26,20,.6],
    ],
    "NrBEoGnLOvYTJ9mJetnXYzruD8i8TDTizKLrzaryBdCMG+t1juz9r3n/7oL5CBjZqIkipwmZNnS5ihcrEt56pRpWad2vVoMCma3YdgBlABYB7awBcApgCcIAEWsB3AHb4rtxy7u3r429s5unj44fmGBkSH+4QBKAJYA5pZ2CbEQAKoADtkBeYXRocUFReGVZrWm9fpG4o0tda0NbZ0d3RzGPV3tgwPD/aPKfUOKMcVBUejT4bNVccFliStzaAsuqRlZazk18+XVpcfrJcuXI5O3N/IT92NPd89vr3qP7y8/338fvyIXwBbG2EVW5xySwOM3iMMWcMhxV2mSuRy2Jxc6OQYOxcFxZxBRMBN2BJP+5OJFOpn2alPpNIZVOZDzpjIIYOhSIREIxFy5fKhiMFyPSqPhWMJOMx125krRUvZLKVXDJKvVys1TMpaq1Gu1+sNLV1BosMoF0v5wstQt5NthdvxMpR+zlspFpwVXtNPqNqBNfsDeuDvsEAZDQdDUcjGHDBs51qdVsdZuTm3tPPTSZyLu9brxqcOisLFWL0YjmrjMYr5drRqrNerdcbwYbDITKagHazJczVwt2dFezzHvlEvdGbHTentzbM+bC/nDTnLcXq6Xs7Zje7/cTvY2u87oDBufHBa7MvPx8vZevFyv68fpK3a9fG7fgxXH+/79/QJfho7uOA77uCPYXmmVynvmt4EiOk4Tn+P5SF+SFoU+6GoRh2HIbhVBYb8QFuiBEG2uBd5kVBYquqOiGgVecFnreOHocIBGsRxLGPuxXF4bxf48U8RG0SRFEOuRwkIdBtEMTe8GDp6fFKU0Jj8WpynqYQgmcRpuk0tpmmGXprYAUZOnmdxpnGdZFmhgZNlmY5gL2bZrlOcuVluQ53n/C57n+T5xqeQFXmhR8fmBZFYWqsFUUhfFLwRdFyUJVpsUpXFmWSElqW5Vl/6qflRUZdl6V5SV5UoWVxWVTVqgVXVDUqU1tUtayhVtZ1rUFV1jXdTFHX9b1w2gDlfXjZh1UjRNuVjYaADqACGAA2y2wEtq3rSta3IBtO2gHtW2bTNNVzRGh04AAMotADOfY4Bd00pWdvqPWg113VOaBvSdz1TZpP1wB993oIDQ3gy96pg1AwNfbt23gzNkN6o9qMI1AaPHQd6PY1jiMtcjv349hhNPcTzak+TZPlpTRN0xqtPU0zzKM1TbM0/99Ps5xrNc3zvmc8z/NcbzQti5ug3C1Lk2S+L0tqaL3NK0yivy2ruiq3LWu0rLyva3xmt60biWC8b+tBob6tmzr5vWxplu21bbGm07jv6S7bt20qDte77Wg+67fvsAHnuB3gIdB5HA2hzHLYR2HscwPHiee8nUcp6NHvp9nzlZwnOdjGn+f5wwDBAA="
)

var allBackgroundSims = [
    bg_sim_1,
    bg_sim_2,
    bg_sim_3,
]

function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}
allBackgroundSims = shuffle(allBackgroundSims);
backgroundSimIndex = 0;

function resetStartMenuSim(){
    backgroundSimIndex = (backgroundSimIndex+1)%allBackgroundSims.length
    startMenuSim = allBackgroundSims[backgroundSimIndex];
    startMenuSim.simtime = 0;
    
    var start = startMenuSim.camCheckpoints[0]
    cameraX = start[1]
    cameraY = start[2]
    zoomLevel = start[3]
    importTilemapFromString( startMenuSim.mapString );
}


// graphics context
var canvas;
var ctx;

// src/core/game_state.js
var gameState = GameState.StartMenu;
var startMenuSim = null;

// gameplay settings
var baseShooterCooldown = 2000;
var bonusShooterCooldown = 1000;
var minShooterCooldown = -3000;
var bonusLaserTime = 10; 
var maxLaserTime = 1000;



// map variables
var tileSize = 32; // Size of each tile in virtual units
var mapWidth = 100;//map size in tiles
var mapHeight = 100;//map size in tiles
var tileMap = []
for (var i = 0; i < mapWidth; i++) {
  tileMap[i] = new Array(mapHeight);
}

// Camera variables
var cameraX = 0;
var cameraY = 0;
var zoomLevel = 1;
var cameraSpeed = .01; 
var zoomSpeed = 0.1; 
var minZoom = .5;


// Mouse variables
var mouseTileX = 0;
var mouseTileY = 0;
var canvasMouseX = 0;
var canvasMouseY = 0;  
var virtualMouseX = 0;
var virtualMouseY = 0;
var hoveredBlock = null;

// Keyboard input
var keys = {};

// Toolbar variables
var toolbarSlotCount = 10;
var selectedToolbarSlotIndex = 0;
var toolbarHovered = false;
var selectedDirectionIndex = 0;
var toolbarBlocks = [
    new Wall(0,0),
    new Shooter(0,0,Direction.Up),
    new Laser(0,0,Direction.Up)
]

//hud layout specs
var toolbarThickness = 40;
var toolbarX;
var toolbarY;



// Update game logic
function update(elapsedTime) {
    
    updateMousePos()

    if( gameState == GameState.StartMenu ){

        // automatic camera movement
        startMenuSim.update(elapsedTime)

    } else if( gameState==GameState.Playing ){

        // Camera panning with WASD keys
        if (keys[87]) cameraY -= cameraSpeed * elapsedTime; // W key (up)
        if (keys[83]) cameraY += cameraSpeed * elapsedTime; // S key (down)
        if (keys[65]) cameraX -= cameraSpeed * elapsedTime; // A key (left)
        if (keys[68]) cameraX += cameraSpeed * elapsedTime; // D key (right)

    }
    
    if( gameState != GameState.Paused ){
        // Update simulation
        for (var x = 0; x < mapWidth; x++) {
            for (var y = 0; y < mapHeight; y++) {
                var tileObject = tileMap[x][y];
                if( tileObject ) {
                    tileObject.update(elapsedTime)
                }
          }
        }
    }
}

function updateMousePos(event){
    
    if( event ){
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        canvasMouseX = (event.clientX - rect.left) * scaleX;
        canvasMouseY = (event.clientY - rect.top) * scaleY;
    }
    
    virtualMouseX = canvasMouseX / (tileSize * zoomLevel) + cameraX;
    virtualMouseY = canvasMouseY / (tileSize * zoomLevel) + cameraY;
    mouseTileX = Math.floor(virtualMouseX);
    mouseTileY = Math.floor(virtualMouseY);
    
    // hover over ui element 
    if( uiHovered() ){
        hoveredBlock = null
        
    //hover over block on map
    } else if( isTileOnMap(mouseTileX,mouseTileY) ) {
        hoveredBlock = tileMap[mouseTileX][mouseTileY]
        
    } else {
        hoveredBlock = null
    }
    
    
}

function mouseMove(event) {
    updateMousePos(event)
}

function mouseWheel(event){
    if( gameState != GameState.Playing ){
        return
    }
    
    var oldZoomLevel = zoomLevel;
    
    var delta = Math.sign(event.deltaY) * zoomSpeed;
    zoomLevel -= delta;
    if (zoomLevel < minZoom) zoomLevel = minZoom;

    // keep virtual mouse position consistent
    cameraX += canvasMouseX * (1 / (tileSize * oldZoomLevel) - 1 / (tileSize * zoomLevel))
    cameraY += canvasMouseY * (1 / (tileSize * oldZoomLevel) - 1 / (tileSize * zoomLevel))
    
    event.preventDefault();
}

function leftClick(event){
    updateMousePos(event)
    
    // click ui element 
    if( uiClicked() ){
        return;
    }
    
    // place block
    else if( (gameState == GameState.Playing) 
            && (selectedToolbarSlotIndex < toolbarBlocks.length) ){
            
        attemptPlaceBlock(
            mouseTileX,mouseTileY,
            allDirections[selectedDirectionIndex],
            toolbarBlocks[selectedToolbarSlotIndex]
        )
    }
}

function rightClick(event){
    
    if( gameState == GameState.Playing ){
        updateMousePos(event)
        attemptDeleteBlock(mouseTileX,mouseTileY)
    }
        
    event.preventDefault();
}

function keyDown(event) {
  keys[event.keyCode] = true;
  var k = event.keyCode;
  
  // Check if a number key is pressed (49-57 corresponds to keys 1-9)
  if (k >= 49 && k <= 57) {
    selectedToolbarSlotIndex = k - 49;
  }
  else if (k == 48 ) { // 0 key
    selectedToolbarSlotIndex = 9;
  }
  
  // r key: cycle directions
  else if (k == 82 ) {
    selectedDirectionIndex = 
        (selectedDirectionIndex+1)%allDirections.length;
  }
  
  // escape
  else if ( k == 27 ){
      
    if( gameState == GameState.PauseMenu ){
        gameState = GameState.Playing
        
    } else if ( gameState == GameState.Playing ){
        gameState = GameState.PauseMenu
    }
  }
  
}

function keyUp(event) {
  delete keys[event.keyCode];
}



// Initialize the game
function init() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");

    // position hud elements
    toolbarX = canvas.width/2 - toolbarThickness*toolbarSlotCount/2;
    toolbarY = canvas.height - toolbarThickness;

    // Add event listeners
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    canvas.addEventListener("mousemove", mouseMove);
    canvas.addEventListener("wheel", mouseWheel);
    canvas.addEventListener("click", leftClick);
    canvas.addEventListener('contextmenu', rightClick);

    // init start menu background simulation
    resetStartMenuSim()
    
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

// handle ui mouse interaction based on
// global mouse vars in src/globals.js

var toolbarUiRect = [
    toolbarX,
    toolbarY,
    toolbarThickness*toolbarSlotCount,
    toolbarThickness
]

var menuUiRect = [
    200,200,400,200
]

function playButton(){
    clearMap()
    cameraX = 0;
    cameraY = 0;
    zoomLevel = 1;
    gameState = GameState.Playing
}

function continueButton(){
    gameState = GameState.Playing
}

function quitButton(){
    resetStartMenuSim()
    gameState = GameState.StartMenu
}

function importButton(){
    var ta = document.getElementById("gameTextArea");
    importTilemapFromString( ta.value );
}

function exportButton(){
    var ta = document.getElementById("gameTextArea");
    ta.value = exportTilemapToString();
}

var menuClickAction = null;
var startMenuButtons = [
    {
        rect:[300,250,200,25],
        action:playButton,
        label: "Play",
        hovered: false,
    }
]

var pauseMenuButtons = [
    {
        rect:[300,250,200,25],
        action:continueButton,
        label: "Continue",
        hovered: false,
    },
    {
        rect:[300,300,200,25],
        action:importButton,
        label: "Import Map",
        hovered: false,
    },
    {
        rect:[300,325,200,25],
        action:exportButton,
        label: "Export Map",
        hovered: false,
    },
    {
        rect:[300,350,200,25],
        action:quitButton,
        label: "Quit",
        hovered: false,
    }
]


function getCurrentMenuButtonSet(){
    if (gameState == GameState.StartMenu) {
        return startMenuButtons
    } else if (gameState == GameState.PauseMenu) {
        return pauseMenuButtons
    } else {
        return []
    }
}

function mouseInRect(xywh){
    var [x,y,w,h] = xywh
    return (canvasMouseX>=x) 
        && (canvasMouseX<=x+w) 
        && (canvasMouseY>=y) 
        && (canvasMouseY<=y+h)
}

// update ui elements to reflect mouse hovering
// called in /src/mouse.js : updateMousePos
function uiHovered(){
    var hovered = false;
    if( hoverToolbar() ){ hovered = true}
    if( hoverMenu() ){ hovered = true}
    return hovered;
}

function hoverToolbar(){
    if( (gameState == GameState.Playing) && mouseInRect(toolbarUiRect) ){
        toolbarHovered = true;
        hoveredToolbarSlotIndex = Math.floor((canvasMouseX-toolbarX)/toolbarThickness)
    } else {
        toolbarHovered = false;
        hoveredToolbarSlotIndex = null;
    }
    return toolbarHovered;
}

function hoverMenu(){
    if( (gameState != GameState.Playing) && mouseInRect(menuUiRect) ){
        menuClickAction = null;
        var buttonSet = getCurrentMenuButtonSet();
        for( var i = 0 ; i < buttonSet.length ; i++ ){
            var btn = buttonSet[i]
            btn.hovered = mouseInRect(btn.rect)
            if( btn.hovered ){
                menuClickAction = btn.action;
            }
        }
        
        return true
    }
    
}

// check if ui element was clicked
// if so, trigger the action and return true
// called in /src/mouse.js : leftClick
function uiClicked(){
    
    if( (gameState == GameState.Playing) && toolbarHovered ){
        selectedToolbarSlotIndex = hoveredToolbarSlotIndex;
        //console.log('clicked consumed by toolbar ui')
        return true
        
    } else if ( (gameState != GameState.Playing) && menuClickAction){
        menuClickAction()
        //console.log('click consumed by menu ui')
        return true
    }
    
    //console.log('clicked passed through ui')
    return false
}


// Render graphics
function draw(fps) {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set the camera transformation
    ctx.setTransform(zoomLevel, 0, 0, zoomLevel, -cameraX * tileSize * zoomLevel, -cameraY * tileSize * zoomLevel);

    // Draw the tile map
    for (var x = 0; x < mapWidth; x++) {
        for (var y = 0; y < mapHeight; y++) {
            ctx.lineWidth = .5;
            ctx.strokeStyle = "black";
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            var tileObject = tileMap[x][y];
            if( tileObject ) {
                tileObject.draw(x * tileSize, y * tileSize, tileSize, tileSize)
            }
        }
    }

    // Draw tile object effects
    for (var x = 0; x < mapWidth; x++) {
        for (var y = 0; y < mapHeight; y++) {
            var tileObject = tileMap[x][y];
            if( tileObject ) {
                tileObject.drawChildren()
            }
        }
    }

    if( gameState == GameState.Playing ){
        if( !toolbarHovered ){
            if (isTileOnMap(mouseTileX,mouseTileY)) {
                
                // highlight hovered tile
                ctx.lineWidth = 3;
                ctx.strokeStyle = "black";
                ctx.strokeRect(mouseTileX * tileSize, mouseTileY * tileSize, tileSize, tileSize);

                // draw extra overlays about the hovered block
                if( hoveredBlock ){
                    
                }
                
                // draw block blueprint if player has a block selected
                else if( selectedToolbarSlotIndex < toolbarBlocks.length ){
                    block = toolbarBlocks[selectedToolbarSlotIndex];
                    
                    ctx.globalAlpha = 0.5;
                    block.draw(
                        mouseTileX * tileSize, 
                        mouseTileY * tileSize, 
                        tileSize, tileSize)
                    ctx.globalAlpha = 1;
                }
            } 
        }
    }

    // Reset the transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // draw hud/menu
    if( gameState != GameState.StartMenu ){
        drawToolbar();
    } 
    if( gameState != GameState.Playing ){
        drawMenu();
    }

    // Draw FPS on the screen
    ctx.font = "25px Arial";
    ctx.textAlign = "left";
    ctx.fillStyle = "black";
    var x = 10
    var y = 30
    ctx.fillText("FPS: " + fps, x, y);
    
    //y += 30
    //ctx.fillText(`camera: ${cameraX.toFixed(2)}, ${cameraY.toFixed(2)}, ${zoomLevel.toFixed(2)}`, x, y);
    //y += 30
    //ctx.fillText(gameState, x, y);
    //y += 30 
    //ctx.fillText(`canvas pos: ${canvasMouseX}, ${canvasMouseY}`, x, y);
    //y += 30
    //ctx.fillText(`virtual pos: ${virtualMouseX}, ${virtualMouseY}`, x, y);
}


function drawMenu(){
    
    // draw outline
    drawMenuRect(menuUiRect)
    
    // draw buttons
    var buttonSet = getCurrentMenuButtonSet();
    for( var i = 0 ; i < buttonSet.length ; i++ ){
        drawMenuButton(buttonSet[i])
    }
    
}

function drawMenuButton(btn){
    var r = btn.rect
    var fillStyle = (btn.hovered ? 'white' : 'gray')
    drawMenuRect(r,fillStyle)
    
    ctx.textAlign = "center";
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(btn.label, r[0]+r[2]/2, r[1]+r[3]-5);
}

function drawMenuRect(r,fillStyle="gray"){
    
    ctx.fillStyle = fillStyle;
    ctx.fillRect(r[0],r[1],r[2],r[3]);
    
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(r[0],r[1],r[2],r[3]);
}


function drawToolbar(){
    
    // Draw the toolbar
    var y = toolbarY;
    var w = toolbarThickness;
    var h = toolbarThickness;
    for ( var i = 0 ; i < toolbarSlotCount ; i++ ) {
        var x = toolbarX + i * toolbarThickness;
        drawToolbarSlot(x,y,w,h,i);
    }

    // highlight hovered slot
    if( hoveredToolbarSlotIndex != null ){
        var x = toolbarX + hoveredToolbarSlotIndex * toolbarThickness;
        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
        ctx.strokeRect(x,y,w,h);
    }

    // Draw the selected slot expanded
    var x = toolbarX + selectedToolbarSlotIndex * toolbarThickness;
    var m = .1;
    x -= m*w;
    y -= m*h;
    w += 2*m*w;
    h += 2*m*h;
    drawToolbarSlot(x,y,w,h,selectedToolbarSlotIndex);
}

function drawToolbarSlot(x,y,w,h,i){
    // Draw toolbar item
    if( i < toolbarBlocks.length ){
        var block = toolbarBlocks[i]
        block.dir = allDirections[selectedDirectionIndex]
        block.draw(x,y,w,h)
    } else {
        ctx.fillStyle = "gray";
        ctx.fillRect(x,y,w,h);
    }
    
    // Draw toolbar slot outline
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    ctx.strokeRect(x,y,w,h);
}



// https://stackoverflow.com/a/36805543
function canvas_arrow(context, fromx, fromy, tox, toy, r){
	var x_center = tox;
	var y_center = toy;
	
	var angle;
	var x;
	var y;
	
	context.beginPath();
	
	angle = Math.atan2(toy-fromy,tox-fromx)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;

	context.moveTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;
	
	context.lineTo(x, y);
	
	angle += (1/3)*(2*Math.PI)
	x = r*Math.cos(angle) + x_center;
	y = r*Math.sin(angle) + y_center;
	
	context.lineTo(x, y);
	
	context.closePath();
	
	context.fill();
}

// draw blocky arrow that fills a tile
function drawDirectionIndicator(x,y,w,h,dir) {
    
    var hp = [x+w/2, y+h/2]
    var tp = [x+w/2 - dir.dx*w/2, y+h/2 - dir.dy*h/2]
    var r = Math.min(w,h)/4
    canvas_arrow(ctx, tp[0], tp[1], hp[0], hp[1], r);
}
