
<canvas id="gameCanvas" width="800" height="600"></canvas>
<script src="js/sugarcubes.js?v=1"></script>
<br>
<p>
    <a href="https://github.com/tessmero/sugarcubes">source github repo here</a>
</p>
      
      
<script>
    var canvas = document.getElementById('gameCanvas');
    var heightRatio = 6/8;
    canvas.height = canvas.width * heightRatio;
</script>
<style>
#gameCanvas {
    width: 100%;
    max-width: 800px;
}
</style>