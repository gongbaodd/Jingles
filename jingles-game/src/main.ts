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

game.createScene(engine);
game.startRenderLoop();

window.__GAME__ = game;

const onResize = () => {
  engine.resize();
};

window.addEventListener("resize", onResize);
