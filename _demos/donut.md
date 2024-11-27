---
layout: demo
title: "Donut"
date: 2023-10-08
lastUpdated: 2023-10-08
techs:
---


<canvas id="gameCanvas">
</canvas>



<style>
    canvas {
        border: 1px solid black;
    }
    
    * { margin: 0; padding: 0;}

    body, html { height:100%; } 

    canvas {
        position:absolute;
        left: 0px;
top: 0px;
        width:100%;
        height:100%;
    }    
    
    #source-link {
        font-size:10px;
        position: fixed;
        z-index: 999;
        bottom: 0px;
        left: 50%;
        transform: translate(-50%, 0%);
        background-color: black;
        color: white !important;
        padding: 2px;
    }
</style>

