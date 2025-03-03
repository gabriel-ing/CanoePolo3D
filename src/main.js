import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import { states } from "./states";
import { Group, Tween } from "@tweenjs/tween.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let scene, camera, renderer, gui;
let pitch, tween, controls, ball;
let boats = [];
let tweens = {};
let guiSettings = {
  boatNumber: 1,
  Reset: () => {
    tweens = {};
    currentState = 0;
    createAnimation();
    console.log(tweens);
  },
  animationSpeed: 3,
};
let animating, animationCounter;
let speed = 10000 / guiSettings.animationSpeed;
let scale = 0.02;
let currentState = 0;
let initialStates = states.boatStates[currentState];

function animateToNextState(object, objStates, ball=false) {
  if (!objStates[currentState + 1]) {
    animating = false;
    return;
  }
  if (ball){
    console.log(object)
  }
  let [positionState, rotationState] = objStates[currentState];
  speed = 10000 / guiSettings.animationSpeed;
  const tweenPosition = new Tween(object.mesh.position)
    .to(positionState, speed)
    .onComplete(() => {
      if (object.id === 1) {
        currentState += 1;
      }
      animateToNextState(object, objStates);
    })
    .onUpdate(() => {})
    .start();

  const tweenRotation = new Tween(object.mesh.rotation)
    .to(rotationState, speed)
    .onComplete(() => {
      console.log("complete");
      if (object.id === 1) {
        currentState += 1;
      }
      animateToNextState(object, objStates);
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

  const pitchGeo = new THREE.BoxGeometry(
    states.width * scale,
    states.height * scale,
    3
  );
  const pitchMat = new THREE.MeshStandardMaterial({ map: texture });
  pitch = new THREE.Mesh(pitchGeo, pitchMat);

  scene.add(pitch);
  pitch.rotation.x = Math.PI / 2;
  pitch.position.y = -1.5;
  pitch.position.x = (states.width * scale) / 2;
  pitch.position.z = (states.height * scale) / 2;

  const goalGeo = new THREE.BoxGeometry(0.5, 1.5, 1.5);
  const goalTexture = new THREE.TextureLoader().load("Textures/net-mesh.jpg");
  const goalMat = new THREE.MeshStandardMaterial({ map: goalTexture });
  const goal1 = new THREE.Mesh(goalGeo, goalMat);
  const goal2 = new THREE.Mesh(goalGeo, goalMat);
  goal1.position.set(0, 3, (states.height * scale) / 2);
  goal2.position.set(states.width * scale, 3, (states.height * scale) / 2);

  scene.add(goal1);
  scene.add(goal2);
}
function createBall() {
  // console.log(ballStates)
  const ballGeo = new THREE.SphereGeometry(0.3);
  const ballMat = new THREE.MeshStandardMaterial({ color: "#9d66cc" });
  const ballMesh = new THREE.Mesh(ballGeo, ballMat);
  ballMesh.position.set(
    states.ballStates[0].x * scale,
    2,
    states.ballStates[0].y * scale
  );
  scene.add(ballMesh);
  ball = {id: "ball", mesh:ballMesh}
}
function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer({ antialias: true });
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
function updateCamera(boatNumber) {
  const boatPos = boats[boatNumber - 1].mesh.position;
  const boatRot = boats[boatNumber - 1].mesh.rotation;
  controls.target.set(boatPos.x, boatPos.y + 1, boatPos.z);
  controls.maxDistance = 1;
  controls.update();
}
function createBoat(state) {
  const x = state.x * scale;
  const z = state.y * scale;
  const r = state.r0;

  const geo = new THREE.CapsuleGeometry(0.5, 2.5, 4, 3);
  const mat = new THREE.MeshPhongMaterial({
    color: state.color,
    precision: "highp",
  });
  const capsule = new THREE.Mesh(geo, mat);
  capsule.position.x = x;
  capsule.position.z = z;
  capsule.position.y = 0;
  capsule.rotation.x = Math.PI / 2;
  capsule.rotation.z = (r * (Math.PI * 2)) / 360;
  boats.push({ id: state.id, mesh: capsule });
  scene.add(capsule);
}
function createAnimation() {
  for (let i = 0; i < 10; i++) {
    const boatStates = states.boatStates.map((d) => [
      {
        x: d[i].x * scale,
        z: d[i].y * scale,
        y: 0,
      },
      { x: Math.PI / 2, z: (d[i].r * (Math.PI * 2)) / 360, y: 0 },
    ]);

    const ballStates = states.ballStates.map((d) => [
      { x: d.x * scale, y: 0.5, z: d.y * scale },
    ]);

    animateToNextState(boats[i], boatStates);
    animateToNextState(ball, ballStates, true);
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
