import { AmbientLight, DirectionalLight, SpotLight } from 'three';

// Lights
const controller = {
  ambient: 0xd4d4d4,
  directional: 0xffffff,
  spot: 0xffffff
};

const lights = {
  ambient: new AmbientLight(controller.ambient),
  directional: new DirectionalLight(controller.directional, 1),
  spot: new SpotLight(controller.spot, 1)
};

const s = 0.95;
lights.spot.position.set(1 * s, 1 * s, 1 * s);

lights.spot.castShadow = true;
lights.spot.shadow.mapSize.width = 1024;
lights.spot.shadow.mapSize.height = 1024;

lights.spot.shadow.camera.near = 1;
lights.spot.shadow.camera.far = 500;
lights.spot.shadow.camera.fov = 60;

export default lights;
