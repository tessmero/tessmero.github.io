---
layout: demo
title: "Cube Dance"
date: 2024-11-25
lastUpdated: 2024-11-25
lastUpdatedSubversion: "a"
techs:
  - idle-engine
sound: true
music: true
---


<canvas id="backCanvas" style="z-index:1;"></canvas>

<canvas id="threeCanvas" style="z-index:2;"></canvas>

<canvas id="frontCanvas" style="z-index:3;"></canvas>

<div id="transCanvasContainer" style="pointer-events: none; position: absolute; width: 100%; height: 100%; overflow: hidden;">
  <canvas id="transCanvas" style="pointer-events: none; z-index: 4; position: absolute; width: 200%; height: 200%;"></canvas>
</div>




<style>
    * { margin: 0; padding: 0;}

    body, html { 
      height:100%; 
      overflow:hidden; 
      background-color:#AAA;
    }

    canvas {
      border: none;
        position:absolute;
        left: 0px;
top: 0px;
        width:100%;
        height:100%;
          background:transparent; 
    }

    body {
     height: 100vh; 
     height: -webkit-fill-available; 
     min-height: 100vh; /* Fallback for browsers that do not support Custom Properties */
     min-height: -webkit-fill-available; 
    }
</style>