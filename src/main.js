import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { states } from "./states";
import { Group, Tween } from "@tweenjs/tween.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { loadPositions, scaleData} from "./loadPositions";


let scene, camera, renderer, gui;
let pitch, tween, controls, ball;
let boats = [];
let tweens = {};
let guiSettings = {
  boatNumber: 1,
  Reset: resetStates,
  animationSpeed: 5,
  "Upload File": () => {
    document.getElementById("animation-file-input").click();
  },
};
let animating, animationCounter;
let speed = 10000 / guiSettings.animationSpeed;
let scale = 0.02;
let currentState = 0;
let pitchWidth = 30;
let pitchHeight = 15;
window.states = scaleData(states, pitchWidth, pitchHeight);
let initialStates = window.states.boatStates[currentState];

document
  .getElementById("animation-file-input")
  .addEventListener("change", () => {
    console.log(pitchWidth, pitchHeight);
    loadPositions(pitchWidth, pitchHeight);
  });

function resetStates() {
  tweens = {};
  currentState = 0;
  createAnimation();
}

function ensureNonIndexed(geometry) {
  return geometry.index ? geometry.toNonIndexed() : geometry;
}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    logarithmicDepthBuffer: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.setClearColor("#ecf2f9");
  document.body.appendChild(renderer.domElement);
  renderer.domElement.tabIndex = 0; // Make it focusable
  renderer.domElement.focus(); // Set focus

  createPitch();
  createBall();
  initialStates.forEach((state) => {
    createBoat(state);
  });
  //good position from pitch top
  // camera.position.z = 17;
  // camera.position.y = 14;
  // camera.position.x = 8.7;
  // camera.rotation.x = -1.18;

  gui = new GUI();
  gui.add(guiSettings, "boatNumber", 1, 10, 1);
  gui.add(guiSettings, "animationSpeed", 1, 20, 1);
  gui.add(guiSettings, "Reset");
  gui.add(guiSettings, "Upload File");
  const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
  directionalLight.position.y = 30;
  directionalLight.target = pitch;
  scene.add(directionalLight);
  const ambientLight = new THREE.AmbientLight("#ffffff", 1);
  ambientLight.position.y = 20;

  scene.add(ambientLight);

  directionalLight.castShadow = true;

  controls = new OrbitControls(camera, renderer.domElement);
}
function animateToNextState(object, objStates, ball = false) {
  if (!objStates[currentState]) {
    animating = false;
    return;
  }
  // // console.log(object.id)
  // if (ball) {
  //   console.log(object, currentState);
  // }
  let [positionState, rotationState] = objStates[currentState];
  speed = 10000 / guiSettings.animationSpeed;
  const tweenPosition = new Tween(object.mesh.position)
    .to(positionState, speed)
    .onComplete(() => {
      if (object.id === 1) {
        currentState += 1;
      }
      animateToNextState(object, objStates, ball);
    })
    .onUpdate(() => {})
    .start();

  const tweenRotation = new Tween(object.mesh.rotation)
    .to(rotationState, speed)
    .onComplete(() => {
      // console.log("complete");
      animateToNextState(object, objStates, ball);
    })
    .onUpdate(() => {})
    .start();
  tween = new Group(tweenPosition, tweenRotation);
  tweens[object.id] = tween;
  // return true;
}
function createPitch() {
  const texture = new THREE.TextureLoader().load(
    "Textures/AdobeStock_154153098_Preview.jpeg"
  );

  // Note because I have been working on a 2D plane width is the long axis and height is the short axis
  // My past self is very sorry for the inconvenience but it made sense at the time...

  // pitchWidth = states.width * scale;
  // pitchHeight = states.height * scale;

  const pitchGeo = new THREE.BoxGeometry(pitchWidth, pitchHeight, 3);
  const pitchMat = new THREE.MeshStandardMaterial({ map: texture });
  pitch = new THREE.Mesh(pitchGeo, pitchMat);

  scene.add(pitch);
  pitch.rotation.x = Math.PI / 2;
  pitch.position.y = -1.5;
  pitch.position.x = pitchWidth / 2;
  pitch.position.z = pitchHeight / 2;

  const goalGeo = new THREE.BoxGeometry(0.5, 1.5, 1.5);
  const goalTexture = new THREE.TextureLoader().load("Textures/net-mesh.jpg");
  const goalMat = new THREE.MeshStandardMaterial({ map: goalTexture });
  const goal1 = new THREE.Mesh(goalGeo, goalMat);
  const goal2 = new THREE.Mesh(goalGeo, goalMat);
  goal1.position.set(0, 3, pitchHeight / 2);
  goal2.position.set(pitchWidth, 3, pitchHeight / 2);

  scene.add(goal1);
  scene.add(goal2);
}
function createBall() {
  // console.log(ballStates)
  const ballGeo = new THREE.SphereGeometry(0.3);
  const ballMat = new THREE.MeshStandardMaterial({ color: "#9d66cc" });
  const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  ballMesh.position.set(
    window.states.ballStates[0].x * scale,
    2,
    window.states.ballStates[0].y * scale
  );
  scene.add(ballMesh);
  ball = { id: "ball", mesh: ballMesh };
}
function createBoat(state) {
  // const geo = new THREE.CapsuleGeometry(0.5, 2.5, 4, 3);

  const shape = new THREE.Shape();
  let x = 0;
  const y = 0;
  const w = 1;
  const h = 2.5;
  shape.moveTo(x - w / 2, y);
  shape.bezierCurveTo(x - w / 2, y, x - w / 4, y + h, x - w / 4, y + h);
  shape.bezierCurveTo(x - w / 4, y + h, x, y + h + h * 0.1, x + w / 4, y + h);
  shape.bezierCurveTo(x + w / 4, y + h, x + w / 2, y, x + w / 2, y);

  // Bottom curve
  shape.bezierCurveTo(x + w / 2, y, x + w / 4, y - h, x + w / 4, y - h);
  shape.bezierCurveTo(x + w / 4, y - h, x, y - h - h * 0.2, x - w / 4, y - h);
  shape.lineTo(x - w / 2, y); // Close shape

  const boatGeo = new THREE.ExtrudeGeometry(shape, {
    steps: 2,
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelOffset: 0,
    bevelSegments: 8,
  });

  const mat = new THREE.MeshPhongMaterial({
    color: state.color,
    precision: "highp",
  });
  const personCapGeo = new THREE.CapsuleGeometry(0.3, 0.6, 1.5);
  personCapGeo.rotateX(-Math.PI / 2);
  // const personCap  =new THREE.Mesh(personCapGeo)
  // const boatMesh = new THREE.Mesh(boatGeo);

  const fullGeo = new mergeGeometries([
    ensureNonIndexed(boatGeo),
    ensureNonIndexed(personCapGeo),
  ]);

  const fullMesh = new THREE.Mesh(fullGeo, mat);
  // fullGeo.merge(personCap.geometry, personCap.matrix)
  // fullMesh.merge(boatMesh.geometry, boatMesh.matrix)

  x = state.x * scale;
  const z = state.y * scale;
  const r = state.r0;

  fullMesh.position.x = x;
  fullMesh.position.z = z;
  fullMesh.position.y = 0.1;
  fullMesh.rotation.x = Math.PI / 2;
  fullMesh.rotation.z = (r * (Math.PI * 2)) / 360;
  boats.push({ id: state.id, mesh: fullMesh });
  scene.add(fullMesh);
}

function updateCamera(boatNumber) {
  const boatPos = boats[boatNumber - 1].mesh.position;
  const boatRot = boats[boatNumber - 1].mesh.rotation;
  controls.target.set(boatPos.x, boatPos.y + 1, boatPos.z);
  controls.maxDistance = 1;
  controls.update();
}

function createAnimation() {
  console.log(window.states);
  const ballStates = window.states.ballStates.map((d) => [
    { x: d.x, y: 0.5, z: d.y },
  ]);
  // console.log("ballStates", ballStates);
  animateToNextState(ball, ballStates, true);
  for (let i = 0; i < 10; i++) {
    const boatStates = window.states.boatStates.map((d) => [
      {
        x: d[i].x,
        z: d[i].y,
        y: 0.1,
      },
      { x: Math.PI / 2, z: (d[i].r * (Math.PI * 2)) / 360, y: 0 },
    ]);
    // console.log(boatStates)
    animateToNextState(boats[i], boatStates);
  }
}
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener("resize", onWindowResize, false);

function animate() {
  for (const [_, value] of Object.entries(tweens)) {
    value.update();
  }
  updateCamera(guiSettings.boatNumber);
  renderer.render(scene, camera);
}
function main() {
  init();
  createAnimation();
  renderer.render(scene, camera);
  renderer.setAnimationLoop(animate);
}
main();
