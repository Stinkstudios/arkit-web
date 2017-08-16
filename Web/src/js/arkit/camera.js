/**
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 * @author WestLangley / http://github.com/WestLangley
 * @author ixviii / https://www.ixviii.io
 */

import { Matrix4, Quaternion, Object3D, Vector3 } from 'three';

function ARCamera() {
  Object3D.call(this);

  this.type = 'Camera';

  this.matrixWorldInverse = new Matrix4();
  this.projectionMatrix = new Matrix4();
}

ARCamera.prototype = Object.assign(Object.create(Object3D.prototype), {
  constructor: ARCamera,

  isCamera: true,

  copy(source, recursive) {
    Object3D.prototype.copy.call(this, source, recursive);

    this.matrixWorldInverse.copy(source.matrixWorldInverse);
    this.projectionMatrix.copy(source.projectionMatrix);

    return this;
  },

  getWorldDirection: (() => {
    const quaternion = new Quaternion();

    return function getWorldDirection(optionalTarget) {
      const result = optionalTarget || new Vector3();

      this.getWorldQuaternion(quaternion);

      return result.set(0, 0, -1).applyQuaternion(quaternion);
    };
  })(),

  /**
   * We set the matrixWorldInverse directly
   * @return {[type]} [description]
   */
  updateMatrixWorld(/* force */) {
    // Object3D.prototype.updateMatrixWorld.call( this, force );
    // this.matrixWorldInverse.getInverse( this.matrixWorld );
  },

  clone() {
    return new this.constructor().copy(this);
  }
});

export default ARCamera;
