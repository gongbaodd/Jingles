import { ArcRotateCamera, Color3, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3, type Engine } from "@babylonjs/core";

export async function createScene(engine: Engine) {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
        "Camera",
        -Math.PI / 4,
        Math.PI / 2.5,
        200,
        new Vector3(0, 100, 0),
        scene
    );

    camera.attachControl(engine.getRenderingCanvas(), true);
    camera.minZ = 0.1;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    MeshBuilder.CreateGround(
        "ground",
        { width: 100, height: 100 },
        scene
    );

    // scene.fogMode = Scene.FOGMODE_EXP; // Or FOGMODE_EXP2, FOGMODE_LINEAR
    // scene.fogColor = new Color3(0.2, 0.2, 0.3); // Example fog color
    // scene.fogDensity = 0.01; // For exponential fog modes
    // scene.fogStart = 20.0; // For linear fog mode
    // scene.fogEnd = 2000.0;   // For linear fog mode


    loadSky(scene);

    return scene;
}

function loadSky(scene: Scene) {
    const skybox = MeshBuilder.CreateSphere("skyBox", { diameter: 1000 }, scene);
    const material = new StandardMaterial("skyBox", scene);
    const texture = new Texture("./images/sky.jpg");
    texture.coordinatesMode = Texture.SKYBOX_MODE;
    texture.vScale = -1;

    material.backFaceCulling = false;
    material.diffuseTexture = texture;
    skybox.material = material;
}