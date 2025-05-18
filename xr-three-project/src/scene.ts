import { GamepadWrapper, XR_BUTTONS } from "gamepad-wrapper";
import {
  Color,
  Group,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  WebGLRenderer,
  type XRGripSpace,
  type XRTargetRaySpace,
  AudioListener,
  PositionalAudio,
  AudioLoader,
  Vector3,
  Object3D,
} from "three";
import {
  OrbitControls,
  RoomEnvironment,
  type XRControllerModel,
  XRControllerModelFactory,
} from "three/examples/jsm/Addons.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Text } from "troika-three-text";
import spacestation from "./assets/spacestation.glb";
import blaster from "./assets/blaster.glb";
import target from "./assets/target.glb";
import laserOgg from "./assets/laser.ogg";
import scoreOgg from "./assets/score.ogg";
import font from "./assets/SpaceMono-Bold.ttf";
import gsap from "gsap";

let scene: Scene;
let camera: PerspectiveCamera;
let player: Group;
let controllers: Controllers;

export function createScene(
  container: HTMLDivElement,
  renderer: WebGLRenderer
) {
  scene = new Scene();
  scene.background = new Color(0x808080);

  camera = new PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.6, 3);

  const controls = new OrbitControls(camera, container);
  controls.target.set(0, 1.6, 0);
  controls.update();

  const environment = new RoomEnvironment();
  const pmremGenerator = new PMREMGenerator(renderer);
  scene.environment = pmremGenerator.fromScene(environment).texture;

  player = new Group();
  scene.add(player);
  player.add(camera);
  controllers = setUpControllers(player, renderer);

  setupScene();

  return {
    scene,
    camera,
    player,
    controllers,
  };
}

const targets: Group[] = [];
const blasterGroup = new Group();
let laserSound: PositionalAudio;
let scoreSound: PositionalAudio;
function setupScene() {
  const gltfLoader = new GLTFLoader();

  gltfLoader.load(spacestation, (gltf) => scene.add(gltf.scene));
  gltfLoader.load(blaster, (gltf) => blasterGroup.add(gltf.scene));
  gltfLoader.load(target, (gltf) => {
    for (let i = 0; i < 3; i++) {
      const target = gltf.scene.clone();
      target.position.set(
        Math.random() * 10 - 5,
        i * 2 + 1,
        Math.random() * 5 - 5
      );
      scene.add(target);
      targets.push(target);
    }
  });

  const scoreText = setupScore();
  updateScore();

  const listener = new AudioListener();
  camera.add(listener);

  const audioLoader = new AudioLoader();
  laserSound = new PositionalAudio(listener);
  audioLoader.load(laserOgg, (buffer) => {
    laserSound.setBuffer(buffer);
    blasterGroup.add(laserSound);
  });

  scoreSound = new PositionalAudio(listener);
  audioLoader.load(scoreOgg, (buffer) => {
    scoreSound.setBuffer(buffer);
    scoreText.add(scoreSound);
  });
}

let score = 0;
let scoreText: Text;
function setupScore() {
  scoreText = new Text();
  scoreText.fontSize = 0.52;
  scoreText.font = font;
  scoreText.position.z = -2;
  scoreText.color = 0xffa276;
  scoreText.anchorX = "center";
  scoreText.anchorY = "middle";

  scoreText.position.set(0, 0.67, -1.44);
  scoreText.rotateX(-Math.PI / 3.3);

  return scoreText;
}

function updateScore() {
  const clampedScore = Math.max(0, Math.min(9999, score));
  const displayScore = clampedScore.toString().padStart(4, "0");
  scoreText.text = displayScore;
  scoreText.sync();
}

const forwardVector = new Vector3(0, 0, -1);
const bulletSpeed = 10;
const bulletTimeToLive = 1;
const bullets: Record<string, Object3D> = {};
export function onFrame(delta: number) {
  Object.values(controllers).forEach((controller) => {
    if (controller?.gamepad) {
      controller.gamepad.update();
    }
  });

  if (controllers.right) {
    const { gamepad, raySpace, mesh } = controllers.right;
    if (!raySpace.children.includes(blasterGroup)) {
      raySpace.add(blasterGroup);
      mesh.visible = false;
    }

    if (gamepad.getButtonClick(XR_BUTTONS.TRIGGER)) {
      try {
        gamepad.getHapticActuator(0).pulse(0.6, 100);
      } catch {}

      if (laserSound.isPlaying) laserSound.stop();
      laserSound.play();

      const bulletPrototype = blasterGroup.getObjectByName("bullet");
      if (bulletPrototype) {
        const bullet = bulletPrototype.clone();
        scene.add(bullet);
        bulletPrototype.getWorldPosition(bullet.position);
        bulletPrototype.getWorldQuaternion(bullet.quaternion);

        const directionVector = forwardVector
          .clone()
          .applyQuaternion(bullet.quaternion);
        bullet.userData = {
          velocity: directionVector.multiplyScalar(bulletSpeed),
          timeToLive: bulletTimeToLive,
        };
        bullets[bullet.uuid] = bullet;
      }
    }
  }

  Object.values(bullets).forEach((bullet) => {
    if (bullet.userData.timeToLive < 0) {
      delete bullets[bullet.uuid];
      scene.remove(bullet);
      return;
    }

    const deltaVec = bullet.userData.velocity.clone().multiplyScalar(delta);
    bullet.position.add(deltaVec);
    bullet.userData.timeToLive -= delta;

    targets
      .filter((target) => target.visible)
      .forEach((target) => {
        const distance = target.position.distanceTo(bullet.position);
        if (distance < 1) {
          delete bullets[bullet.uuid];
          scene.remove(bullet);

          gsap.to(target.scale, {
            duration: 0.3,
            x: 0,
            y: 0,
            z: 0,
            onComplete: () => {
              target.visible = false;
              setTimeout(() => {
                target.visible = true;
                target.position.x = Math.random() * 10 - 5;
                target.position.y = -Math.random() * 5 - 5;

                gsap.to(target.scale, {
                  duration: 0.3,
                  x: 1,
                  y: 1,
                  z: 1,
                });
              }, 1000);
            },
          });

          score += 10;
          updateScore();
          if (scoreSound.isPlaying) scoreSound.stop();
          scoreSound.play();
        }
      });
  });

  gsap.ticker.tick();
}

type Controllers = Record<
  XRHandedness,
  null | {
    raySpace: XRTargetRaySpace;
    gripSpace: XRGripSpace;
    mesh: XRControllerModel;
    gamepad: GamepadWrapper;
  }
>;

function setUpControllers(player: Group, renderer: WebGLRenderer) {
  const controllerModelFactory = new XRControllerModelFactory();
  const controllers: Controllers = {
    left: null,
    right: null,
    none: null,
  };
  for (let i = 0; i < 2; i++) {
    const raySpace = renderer.xr.getController(i);
    const gripSpace = renderer.xr.getControllerGrip(i);
    const mesh = controllerModelFactory.createControllerModel(gripSpace);

    gripSpace.add(mesh);
    player.add(raySpace, gripSpace);
    raySpace.visible = false;
    gripSpace.visible = false;

    gripSpace.addEventListener("connected", (e) => {
      raySpace.visible = true;
      gripSpace.visible = true;

      const handedness = e.data.handedness;
      controllers[handedness] = {
        raySpace,
        gripSpace,
        mesh,
        gamepad: new GamepadWrapper(e.data.gamepad!),
      };
    });

    gripSpace.addEventListener("disconnected", (e) => {
      raySpace.visible = false;
      gripSpace.visible = false;
      controllers[e.data.handedness] = null;
    });
  }

  return controllers;
}
