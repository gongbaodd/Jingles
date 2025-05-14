"use client";
import { Engine, FreeCamera, HemisphericLight, Mesh, Scene, Vector3 } from "@babylonjs/core";
import { useEffect, useRef } from "react"

export const Game = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const engine = new Engine(canvas)
        const scene = new Scene(engine);

        const camera = new FreeCamera("mainCamera", new Vector3(0, 5, -10), scene)
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);

        const light = new HemisphericLight("directLight", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7

        const sphere = Mesh.CreateSphere("sphere1", 16, 2, scene)
        sphere.position.y = 2

        Mesh.CreateGround("ground1", 6, 6, 2, scene)
        engine.runRenderLoop(() => {
            scene.render()
        })
    }, [])


    return (
        <div>
            <canvas id="game" ref={canvasRef}></canvas>
        </div>
    )
}