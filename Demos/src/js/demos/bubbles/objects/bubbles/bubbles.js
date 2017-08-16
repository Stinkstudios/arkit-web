import {
  MeshLambertMaterial,
  Mesh,
  InstancedBufferGeometry,
  SphereGeometry,
  InstancedBufferAttribute,
  Math as MathUtils,
  Vector3,
  Matrix4,
  Quaternion
} from 'three';
import MaterialModifier from 'three-material-modifier';
import Shader from './shader.glsl';

const size = 0.05;
const MAX_BUBBLES = 100;

export default class Sphere {
  constructor(parent, texture) {
    const geometry = new InstancedBufferGeometry().fromGeometry(
      new SphereGeometry(size, 16, 16)
    );

    const mcol0 = new InstancedBufferAttribute(
      new Float32Array(MAX_BUBBLES * 3),
      3,
      1
    );
    const mcol1 = new InstancedBufferAttribute(
      new Float32Array(MAX_BUBBLES * 3),
      3,
      1
    );
    const mcol2 = new InstancedBufferAttribute(
      new Float32Array(MAX_BUBBLES * 3),
      3,
      1
    );
    const mcol3 = new InstancedBufferAttribute(
      new Float32Array(MAX_BUBBLES * 3),
      3,
      1
    );

    const matrix = new Matrix4();
    const position = new Vector3();
    const quaternion = new Quaternion();
    const scale = new Vector3();
    const range = 1;
    let randomScale;

    for (let i = 0; i < mcol0.count; i += 1) {
      position.x = MathUtils.lerp(-range, range, Math.random());
      position.y = MathUtils.lerp(-range, range, Math.random());
      position.z = MathUtils.lerp(-range, range, Math.random());
      randomScale = MathUtils.lerp(0.35, 1.5, Math.random());
      scale.set(randomScale, randomScale, randomScale);
      matrix.compose(position, quaternion, scale);

      mcol0.setXYZ(
        i,
        matrix.elements[0],
        matrix.elements[1],
        matrix.elements[2]
      );
      mcol1.setXYZ(
        i,
        matrix.elements[4],
        matrix.elements[5],
        matrix.elements[6]
      );
      mcol2.setXYZ(
        i,
        matrix.elements[8],
        matrix.elements[9],
        matrix.elements[10]
      );
      mcol3.setXYZ(
        i,
        matrix.elements[12],
        matrix.elements[13],
        matrix.elements[14]
      );
    }

    geometry.addAttribute('mcol0', mcol0);
    geometry.addAttribute('mcol1', mcol1);
    geometry.addAttribute('mcol2', mcol2);
    geometry.addAttribute('mcol3', mcol3);

    const ExtendedLambertMaterial = MaterialModifier.extend(
      MeshLambertMaterial,
      {
        uniforms: {
          cameraPosition: {
            type: 'v3',
            value: new Vector3()
          }
        },
        vertexShader: {
          uniforms: Shader.vertexShader.uniforms,
          preTransform: Shader.vertexShader.preTransform,
          postTransform: Shader.vertexShader.postTransform
        },
        fragmentShader: {
          uniforms: Shader.fragmentShader.uniforms,
          postFragColor: Shader.fragmentShader.postFragColor
        }
      }
    );

    this.material = new ExtendedLambertMaterial({
      map: texture,
      // color: 0xff0000,
      transparent: true,
      depthTest: false
    });

    const mesh = new Mesh(geometry, this.material);
    mesh.frustumCulled = false;
    parent.add(mesh);
  }

  update(x, y, z) {
    this.material.uniforms.cameraPosition.value.set(x, y, z);
  }
}
