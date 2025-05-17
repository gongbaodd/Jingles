"use client";
import { useEffect, useRef } from "react"
import Game from "../game";

declare global {
    interface Window {
        __GAME__: Game | null;
    }
}

export const GameComponent = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const engine = Game.createDefaultEngine(canvas);
        const game = new Game();

        window.__GAME__ = game;

        game.createScene(engine);
        game.startRenderLoop();

        const onResize = () => {
            engine.resize();
        }

        window.addEventListener("resize", onResize);

        return () => {
            window.__GAME__ = null;
            window.removeEventListener("resize", onResize);
        }
    }, [])


    return (
        <div>
            <canvas id="game" ref={canvasRef}></canvas>
        </div>
    )
}