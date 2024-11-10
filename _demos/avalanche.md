---
layout: demo
title: "Avalanche"
date: 2024-11-10
lastUpdated: 2024-11-10
lastUpdatedSubversion: "a"
techs:
  - idle-engine
  - procedural-motion
sound: true
music: true
---


<canvas id="sm-particleCanvas" style="z-index:100px"></canvas>
<canvas id="sm-textCanvas" style='z-index:200'></canvas>
<canvas id="backCanvas"></canvas>
<canvas id="frontCanvas"></canvas>
      
      
  
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
      