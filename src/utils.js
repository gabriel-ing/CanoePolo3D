import * as THREE from "three";


export function createLight(scene){
    const directionalLight = new THREE.DirectionalLight("#ffffff", 1);
  directionalLight.position.y = 30;
  directionalLight.target = new THREE.Vector3(0, 0, 0);
  scene.add(directionalLight);
  const ambientLight = new THREE.AmbientLight("#ffffff", 1);
  ambientLight.position.y = 20;

  scene.add(ambientLight);

  directionalLight.castShadow = true;
}