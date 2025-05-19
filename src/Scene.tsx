import { AbstractMesh, ArcRotateCamera, AssetsManager, EquiRectangularCubeTexture, HemisphericLight, MeshBuilder, PBRMaterial, Scene, Texture, Vector3, WebXRFeatureName, WebXRMotionControllerTeleportation, type Engine } from "@babylonjs/core";
import fontdata from "./assets/Space Mono_Bold.json"
import earcut from 'earcut';

// import { RoadProceduralTexture } from "@babylonjs/procedural-textures";


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

    const ground = MeshBuilder.CreatePlane(
        "plane",
        {
            width: 400,
            height: 400
        }
    )

    ground.position.y = -150
    ground.rotation.x = Math.PI / 2
    ground.scaling.x = 50
    ground.scaling.y = 50
    ground.scaling.z = 50
    ground.isPickable = false;

    const target1 = MeshBuilder.CreateText(
        "Astra",
        "ASTRA",
        fontdata,
        {
            size: 16,
            resolution: 64,
            depth: 10,
        },
        scene,
        earcut
    )!;

    target1.position.x = 850;
    target1.position.z = -700;
    target1.position.y = -150;
    target1.rotation.y = 130/180 * Math.PI

    const target2 = MeshBuilder.CreateText(
        "Silva",
        "SILVA",
        fontdata,
        {
            size: 16,
            resolution: 64,
            depth: 10,
        },
        scene,
        earcut
    )!;

    target2.position.x = 700;
    target2.position.z = 280;
    target2.position.y = -150;
    target2.rotation.y = 1/2 * Math.PI;


    const target3 = MeshBuilder.CreateText(
        "Mare",
        "MARE",
        fontdata,
        {
            size: 16,
            resolution: 64,
            depth: 10,
        },
        scene,
        earcut
    )!;

    target3.position.x = 800;
    target3.position.z = 800;
    target3.position.y = -150;
    target3.rotation.y = 50/180 * Math.PI

    const target4 = MeshBuilder.CreateText(
        "Nova",
        "NOVA",
        fontdata,
        {
            size: 16,
            resolution: 64,
            depth: 10,
        },
        scene,
        earcut
    )!;

    target4.position.x = 90;
    target4.position.z = 800;
    target4.position.y = -150;

        const target5 = MeshBuilder.CreateText(
        "Vita",
        "VITA",
        fontdata,
        {
            size: 16,
            resolution: 64,
            depth: 10,
        },
        scene,
        earcut
    )!;

    target5.position.x = -800;
    target5.position.z = 800;
    target5.position.y = -150;
    target5.rotation.y = -40/180 * Math.PI;

    const target6 = MeshBuilder.CreateText(
        "Terra",
        "TERRA",
        fontdata,
        {
            size: 16,
            resolution: 64,
            depth: 10,
        },
        scene,
        earcut
    )!;

    target6.position.x = 300;
    target6.position.z = -700;
    target6.position.y = -150;
    target6.rotation.y = Math.PI;

    const experience = await scene.createDefaultXRExperienceAsync({
        uiOptions: {
            sessionMode: "immersive-vr",
        },
        optionalFeatures: true,
        floorMeshes: [ground],
    });
    experience.teleportation.addFloorMesh(ground);

    const teleportation = experience.baseExperience.featuresManager.getEnabledFeature(
        WebXRFeatureName.TELEPORTATION
    ) as WebXRMotionControllerTeleportation


    teleportation.onAfterCameraTeleport.add((targetPosition) => {
        console.log("Teleported to:", targetPosition);
    });

    assetManager.load();
    return {scene, ground};
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
    mesh.position.z = -300;
    mesh.position.z = 50;
    mesh.rotation.z = Math.PI;
    mesh.rotation.y = -280 / 360 * Math.PI;
    mesh.scaling.x = 100;
    mesh.scaling.y = 100;
    mesh.scaling.z = 100;
}
