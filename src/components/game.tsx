"use client";
import { Engine, FreeCamera, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import { SkyMaterial } from "@babylonjs/materials";
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

        const camera = new FreeCamera("mainCamera", new Vector3(5, 4, -47), scene)
        camera.setTarget(Vector3.Zero());
        camera.attachControl(canvas, true);

        const light = new HemisphericLight("directLight", new Vector3(0, 1, 0), scene);
        light.intensity = 0.7

        const skyMaterial = new SkyMaterial("skyMaterial", scene);
        // const sky = MeshBuilder.CreateSphere("sphere1", {
        //     diameter: 1000,
        // }, scene)
        // sky.material = skyMaterial;

            var skybox = Mesh.CreateBox("skyBox", 1000.0, scene);
    skybox.material = skyMaterial;

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