
<canvas id="gameCanvas">
</canvas>
<script src="js/raincatcher.js?v=7"></script>

<a id="source-link" href="https://github.com/tessmero/idle">source</a>

<style>
    canvas {
        border: 1px solid black;
    }
    
    * { margin: 0; padding: 0;}

    body, html { height:100%; } 

    canvas {
        position:absolute;
        left: 0px;
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

