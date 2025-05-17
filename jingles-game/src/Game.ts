import {
  ArcRotateCamera,
  Engine,
  EquiRectangularCubeTexture,
  HemisphericLight,
  ImportMeshAsync,
  MeshBuilder,
  PBRMaterial,
  Scene,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { GUI } from "dat.gui";

const gui = new GUI();

export default class Game {
  static assets: Record<string, string> = {
    sky: "images/sky.jpg",
  };
  static async loadAssets() {
    const promises = Object.entries(Game.assets).map(([key, url]) => {
      return new Promise((resolve) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve({ key, url });
      });
    });

    return Promise.all(promises);
  }
  static async LoadPointCloud(scene: Scene) {
    const result = await ImportMeshAsync("point-cloud/logo.ply", scene);

    const mesh = result.meshes[0];
    mesh.position.y = -50.0;
    mesh.rotation.z = Math.PI;
    mesh.rotation.y = (2 / 9) * Math.PI;
    mesh.scaling.x = 100;
    mesh.scaling.y = 100;
    mesh.scaling.z = 100;
  }

  static async loadSkybox(scene: Scene) {
    const loadTexture = new Promise<EquiRectangularCubeTexture>((resolve) => {
      const eqTexture = new EquiRectangularCubeTexture(
        Game.assets.sky,
        scene,
        2048,
        false,
        false,
        () => resolve(eqTexture)
      );
      eqTexture.coordinatesMode = Texture.SKYBOX_MODE;
    });

    const eqTexture = await loadTexture;

    scene.imageProcessingConfiguration.exposure = 0.6;
    scene.imageProcessingConfiguration.contrast = 3.0;
    gui
      .add(scene.imageProcessingConfiguration, "exposure", -10.0, 10.0)
      .onChange((v) => {
        scene.imageProcessingConfiguration.exposure = v;
      });
    gui
      .add(scene.imageProcessingConfiguration, "contrast", -10.0, 10.0)
      .onChange((v) => {
        scene.imageProcessingConfiguration.contrast = v;
      });

    const hdrSkybox = MeshBuilder.CreateBox("hdrSkyBox", { size: 2000 }, scene);
    const hdrSkyboxMaterial = new PBRMaterial("skyBox", scene);
    hdrSkyboxMaterial.backFaceCulling = false;
    hdrSkyboxMaterial.reflectionTexture = eqTexture.clone();
    hdrSkyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;

    hdrSkyboxMaterial.microSurface = 1.0;
    hdrSkyboxMaterial.disableLighting = false;
    hdrSkybox.material = hdrSkyboxMaterial;
    hdrSkybox.infiniteDistance = true;
  }

  static createDefaultEngine(canvas: HTMLCanvasElement) {
    return new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
  }
  static createScene(engine: Engine, canvas: HTMLCanvasElement) {
    const scene = new Scene(engine);
    const camera = new ArcRotateCamera(
      "Camera",
      -Math.PI / 4,
      Math.PI / 2.5,
      200,
      Vector3.Zero(),
      scene
    );

    camera.attachControl(canvas, true);
    camera.minZ = 0.1;

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    Promise.all([
      Game.loadSkybox(scene),
      Game.LoadPointCloud(scene),
    ]);

    return scene;
  }
  scene: Scene | null = null;
  engine: Engine | null = null;
  async createScene(engine: Engine) {
    this.engine = engine;

    const canvas = engine.getRenderingCanvas();

    if (canvas) {
      const scene = Game.createScene(engine, canvas);

      // const debuglayer = await scene.debugLayer.show();
      // debuglayer.popupSceneExplorer();
      // debuglayer.popupInspector();

      this.scene = scene;
      return scene;
    }
  }
  async startRenderLoop() {
    await Game.loadAssets();

    this.engine?.runRenderLoop(() => {
      if (this.scene && this.scene.activeCamera) {
        this.scene.render();
      }
    });
  }
}
