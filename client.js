let canvas;
let gl;

function initialize() {
  canvas = document.getElementById('canvas');
  gl = canvas.getContext('webgl');
  resizeWindow();
}

function render() {
  gl.clearColor(0, 1, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function resizeWindow() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

window.addEventListener('load', initialize);
window.addEventListener('resize', resizeWindow, false);
