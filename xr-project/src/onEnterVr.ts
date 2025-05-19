
export async function onEnterVr() {
  const scene = window.scene;
  const ground = window.ground;

  if (!window.scene) return;

  try {
    const xrHelper = await scene.createDefaultXRExperienceAsync({
      uiOptions: {
        sessionMode: "immersive-vr",
      },
      optionalFeatures: true,
      floorMeshes: [ground],
    });

    // Start XR session
    xrHelper.baseExperience
      .enterXRAsync("immersive-vr", "local-floor")
      .then(() => {
        console.log("Entered XR");
      });  
  } catch (e) {
    console.error("WebXR not supported or failed to enter:", e);
  }
}
