import { ArcRotateCamera, HemisphericLight, MeshBuilder, Scene, Vector3, type Engine } from "@babylonjs/core";

export function createScene(engine: Engine) {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 4,
      Math.PI / 2.5,
      200,
      Vector3.Zero(),
      scene
    );

    camera.attachControl(engine.getRenderingCanvas(), true);
    camera.minZ = 0.1;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    return scene;
}