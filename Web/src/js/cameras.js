import { Object3D, Camera } from 'three';

export const cameraAR = new Camera();
export const cameraARParent = new Object3D();
cameraARParent.matrixAutoUpdate = false;
cameraARParent.add(cameraAR);
