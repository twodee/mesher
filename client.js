let canvas;
let gl;
let vertexArray;
let attriutes;
let shaderProgram;
let projection;
let modelview;
let trackball;
let trimesh;
let zoom;

// --------------------------------------------------------------------------- 

function initialize() {
  canvas = document.getElementById('canvas');
  gl = canvas.getContext('webgl2');
  zoom = -10;

  trimesh = TrimeshIO.readObj('/Users/johnch/Desktop/cylinder.obj');
  // trimesh = Prefab.cube();

  attributes = new VertexAttributes();
  attributes.addAttribute('vposition', trimesh.vertexCount, 4, trimesh.getFlatPositions());
  attributes.addAttribute('vnormal', trimesh.vertexCount, 4, trimesh.getFlatNormals());
  attributes.addIndices(trimesh.getFlatFaces());

  let vertexSource = `#version 300 es
uniform mat4 projection;
uniform mat4 modelview;

in vec4 vposition;
in vec4 vnormal;

out vec3 fposition;
out vec3 fnormal;
out vec3 fcolor;

void main() {
  gl_Position = projection * modelview * vposition;

  fposition = (modelview * vposition).xyz;
  fcolor = vec3(1.0);
  fnormal = normalize((modelview * vnormal).xyz);
}
  `;

  let fragmentSource = `#version 300 es
precision mediump float;

in vec3 fposition;
in vec3 fnormal;
in vec3 fcolor;

out vec4 fragmentColor;

void main() {
  vec3 fragment_to_light = normalize(vec3(0.0) - fposition);
  vec3 normal = normalize(fnormal);
  float litness = max(0.0, dot(normal, fragment_to_light));
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
  canvas.addEventListener('wheel', mouseWheel);

  // This goes on the window rather than the canvas so that drags can keep
  // going even when the mouse goes off the canvas.
  window.addEventListener('mousemove', mouseMove);
}

// --------------------------------------------------------------------------- 

function render() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  const center = Matrix4.translate(-trimesh.centroid.x, -trimesh.centroid.y, -trimesh.centroid.z);

  shaderProgram.bind();
  shaderProgram.setUniformMatrix4('projection', projection);
  shaderProgram.setUniformMatrix4('modelview', Matrix4.translate(0, 0, zoom).multiplyMatrix(trackball.rotation).multiplyMatrix(center));
  // shaderProgram.setUniformMatrix4('modelview', new Matrix4());

  vertexArray.bind();
  // vertexArray.drawSequence(gl.POINTS);
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

function mouseWheel(e) {
  zoom += e.wheelDelta * 0.01;
  if (zoom >= 0) {
    zoom = -0.01;
  }
  render();
}

// --------------------------------------------------------------------------- 

window.addEventListener('load', initialize);
window.addEventListener('resize', resizeWindow, false);
