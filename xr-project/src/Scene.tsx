import { ArcRotateCamera, EquiRectangularCubeTexture, HemisphericLight, ImportMeshAsync, MeshBuilder, PBRMaterial, Scene, Texture, Vector3, type Engine } from "@babylonjs/core";
// import "@babylonjs/materials";

export async function createScene(engine: Engine) {
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
        "Camera",
        -Math.PI / 4,
        Math.PI / 2.5,
        200,
        new Vector3(0, 0, 0),
        scene
    );

    camera.attachControl(engine.getRenderingCanvas(), true);
    camera.minZ = 0.1;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    loadSky(scene);
    LoadPointCloud(scene);

    return scene;
}

function loadSky(scene: Scene) {
    const eqTexture = new EquiRectangularCubeTexture(
        "./images/sky.jpg",
        scene,
        1024,
    );
    eqTexture.coordinatesMode = Texture.SKYBOX_MODE;

    const hdrSkybox = MeshBuilder.CreateBox("hdrSkyBox", { size: 2000 }, scene);
    const hdrSkyboxMaterial = new PBRMaterial("skyBox", scene);
    hdrSkyboxMaterial.backFaceCulling = false;
    hdrSkyboxMaterial.reflectionTexture = eqTexture.clone();
    hdrSkyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    hdrSkyboxMaterial.microSurface = 1.0;
    hdrSkyboxMaterial.disableLighting = false;
    hdrSkybox.material = hdrSkyboxMaterial;
    hdrSkybox.infiniteDistance = true;

    scene.imageProcessingConfiguration.exposure = 0.6;
    scene.imageProcessingConfiguration.contrast = 3.0;
}

async function LoadPointCloud(scene: Scene) {
    const result = await ImportMeshAsync("models/logo.ply", scene);

    const mesh = result.meshes[0];
    mesh.position.y = -50.0;
    mesh.rotation.z = Math.PI;
    mesh.rotation.y = -280/360 * Math.PI;
    mesh.scaling.x = 100;
    mesh.scaling.y = 100;
    mesh.scaling.z = 100;
  }