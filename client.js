let canvas;
let gl;
let vertexArray;
let attriutes;
let shaderProgram;

function initialize() {
  canvas = document.getElementById('canvas');
  gl = canvas.getContext('webgl2');

  attributes = new VertexAttributes();
  let positions = [
    -1.0, -1.0, 0.0, 1.0,
    1.0, -1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
  ];
  attributes.addAttribute('vposition', 3, 4, positions);
  
  let vertexSource = `#version 300 es
in vec4 vposition;
void main() {
  gl_Position = vposition;
}
  `;

  let fragmentSource = `#version 300 es
precision mediump float;

out vec4 fragmentColor;

void main() {
  fragmentColor = vec4(1.0, 0.0, 0.5, 1.0);
}
  `;

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  vertexArray = new VertexArray(shaderProgram, attributes);

  resizeWindow();
}

function render() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  shaderProgram.bind();
  vertexArray.bind();
  vertexArray.drawSequence(gl.TRIANGLES);
  vertexArray.unbind();
  shaderProgram.unbind();
}

function resizeWindow() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  render();
}

window.addEventListener('load', initialize);
window.addEventListener('resize', resizeWindow, false);
