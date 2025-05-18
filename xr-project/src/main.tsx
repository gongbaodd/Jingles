import { Engine } from '@babylonjs/core';
import './index.css'
import { createScene } from './Scene';
import "@babylonjs/inspector";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic"

registerBuiltInLoaders();

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const onResize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
};

window.addEventListener("resize", onResize);

const engine = new Engine(canvas, true, {
  preserveDrawingBuffer: true,
  stencil: true,
  disableWebGL2Support: false,
});
let scene = await createScene(engine);
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


if (import.meta.hot) {
  import.meta.hot.accept("./scene", async mod => {
    scene.dispose();

    scene = await mod!.createScene(engine);
  });
}