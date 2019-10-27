let canvas;
let gl;
let vertexArray;
let attriutes;
let shaderProgram;
let projection;
let modelview;
let trackball;

function initialize() {
  canvas = document.getElementById('canvas');
  gl = canvas.getContext('webgl2');

  attributes = new VertexAttributes();

  let positions = [
    0.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
    0.0, 1.0, 0.0, 1.0,
    1.0, 1.0, 0.0, 1.0,

    0.0, 0.0, 1.0, 1.0,
    1.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 1.0, 1.0,
    1.0, 1.0, 1.0, 1.0,
  ];

  let indices = [
    0, 1, 3,
    0, 3, 2,
    1, 5, 7,
    1, 7, 3,
    2, 3, 7,
    2, 7, 6,
    4, 0, 2,
    4, 2, 6,
    5, 4, 6,
    5, 6, 7,
    4, 5, 1,
    4, 1, 0,
  ];

  attributes.addAttribute('vposition', 3, 4, positions);
  attributes.addIndices(indices);
  
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

  trackball = new Trackball();
  // modelview = Matrix4.translate(-0.1, 0.1, 0);
  modelview = Matrix4.rotate(Vector4.forward(), 45);

  resizeWindow();

  // Register callbacks.
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);

  // This goes on the window rather than the canvas so that drags can keep
  // going even when the mouse goes off the canvas.
  window.addEventListener('mousemove', mouseMove);

  gl.cullFace(gl.BACK);
  gl.enable(gl.CULL_FACE);
}

// --------------------------------------------------------------------------- 

function render() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('projection', projection);
  shaderProgram.setUniformMatrix4('modelview', trackball.rotation);
  // shaderProgram.setUniformMatrix4('modelview', new Matrix4());

  vertexArray.bind();
  vertexArray.drawIndexed(gl.TRIANGLES);
  vertexArray.unbind();

  shaderProgram.unbind();
}

function resizeWindow() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
  trackball.setViewport(canvas.width, canvas.height);
  updateProjection();
  render();
}

function updateProjection() {
  let windowAspect = canvas.width / canvas.height;
  projection = Matrix4.ortho(-1, 1, -1, 1);
}

function mouseDown(e) {
  trackball.start(e.clientX, e.clientY);
}

function mouseMove(e) {
  if (e.buttons === 1) {
    trackball.drag(e.clientX, e.clientY);
    render();
  }
}

function mouseUp(e) {
}

// --------------------------------------------------------------------------- 

window.addEventListener('load', initialize);
window.addEventListener('resize', resizeWindow, false);
