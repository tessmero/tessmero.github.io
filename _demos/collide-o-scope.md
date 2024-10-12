---
layout: demo
title: "Collide-o-Scope"
date: 20241012
last_updated: 20241012
techs: 
  - html5-composite
  - idle-engine
  - procedural-motion
---


  
<canvas id="gameCanvas"></canvas>
<canvas id="backCanvas"></canvas>
<canvas id="gifCanvas" width=100 height=100></canvas>

<style>
    #gameCanvas {
        border: none;
        background: transparent;
        position:absolute;
        left: 0px;
        width:100%;
        height:100%;
        z-index: 1;
    }

    #backCanvas {
        border: none;
        background:transparent; 
        position:absolute;
        left: 0px;
        width:100%;
        height:100%;
        z-index: -1;
    }
    
    * { margin: 0; padding: 0;}

    body, html { height:100%; }

</style>
