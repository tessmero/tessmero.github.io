---
layout: demo
title: "Rocket Car"
date: 2024-11-17
lastUpdated: 2024-11-17
techs:
  - idle-engine
  - procedural-world
---


<canvas id="tpAnimCanvas"></canvas>  
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
