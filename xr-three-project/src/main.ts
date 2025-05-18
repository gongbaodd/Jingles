import "./index.css";
import { DevUI } from "@iwer/devui";
import { metaQuest3, XRDevice } from "iwer";
import { createScene, onFrame } from "./scene";
import { Clock, WebGLRenderer } from "three";
import { VRButton } from "three/examples/jsm/Addons.js";

declare global {
  interface Window {
    xrdevice?: XRDevice;
  }
}

async function setupXR() {
  let nativeWebXRSupport = false;
  if (navigator.xr) {
    nativeWebXRSupport = await navigator.xr.isSessionSupported("immersive-vr");
  }
  if (!nativeWebXRSupport) {
    const xrDevice = new XRDevice(metaQuest3);
    xrDevice.installRuntime();
    xrDevice.fovy = (75 / 180) * Math.PI;
    xrDevice.ipd = 0;
    window.xrdevice = xrDevice;
    xrDevice.controllers.right?.position.set(0.15649, 1.43474, -0.38368);
    xrDevice.controllers.right?.quaternion.set(
      0.14766305685043335,
      0.02471366710960865,
      -0.0037767395842820406,
      0.9887216687202454
    );
    xrDevice.controllers.left?.position.set(-0.15649, 1.43474, -0.38368);
    xrDevice.controllers.left?.quaternion.set(
      0.14766305685043335,
      0.02471366710960865,
      -0.0037767395842820406,
      0.9887216687202454
    );
    new DevUI(xrDevice);
  }
}

await setupXR();

const container = document.createElement("div");
document.body.appendChild(container);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

let { scene, camera, controllers } = createScene(container, renderer);

window.addEventListener("resize", onWindowResize);

renderer.setAnimationLoop(animate);

document.body.appendChild(VRButton.createButton(renderer));

const clock = new Clock();
function animate() {
  const delta = clock.getDelta();
  Object.values(controllers).forEach((controller) => {
    if (controller?.gamepad) {
      controller.gamepad.update();
    }
  });

  onFrame(delta);
  renderer.render(scene, camera);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

if (import.meta.hot) {
  import.meta.hot.accept("./scene", () => {
    scene.remove();
    ({ scene, camera } = createScene(container, renderer));
  });
}
