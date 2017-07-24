import {
  Vector3,
  Mesh,
  BoxBufferGeometry,
  MeshLambertMaterial,
  Object3D,
  PlaneBufferGeometry,
  Matrix4,
  DoubleSide
} from 'three';
import FastClick from 'fastclick';
import OrbitControls from 'lib/OrbitControls';
import RenderStats from 'lib/render-stats';
import stats from 'lib/stats';
import * as SwiftUtils from 'utils/swift';
import lights from './lights';
import { cameraDev, cameraARParent, cameraAR } from './cameras';
import renderer from './renderer';
import scene from './scene';
import TouchControls from './touch-controls';
import { SHOW_STATS } from './constants';

class App {
  constructor() {
    // Renderer
    document.body.appendChild(renderer.domElement);

    // Lights
    Object.keys(lights).forEach(light => {
      scene.add(lights[light]);
    });

    // Stats
    if (SHOW_STATS) {
      this._renderStats = new RenderStats();
      this._renderStats.domElement.style.position = 'absolute';
      this._renderStats.domElement.style.left = '0px';
      this._renderStats.domElement.style.top = '48px';
      document.body.appendChild(this._renderStats.domElement);
      document.body.appendChild(stats.domElement);
    }

    // Controls
    this.controls = {
      dev: new OrbitControls(cameraDev, renderer.domElement)
    };

    this.touchControls = new TouchControls(renderer.domElement);

    // Camera position
    this.zoom(cameraDev, 6);

    scene.add(cameraARParent);

    this.data = {
      anchors: []
    };

    this.anchors = {};

    // Update reference
    window.onARFrame = this.onARFrame;

    // Use same geometry for all anchors
    const size = 0.077;
    this.boxGeometry = new BoxBufferGeometry(size, size, size);

    this._bindListeners();
    this._onResize();
  }

  onARFrame = json => {
    const data = JSON.parse(json);

    data.cameraTransform = SwiftUtils.parseSimdFloat4x4(data.cameraTransform);
    data.cameraProjection = SwiftUtils.parseSimdFloat4x4(data.cameraProjection);
    data.matrixWorldInverse = SwiftUtils.parseSimdFloat4x4(
      data.matrixWorldInverse
    );

    for (let i = 0; i < data.anchors.length; i += 1) {
      if (data.anchors[i].type === 'ARPlaneAnchor') {
        data.anchors[i].center = SwiftUtils.parseFloat3(data.anchors[i].center);
        data.anchors[i].extent = SwiftUtils.parseFloat3(data.anchors[i].extent);
      }
      data.anchors[i].transform = SwiftUtils.parseSimdFloat4x4(
        data.anchors[i].transform
      );
    }

    this.data = data;

    this._update();
    this._render();
  };

  _bindListeners() {
    window.addEventListener('resize', this._onResize, false);
    this.touchControls.on('end', this.onTouch);
  }

  onTouch = () => {
    try {
      window.webkit.messageHandlers.touchCallbackHandler.postMessage('touch');
    } catch (err) {
      console.log('The native context does not exist yet'); // eslint-disable-line
    }
  };

  zoom(camera, zoom) {
    camera.position.set(1 * zoom, 0.75 * zoom, 1 * zoom);
    camera.lookAt(new Vector3());
  }

  _update() {
    lights.ambient.intensity = this.data.ambientIntensity;

    if (
      this.data.cameraTransform &&
      this.data.matrixWorldInverse &&
      this.data.cameraProjection
    ) {
      SwiftUtils.copyMatrix4Elements(
        cameraARParent.matrix,
        this.data.cameraTransform
      );
      SwiftUtils.copyMatrix4Elements(
        cameraAR.matrixWorldInverse,
        this.data.matrixWorldInverse
      );
      SwiftUtils.copyMatrix4Elements(
        cameraAR.projectionMatrix,
        this.data.cameraProjection
      );
    }

    this.data.anchors.forEach(anchor => {
      if (anchor.type === 'ARPlaneAnchor') {
        if (this.anchors[anchor.uuid] === undefined) {
          this.addPlaneMesh(anchor);
        } else {
          this.updatePlaneMesh(anchor);
        }
      }
      if (anchor.type === 'ARAnchor') {
        if (this.anchors[anchor.uuid] === undefined) {
          this.addMesh(anchor);
        } else {
          this.updateMesh(anchor);
        }
      }
    });
  }

  addMesh(anchor) {
    console.log('adding', anchor.uuid); // eslint-disable-line

    this.anchors[anchor.uuid] = new Object3D();

    const mesh = new Mesh(
      this.boxGeometry,
      new MeshLambertMaterial({
        color: 0xffffff * Math.random(),
        wireframe: false
      })
      // new MeshLambertMaterial({ color: 0xffffff, wireframe: true })
    );

    this.anchors[anchor.uuid].add(mesh);
    this.anchors[anchor.uuid].matrixAutoUpdate = false;
    SwiftUtils.copyMatrix4Elements(
      this.anchors[anchor.uuid].matrix,
      anchor.transform
    );

    scene.add(this.anchors[anchor.uuid]);
  }

  addPlaneMesh(anchor) {
    console.log('adding', anchor.uuid); // eslint-disable-line

    this.anchors[anchor.uuid] = new Object3D();

    const geometry = new PlaneBufferGeometry(1, 1);
    geometry.applyMatrix(new Matrix4().makeRotationX(Math.PI / 2));
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

    this.anchors[anchor.uuid].add(mesh);
    this.anchors[anchor.uuid].matrixAutoUpdate = false;
    SwiftUtils.copyMatrix4Elements(
      this.anchors[anchor.uuid].matrix,
      anchor.transform
    );

    scene.add(this.anchors[anchor.uuid]);
  }

  updateMesh(anchor) {
    SwiftUtils.copyMatrix4Elements(
      this.anchors[anchor.uuid].matrix,
      anchor.transform
    );
  }

  updatePlaneMesh(anchor) {
    SwiftUtils.copyMatrix4Elements(
      this.anchors[anchor.uuid].matrix,
      anchor.transform
    );
    this.anchors[anchor.uuid].position.fromArray(anchor.center);
    this.anchors[anchor.uuid].scale.x = anchor.extent[0];
    this.anchors[anchor.uuid].scale.z = anchor.extent[2];
  }

  _render() {
    if (SHOW_STATS) {
      stats.begin();
    }

    renderer.render(scene, cameraAR);

    if (SHOW_STATS) {
      this._renderStats.update(renderer);
      stats.end();
    }
  }

  _onResize = () => {
    cameraDev.aspect = window.innerWidth / window.innerHeight;
    cameraDev.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  };
}

document.addEventListener(
  'DOMContentLoaded',
  () => {
    FastClick.attach(document.body);
  },
  false
);

export default new App();
