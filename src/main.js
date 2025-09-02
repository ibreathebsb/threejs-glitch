import "./style.css";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  TextureLoader,
  Clock,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

import glitchVs from "./shaders/glitch.vs";
import glitchFs from "./shaders/glitch.fs"
import * as Three from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";


const scene = new Scene();
scene.background = new Three.Color(0x000000);
const clock = new Clock();
const canvas = document.getElementById("canvas");

const rect = canvas.getBoundingClientRect();
const width = rect.width;
const height = rect.height;

const camera = new PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 0, 450);

const renderer = new WebGLRenderer({
  canvas,
  context: canvas.getContext("webgl2"),
});

renderer.setSize(width, height);
renderer.setPixelRatio(window.devicePixelRatio);

window.Three = Three;
window.camera = camera;
window.renderer = renderer;

// const texture = new TextureLoader().load('serika-onoe.jpg');
// const planeGeometry = new Three.PlaneGeometry(200, 200);

const texture = new TextureLoader().load('Cyberpunk2077.jpg');
const planeGeometry = new Three.PlaneGeometry(1280, 720);
const planeMaterial = new Three.MeshBasicMaterial({ map: texture });
const plane = new Three.Mesh(planeGeometry, planeMaterial);
scene.add(plane);


const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;


const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const resolution = renderer.getSize(new Three.Vector2());
const glitchShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0.0 },
    uInterval: { value: 0.25 },
    uResolution: { value: resolution },
    basePixelOffset: { value: 5.0 },
    maxPixelOffset: { value: 5.0 },
  },
  vertexShader: glitchVs,
  fragmentShader: glitchFs
};

const glitchPass = new ShaderPass(glitchShader);
composer.addPass(glitchPass);

const gui = new GUI();
gui.add(glitchPass.uniforms.uInterval, "value", 0.1, 2.0).name("Glitch Interval");
gui.add(glitchPass.uniforms.basePixelOffset, "value", 0, 50).name("Base Pixel Offset");
gui.add(glitchPass.uniforms.maxPixelOffset, "value", 0, 50).name("Max Pixel Offset");

function handleResize() {
  const rect = document.body.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  debugger
  glitchPass.uniforms.uResolution.value.set(width, height);
  composer.setSize(width, height);

  controls.update();
}

window.addEventListener("resize", handleResize);

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();
  controls.update(time);
  glitchPass.uniforms.uTime.value = time;
  composer.render();
}
animate();