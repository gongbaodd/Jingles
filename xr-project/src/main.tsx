import { Engine, Scene } from '@babylonjs/core';
import './index.css'
import { createScene } from './Scene';
import "@babylonjs/inspector";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic"
import { XRDevice, metaQuest3 } from 'iwer';
import { DevUI } from '@iwer/devui';

let scene: Scene;
let engine: Engine;
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
  scene = await createScene(engine);
  engine.runRenderLoop(() => scene.render());


  document.getElementById("xr-button")!.addEventListener("click", async () => {
    if (!scene) return;

    try {
      const xrHelper = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
          sessionMode: "immersive-vr",
        },
        optionalFeatures: true,
      });

      // Start XR session
      xrHelper.baseExperience
        .enterXRAsync("immersive-vr", "local-floor")
        .then(() => {
          console.log("Entered XR");
        });

    } catch (e) {
      console.error("WebXR not supported or failed to enter:", e);
    }
  });
}

init();

if (import.meta.hot) {
  import.meta.hot.accept("./scene", async mod => {
    scene.dispose();

    scene = await mod!.createScene(engine);
  });
}