---
layout: demo
layout: demo
title: "Rain Catcher"
date: 2024-01-28
lastUpdated: 2024-08-31
sound: true
techs:
  - physics
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
        cursor:none;
        background-color: #AAA;
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
        
        -webkit-touch-callout:none;
        -webkit-user-select:none;
        -khtml-user-select:none;
        -moz-user-select:none;
        -ms-user-select:none;
        user-select:none;
        -webkit-tap-highlight-color:rgba(0,0,0,0);
    }
</style>

