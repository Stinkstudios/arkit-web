import {
  MeshLambertMaterial,
  Mesh,
  BoxBufferGeometry,
  SphereBufferGeometry,
  ConeBufferGeometry,
  Color
} from 'three';

const size = 0.075;

export default class Primitive {
  constructor(parent, primitive, position, scale, h) {
    let geometry;
    switch (primitive) {
      case 'box':
        geometry = new BoxBufferGeometry(
          size * scale,
          size * scale,
          size * scale
        );
        break;
      case 'cone':
        geometry = new ConeBufferGeometry(size * scale, size * scale * 2, 32);
        break;
      default:
        geometry = new SphereBufferGeometry(size * scale, 32, 32);
    }

    const color = new Color().setHSL(h, 0.5, 0.6);
    const material = new MeshLambertMaterial({
      color,
      wireframe: false
    });

    geometry.computeBoundingBox();
    const y = geometry.boundingBox.getSize().y / 2;

    this.mesh = new Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.position.x = position.x;
    this.mesh.position.z = position.y;
    this.mesh.position.y = y;
    parent.add(this.mesh);
  }
}
