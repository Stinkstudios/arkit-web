import {
  PlaneBufferGeometry,
  Mesh,
  MeshLambertMaterial,
  DoubleSide
} from 'three';

export default class Mirror {
  constructor(parent, videoTexture) {
    const size = 0.077;
    this.mirrorMesh = new Mesh(
      new PlaneBufferGeometry(size, size),
      new MeshLambertMaterial({
        color: 0xffffff,
        side: DoubleSide,
        map: videoTexture.get()
      })
    );
    this.mirrorMesh.position.z = -0.2;
    this.mirrorMesh.scale.x = 1.3333333333;
    parent.add(this.mirrorMesh);
  }
}
