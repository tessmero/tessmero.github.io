---
layout: demo
title: "Avalanche"
date: 2024-11-10
lastUpdated: 2024-12-31
changelog:
  2024-12-31 Game starts in fullscreen mode
techs:
  - three-js
  - multitouch
sound: true
music: true

---

<iframe id="gameFrame" src="/iframe/avalanche/index.html" allowfullscreen></iframe>


<!--<button onclick="toggleFullscreen()">Fullscreen</button>-->
<style>


    #gameFrame {
      flex-grow: 1;
    }
</style>

<script>
function toggleFullscreen() {
    const iframe = document.getElementById('gameFrame');
    if (!document.fullscreenElement) {
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.mozRequestFullScreen) { // Firefox
            iframe.mozRequestFullScreen();
        } else if (iframe.webkitRequestFullscreen) { // Chrome, Safari and Opera
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) { // IE/Edge
            iframe.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            document.msExitFullscreen();
        }
    }
}
</script>