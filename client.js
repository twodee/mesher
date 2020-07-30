const {ipcRenderer} = require('electron');

let canvas;
let gl;
let vertexArray;
let attributes;
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

  trackball = new Trackball();

  gl.cullFace(gl.BACK);
  // gl.enable(gl.CULL_FACE);
  gl.enable(gl.DEPTH_TEST);

  resizeWindow();

  // Register callbacks.
  canvas.addEventListener('mousedown', mouseDown);
  canvas.addEventListener('mouseup', mouseUp);
  canvas.addEventListener('wheel', mouseWheel);

  // This goes on the window rather than the canvas so that drags can keep
  // going even when the mouse goes off the canvas.
  window.addEventListener('mousemove', mouseMove);

  ipcRenderer.send('getPath');
  reset();
}

// --------------------------------------------------------------------------- 

function reset() {
  zoom = -10;
  trackball.reset();
}

// --------------------------------------------------------------------------- 

function load(path) {
  console.log(path);
  // delete shader program, vertex array, vertex attributes
  
  if (this.shaderProgram) {
    this.shaderProgram.destroy();
    this.attributes.destroy();
    this.vertexArray.destroy();
  }

  // trimesh = TrimeshIO.readObj(path);
  // trimesh = Trimesh.sphere(1, new Vector3(0, 0, 0), 8, 8);

  trimesh = Prefab.cube();
  trimesh.separateFaces();

  attributes = new VertexAttributes();
  attributes.addAttribute('vposition', trimesh.vertexCount, 4, trimesh.getFlatPositions());
  attributes.addAttribute('vnormal', trimesh.vertexCount, 4, trimesh.getFlatNormals());
  attributes.addIndices(trimesh.getFlatFaces());

  const barycentricCoordinates = new Array(trimesh.vertexCount * 3);
  for (let i = 0; i < trimesh.vertexCount * 3; ) {
    barycentricCoordinates[i + 0] = 1;
    barycentricCoordinates[i + 1] = 0;
    barycentricCoordinates[i + 2] = 0;
    i += 3;

    barycentricCoordinates[i + 0] = 0;
    barycentricCoordinates[i + 1] = 1;
    barycentricCoordinates[i + 2] = 0;
    i += 3;

    barycentricCoordinates[i + 0] = 0;
    barycentricCoordinates[i + 1] = 0;
    barycentricCoordinates[i + 2] = 1;
    i += 3;
  }
  attributes.addAttribute('vbarycentric', trimesh.vertexCount, 3, barycentricCoordinates);

  let vertexSource = `#version 300 es
uniform mat4 projection;
uniform mat4 modelview;

in vec4 vposition;
in vec4 vnormal;
in vec3 vbarycentric;

out vec3 fposition;
out vec3 fnormal;
out vec3 fcolor;
out vec3 fbarycentric;

void main() {
  gl_Position = projection * modelview * vposition;

  fposition = (modelview * vposition).xyz;
  fcolor = vec3(1.0);
  fnormal = normalize((modelview * vnormal).xyz);
  fbarycentric = vbarycentric;
}
  `;

  let fragmentSource = `#version 300 es
precision mediump float;

in vec3 fposition;
in vec3 fnormal;
in vec3 fcolor;
in vec3 fbarycentric;

out vec4 fragmentColor;

float edgeFactor() {
  vec3 d = fwidth(fbarycentric);
  vec3 a3 = smoothstep(vec3(0.0), d * 1.5, fbarycentric);
  return min(min(a3.x, a3.y), a3.z);
}

void main() {
  // if (any(lessThan(fbarycentric, vec3(0.1)))) {
  if (edgeFactor() < 0.4) {
    // fragmentColor = vec4(fbarycentric, 1.0); //vec4(fcolor * litness, 1.0);
    vec3 fragment_to_light = normalize(vec3(0.0) - fposition);
    vec3 normal = normalize(fnormal);
    float litness = max(0.0, dot(normal, fragment_to_light));
    // fragmentColor = vec4(fcolor * litness, 1.0);
    fragmentColor = vec4(1.0);
  } else {
    discard;
  }
}
  `;

  // wireframe http://codeflow.org/entries/2012/aug/02/easy-wireframe-display-with-barycentric-coordinates/

  shaderProgram = new ShaderProgram(vertexSource, fragmentSource);
  vertexArray = new VertexArray(shaderProgram, attributes);

  reset();
  render();
}

// --------------------------------------------------------------------------- 

function render() {
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  if (trimesh) {
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

ipcRenderer.on('setPath', (event, path) => {
  load(path);
});
