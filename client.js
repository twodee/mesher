let canvas;
let gl;
let vertexArray;
let attriutes;
let shaderProgram;
let projection;
let modelview;

function initialize() {
  canvas = document.getElementById('canvas');
  gl = canvas.getContext('webgl2');

  attributes = new VertexAttributes();
  let positions = [
    0.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,
  ];
  attributes.addAttribute('vposition', 3, 4, positions);
  
  let vertexSource = `#version 300 es
uniform mat4 projection;
uniform mat4 modelview;

in vec4 vposition;

void main() {
  gl_Position = projection * modelview * vposition;
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

  modelview = Matrix4.translate(-0.1, 0.1, 0);

  resizeWindow();
}

function render() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('projection', projection);
  shaderProgram.setUniformMatrix4('modelview', modelview);

  vertexArray.bind();
  vertexArray.drawSequence(gl.TRIANGLES);
  vertexArray.unbind();

  shaderProgram.unbind();
}

function resizeWindow() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  updateProjection();
  render();
}

function updateProjection() {
  let windowAspect = canvas.width / canvas.height;
  projection = Matrix4.ortho(0, 1, 0, 1);
}

window.addEventListener('load', initialize);
window.addEventListener('resize', resizeWindow, false);
