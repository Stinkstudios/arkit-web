import { BoxBufferGeometry, Mesh, MeshLambertMaterial } from 'three';

// Use same geometry for all cubes
const size = 0.077;
const geometry = new BoxBufferGeometry(size, size, size);

export default class ARAnchorCube {
  constructor() {
    const mesh = new Mesh(
      geometry,
      new MeshLambertMaterial({
        color: 0xffffff * Math.random(),
        wireframe: false
      })
    );
    return mesh;
  }
}
