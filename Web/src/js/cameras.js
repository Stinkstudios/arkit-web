import { PerspectiveCamera, Object3D, Camera } from 'three';

const fov = 60;
const ratio = window.innerWidth / window.innerHeight;
const near = 0.1;
const far = 100000;

export const cameraDev = new PerspectiveCamera(fov, ratio, near, far);
export const cameraAR = new Camera();
export const cameraARParent = new Object3D();
cameraARParent.matrixAutoUpdate = false;
cameraARParent.add(cameraAR);
