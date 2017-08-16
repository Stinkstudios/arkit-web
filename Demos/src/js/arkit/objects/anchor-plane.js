import {
  PlaneBufferGeometry,
  Mesh,
  MeshLambertMaterial,
  DoubleSide,
  Matrix4
} from 'three';

// Use same geometry for all planes
const geometry = new PlaneBufferGeometry(1, 1);
geometry.applyMatrix(new Matrix4().makeRotationX(Math.PI / 2));

export default class ARAnchorPlane {
  constructor(anchor) {
    const mesh = new Mesh(
      geometry,
      new MeshLambertMaterial({
        color: 0x0000ff,
        wireframe: true,
        side: DoubleSide
      })
    );
    mesh.position.fromArray(anchor.center);
    mesh.scale.x = anchor.extent[0];
    mesh.scale.z = anchor.extent[2];
    return mesh;
  }
}
