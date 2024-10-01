---
layout: demo
title: "Wheely"
date: 20240929
last_updated: 20240929
techs:
  - idle-engine
  - dynamic-sim
  - infinite-canvas
  - procedural-world
---


<canvas id="gameCanvas">
</canvas>


<style>
    canvas: {
      border: none;
    }

    #gameCanvas {
        position:absolute;
        top:0px;
        left: 0px;
top: 0px;
        width:100%;
        height:100%;
        z-index: 100;
          background:transparent; 
    }
    
    * { margin: 0; padding: 0;}

    body, html { height:100%; overflow:hidden; background-color:#DDF}

</style>

