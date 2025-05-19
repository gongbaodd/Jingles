import { Engine, Mesh, Scene } from '@babylonjs/core';
import './index.css'
import { createScene } from './Scene';
import "@babylonjs/inspector";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic"
import { XRDevice, metaQuest3 } from 'iwer';
import { DevUI } from '@iwer/devui';
declare global {
  interface Window {
    scene: Scene;
    ground: Mesh;
  }
}

let scene: Scene;
let engine: Engine;
let ground: Mesh;
async function init() {
  // iwer setup
  let nativeWebXRSupport = false;
  if (navigator.xr) {
    nativeWebXRSupport = await navigator.xr.isSessionSupported('immersive-vr');
  }
  if (!nativeWebXRSupport) {
    const xrDevice = new XRDevice(metaQuest3);
    xrDevice.installRuntime();
    xrDevice.fovy = (75 / 180) * Math.PI;
    xrDevice.ipd = 0;
    xrDevice.controllers.right?.position.set(0.15649, 1.43474, -0.38368);
    xrDevice.controllers.right?.quaternion.set(
      0.14766305685043335,
      0.02471366710960865,
      -0.0037767395842820406,
      0.9887216687202454,
    );
    xrDevice.controllers.left?.position.set(-0.15649, 1.43474, -0.38368);
    xrDevice.controllers.left?.quaternion.set(
      0.14766305685043335,
      0.02471366710960865,
      -0.0037767395842820406,
      0.9887216687202454,
    );
    new DevUI(xrDevice);
  }

  registerBuiltInLoaders();

  const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const onResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  window.addEventListener("resize", onResize);

  engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
  ({scene, ground} = await createScene(engine));

  window.scene = scene;
  window.ground = ground;

  engine.runRenderLoop(() => scene.render());

  // document.getElementById("xr-button")!.addEventListener("click", onEnterVr);
}

window.addEventListener("keydown", async e => {
  if (e.key.toLowerCase() === "i") {
    const debug = await scene.debugLayer.show();
    debug.popupInspector();
  }
});

init();

if (import.meta.hot) {
  import.meta.hot.accept("./scene", async mod => {
    scene.dispose();

    ({scene, ground} = await mod!.createScene(engine));
    window.scene = scene;
    window.ground = ground;
  });
}