---
layout: demo
title: "Space Quest"
date: 2024-09-07
lastUpdated: 2024-10-08
techs:
  - idle-engine
  - infinite-canvas
  - procedural-world
changelog:
  - 2024-10-08 fix memory leak where perlin generator saved all outputs
sound: true
music: true
---


<canvas id="gameCanvas">
</canvas>


<style>
    
    * { margin: 0; padding: 0;}

    body, html { 
      height:100%; 
      overflow:hidden; 
      background-color:black
    }

    canvas {
      border: none;
    }

    #gameCanvas {
        position:absolute;
        left: 0px;
top: 0px;
        width:100%;
        height:100%;
        z-index: 3;
          background:transparent; 
    }

    body {
     height: 100vh; 
     height: -webkit-fill-available; 
     min-height: 100vh; /* Fallback for browsers that do not support Custom Properties */
     min-height: -webkit-fill-available; 
    }
</style>

