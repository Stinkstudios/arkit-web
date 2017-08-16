import {
  MeshLambertMaterial,
  Mesh,
  PlaneBufferGeometry,
  DoubleSide,
  Matrix4
} from 'three';
import MaterialModifier from 'three-material-modifier';
import Shader from './shader.glsl';

export default class Floor {
  constructor(parent) {
    const ExtendedLambertMaterial = MaterialModifier.extend(
      MeshLambertMaterial,
      {
        fragmentShader: {
          postFragColor: Shader.fragmentShader.postFragColor
        }
      }
    );

    const material = new ExtendedLambertMaterial({
      color: 0x212121,
      side: DoubleSide,
      transparent: true
    });

    const geometry = new PlaneBufferGeometry(10, 10);
    geometry.applyMatrix(new Matrix4().makeRotationX(Math.PI / 2));

    const mesh = new Mesh(geometry, material);
    mesh.receiveShadow = true;
    parent.add(mesh);
  }
}
