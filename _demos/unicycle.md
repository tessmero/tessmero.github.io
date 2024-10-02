---
layout: demo
title: "Unicycle"
date: 20230806
last_updated: 20230806
---


  
  
<div id="game"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.12.0/matter.min.js"></script>


<style>
    
    * { margin: 0; padding: 0;}

    body, html { height:100%; }

    #game {
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

