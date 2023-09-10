
<div>
 <canvas id="backLayer" style="position: absolute; left: 0; top: 0; z-index: 0;"></canvas>
 <canvas id="frontLayer" style="position: absolute; left: 0; top: 0; z-index: 1;"></canvas>
 </div>
 
<script src="js/sand.js?v=1"></script>

<a id="source-link" href="https://github.com/tessmero/sand">source</a>

<style>    
    * { margin: 0; padding: 0;}

    body, html { height:100%; background-color:black } 
    
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

