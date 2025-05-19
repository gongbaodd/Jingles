import { AbstractMesh, ArcRotateCamera, AssetsManager, EquiRectangularCubeTexture, HemisphericLight, MeshBuilder, PBRMaterial, Scene, Texture, Vector3, type Engine } from "@babylonjs/core";
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

    const assetManager = new AssetsManager(scene);

    loadSky(scene, assetManager);
    loadPointCloud(assetManager);

    assetManager.load();
    return scene;
}
 
async function loadSky(scene: Scene, assetManager: AssetsManager) {
    const textureP = new Promise<EquiRectangularCubeTexture>(res => {
        const textureTask = assetManager.addEquiRectangularCubeTextureAssetTask(
            "sky",
            "./images/sky.jpg",
            2048,
        );
        textureTask.onSuccess = task => {
            task.texture.coordinatesMode = Texture.SKYBOX_MODE;
            res(task.texture)
        }
    })

    const eqTexture = await textureP;
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

async function loadPointCloud(assetManager: AssetsManager) {
    const meshP = new Promise<AbstractMesh[]>(res => {
        const meshTask = assetManager.addMeshTask(
            "logo",
            "",
            "./models/",
            "logo.ply"
        )
        meshTask.onSuccess = task => {
            res(task.loadedMeshes)
        }
    })

    const result = await meshP;


    const mesh = result[0];
    mesh.position.y = -50.0;
    mesh.rotation.z = Math.PI;
    mesh.rotation.y = -280/360 * Math.PI;
    mesh.scaling.x = 100;
    mesh.scaling.y = 100;
    mesh.scaling.z = 100;
  }