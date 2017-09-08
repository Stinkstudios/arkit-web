import {
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  Color
} from 'three';

export default class ARPointCloud {
  constructor(maxPoints = 1000) {
    const geometry = new BufferGeometry();
    const positions = new Float32Array(maxPoints * 3);

    // Position off screen for unused points
    this.offset = [50, 50, 50];

    let i3;
    for (let i = 0; i < maxPoints; i += 1) {
      i3 = i * 3;
      positions[i3] = this.offset[0];
      positions[i3 + 1] = this.offset[1];
      positions[i3 + 2] = this.offset[2];
    }

    geometry.addAttribute('position', new BufferAttribute(positions, 3));

    const vertexShader = `
      void main() {
				vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
				gl_PointSize = 0.1 * (100.0 / -mvPosition.z);
				gl_Position = projectionMatrix * mvPosition;
			}
    `;

    const fragmentShader = `
      uniform vec3 color;
      void main() {
        if (length(gl_PointCoord.xy - vec2(0.5)) > 0.5) discard;
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const material = new ShaderMaterial({
      uniforms: {
        color: {
          value: new Color(0xffff00)
        }
      },
      vertexShader,
      fragmentShader
    });

    this.mesh = new Points(geometry, material);
    this.mesh.frustumCulled = false;
    this.count = this.mesh.geometry.attributes.position.count;
  }

  update(points) {
    let point;
    for (let i = 0; i < this.count; i += 1) {
      point = points[i] !== undefined ? points[i] : this.offset;
      this.mesh.geometry.attributes.position.setXYZ(
        i,
        point[0],
        point[1],
        point[2]
      );
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
  }
}
