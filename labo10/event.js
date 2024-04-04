document.getElementById("tick").onclick = Scene.tick;
document.getElementById("reset").onclick = Scene.reset;
document.getElementById("start").onclick = Scene.start;
document.getElementById("stop").onclick = Scene.stop;
window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);

window.addEventListener("load", function() { 
  var drawpad = document.getElementById('drawpad');
  Scene.init(drawpad); 
}, false);