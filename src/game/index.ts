import {
  ArcRotateCamera,
  Engine,
  EquiRectangularCubeTexture,
  MeshBuilder,
  PBRMaterial,
  Scene,
  Texture,
  Vector3,
} from "@babylonjs/core";
import { GUI } from "dat.gui";

export default class Game {
  static createDefaultEngine(canvas: HTMLCanvasElement) {
    return new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
  }
  static createScene(engine: Engine, canvas: HTMLCanvasElement) {
    const gui = new GUI();

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

    const image = new Image();
    image.src = "images/sky.jpg";

    const eqTexture = new EquiRectangularCubeTexture(
      "images/sky.jpg",
      scene,
      2048
    );
    eqTexture.coordinatesMode = Texture.SKYBOX_MODE;

    scene.imageProcessingConfiguration.exposure = 1.0;
    /*
    gui.add(scene.imageProcessingConfiguration, "exposure", -10.0, 10.0).onChange(v => {
        scene.imageProcessingConfiguration.exposure = v;
    })

    scene.imageProcessingConfiguration.contrast = 1.0;
        gui.add(scene.imageProcessingConfiguration, "contrast", -10.0, 10.0).onChange(v => {
        scene.imageProcessingConfiguration.contrast = v;
    })
    */

    const hdrSkybox = MeshBuilder.CreateBox("hdrSkyBox", { size: 1000 }, scene);
    const hdrSkyboxMaterial = new PBRMaterial("skyBox", scene);
    hdrSkyboxMaterial.backFaceCulling = false;
    hdrSkyboxMaterial.reflectionTexture = eqTexture.clone();
    if (hdrSkyboxMaterial.reflectionTexture.coordinatesMode) {
      hdrSkyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    }
    hdrSkyboxMaterial.microSurface = 1.0;
    hdrSkyboxMaterial.disableLighting = false;
    hdrSkybox.material = hdrSkyboxMaterial;
    hdrSkybox.infiniteDistance = true;

    return scene;
  }
  scene: Scene | null = null;
  engine: Engine | null = null;
  createScene(engine: Engine) {
    this.engine = engine;

    const canvas = engine.getRenderingCanvas();
    if (canvas) {
      const scene = Game.createScene(engine, canvas);
      this.scene = scene;
      return scene;
    }
  }
  startRenderLoop() {
    this.engine?.runRenderLoop(() => {
      if (this.scene && this.scene.activeCamera) {
        this.scene.render();
      }
    });
  }
}
