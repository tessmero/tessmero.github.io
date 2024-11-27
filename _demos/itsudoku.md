---
layout: demo
title: "Itsudoku"
date: 2024-11-02
lastUpdated: 2024-11-02
lastUpdatedSubversion: "a"
techs:
sound: true
---


<div id="itsudokucontainer" >
  <canvas id="backCanvas"></canvas>
  <canvas id="frontCanvas"></canvas>
</div>

      
      
  

<style>
    
    #itsudokucontainer {
        position: absolute;
        top: 0px;
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    html, body {
        margin: 0;
        padding: 0;
        overflow: hidden; /* Prevent scrolling */
        width: 100vw;
        height: 100vh;
        background-color: rgb(240,240,240);

        
    }

    .pixelated {
      image-rendering: optimizeSpeed;             /* Older versions of FF          */
      image-rendering: -moz-crisp-edges;          /* FF 6.0+                       */
      image-rendering: -webkit-optimize-contrast; /* Safari                        */
      image-rendering: -o-crisp-edges;            /* OS X & Windows Opera (12.02+) */
      image-rendering: pixelated;                 /* Awesome future-browsers       */
      -ms-interpolation-mode: nearest-neighbor;   /* IE                            */
    }

    canvas {

        background: transparent;
        position: absolute;
        width: 100vh; /* Full vertical height when in portrait mode */
        height: 100vh; /* Full height for consistency */
        max-width: 66vh; /* In landscape, restrict width to viewport */
        object-fit: cover; /* Ensures cropping to center */
    }
</style>