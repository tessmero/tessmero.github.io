---
layout: demo
title: "Sketch Ball"
date: 2024-12-07
lastUpdated: 2024-12-22
lastUpdatedSubversion: "a"
changelog:
  - 2024-12-14 Add title screen and moving obstacles
  - 2024-12-22 Add basic level editor
techs:
  - three-js
  - physics
  - multitouch
---


<canvas id="backCanvas" style="z-index:1;"></canvas>

<canvas id="threeCanvas" style="z-index:2;"></canvas>

<canvas id="blocker" style="z-index:3; background-color:rgb(200,200,200); display:none"></canvas>

<canvas id="sketchGuideCanvas" style="z-index:4; display:none"></canvas>

<canvas id="sketchCanvas" style="z-index:5;"></canvas>

<canvas id="guiCanvas" style="z-index:6;"></canvas>



<style>
    * { margin: 0; padding: 0;}

    body, html { 
      height:100%; 
      overflow:hidden; 
      background-color:rgb(200,200,200);
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