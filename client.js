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
    0, 0, 1, 1,
    1, 0, 1, 1,
    0, 1, 1, 1,
    1, 1, 1, 1,

    0, 0, 0, 1,
    1, 0, 0, 1,
    0, 1, 0, 1,
    1, 1, 0, 1,

    1, 0, 1, 1,
    1, 0, 0, 1,
    1, 1, 1, 1,
    1, 1, 0, 1,

    0, 0, 0, 1,
    0, 0, 1, 1,
    0, 1, 0, 1,
    0, 1, 1, 1,

    0, 1, 1, 1,
    1, 1, 1, 1,
    0, 1, 0, 1,
    1, 1, 0, 1,

    0, 0, 0, 1,
    1, 0, 0, 1,
    0, 0, 1, 1,
    1, 0, 1, 1,
  ];

  let normals = [
    0, 0, 1, 0,
    0, 0, 1, 0,
    0, 0, 1, 0,
    0, 0, 1, 0,

    0, 0, -1, 0,
    0, 0, -1, 0,
    0, 0, -1, 0,
    0, 0, -1, 0,

    1, 0, 0, 0,
    1, 0, 0, 0,
    1, 0, 0, 0,
    1, 0, 0, 0,

    -1, 0, 0, 0,
    -1, 0, 0, 0,
    -1, 0, 0, 0,
    -1, 0, 0, 0,

    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,
    0, 1, 0, 0,

    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
    0, -1, 0, 0,
  ];

  let indices = [
    0, 1, 3,
    0, 3, 2,
    5, 4, 6,
    5, 6, 7,
    8, 9, 11,
    8, 11, 10,
    12, 13, 15,
    12, 15, 14,
    16, 17, 19,
    16, 19, 18,
    20, 21, 23,
    20, 23, 22,
  ];

  attributes.addAttribute('vposition', 24, 4, positions);
  attributes.addAttribute('vnormal', 24, 4, normals);
  attributes.addIndices(indices);
  
  let vertexSource = `#version 300 es
uniform mat4 projection;
uniform mat4 modelview;

in vec4 vposition;
in vec4 vnormal;

out vec3 fnormal;
out vec3 fcolor;

void main() {
  gl_Position = projection * modelview * vposition;
  fcolor = vposition.xyz;
  fnormal = vnormal.xyz;
}
  `;

  let fragmentSource = `#version 300 es
precision mediump float;

in vec3 fcolor;
in vec3 fnormal;
out vec4 fragmentColor;

void main() {
  float litness = abs(dot(fnormal, normalize(vec3(1, 1, 1))));
  fragmentColor = vec4(fcolor * litness, 1.0);
}
  `;

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  vertexArray = new VertexArray(shaderProgram, attributes);

  trackball = new Trackball();

  gl.cullFace(gl.BACK);
  gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  resizeWindow();

  // Register callbacks.
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);

  // This goes on the window rather than the canvas so that drags can keep
  // going even when the mouse goes off the canvas.
  window.addEventListener('mousemove', mouseMove);
}

// --------------------------------------------------------------------------- 

function render() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('projection', projection);
  shaderProgram.setUniformMatrix4('modelview', Matrix4.translate(0, 0, -10).multiplyMatrix(trackball.rotation).multiplyMatrix(Matrix4.translate(-0.5, -0.5, -0.5)));
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
  // projection = Matrix4.ortho(-1, 1, -1, 1);
  projection = Matrix4.fovPerspective(45, windowAspect, 0.01, 1000);
}

function mouseDown(e) {
  trackball.start(e.clientX, canvas.height - 1 - e.clientY);
}

function mouseMove(e) {
  if (e.buttons === 1) {
    trackball.drag(e.clientX, canvas.height - 1 - e.clientY, 3);
    render();
  }
}

function mouseUp(e) {
}

// --------------------------------------------------------------------------- 

window.addEventListener('load', initialize);
window.addEventListener('resize', resizeWindow, false);
