import "./style.css";
import Game from "./Game";

declare global {
  interface Window {
    __GAME__: Game | null;
  }
}

const canvas = document.querySelector<HTMLCanvasElement>("#canvas")!;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const engine = Game.createDefaultEngine(canvas);
const game = new Game();

window.__GAME__ = game;

window.addEventListener("DOMContentLoaded", () => {
  game.createScene(engine);
  game.startRenderLoop();
})

const onResize = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  engine.resize();
};

window.addEventListener("resize", onResize);

document.getElementById("xr-button")!.addEventListener("click", async () => {
  if (!game.scene) return;

  try {
    const xrHelper = await game.scene.createDefaultXRExperienceAsync({
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
