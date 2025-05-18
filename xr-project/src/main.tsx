import { Engine } from '@babylonjs/core';
import './index.css'
import { createScene } from './Scene';

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


if (import.meta.hot) {
  import.meta.hot.accept("./scene", async mod => {
    scene.dispose();

    scene = await mod!.createScene(engine);
  });
}