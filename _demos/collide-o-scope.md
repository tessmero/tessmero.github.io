---
layout: demo
title: "Collide-o-Scope"
date: 2024-10-12
lastUpdated: 2024-10-12
techs: 
sound: true
music: false
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
        top: 0px;
        width:100%;
        height:100%;
        z-index: 1;
    }

    #backCanvas {
        border: none;
        background:transparent; 
        position:absolute;
        left: 0px;
        top: 0px;
        width:100%;
        height:100%;
        z-index: -1;
    }

    #gifCanvas {
        border: none;
        background:transparent; 
        position:absolute;
        left: -110px;
        top: -110px;
        width: 100px;
        height:100px;
        z-index: -2;
    }
    
    * { margin: 0; padding: 0;}

    body { height:100%; background-color:#555 }

</style>
