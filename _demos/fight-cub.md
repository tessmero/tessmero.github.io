---
layout: demo
title: "Fight Cub"
date: 2024-09-14
lastUpdated: 2024-09-14
techs:
  - physics
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
      background-color:#AAA;
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

