---
layout: demo
title: "Boating School"
date: 2024-10-27
lastUpdated: 2024-10-27
techs:
  - idle-engine
  - infinite-canvas
sound: true
music: true
---

<canvas id="gameCanvas"></canvas>


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
    
    * { margin: 0; padding: 0;}

    body, html { height:100%; overflow:hidden; background-color:#CCC}

</style>