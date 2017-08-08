import { Object3D } from 'three';
import dat from 'dat-gui';
import RenderStats from 'lib/render-stats';
import stats from 'lib/stats';
import * as ARKitUtils from 'arkit/utils';
import { ARHitTestResults, ARHitTestResultType } from 'arkit/constants';
import lights from './lights';
import { cameraAR } from './cameras';
import renderer from './renderer';
import scene from './scene';
import TouchControls from './touch-controls';
import { SHOW_STATS } from './constants';
import ARKit from './arkit/arkit';
import ARKitVideoTexture from './arkit/video-texture';

// Objects
// import Mirror from './objects/mirror';
import ARAnchorCube from './objects/ar-anchor-cube';
import ARAnchorPlane from './objects/ar-anchor-plane';

class App {
  constructor() {
    // Renderer
    document.body.appendChild(renderer.domElement);

    // Lights
    Object.keys(lights).forEach(light => {
      scene.add(lights[light]);
    });

    // scene.add(new AxisHelper());

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
    this.touchControls = new TouchControls(renderer.domElement);

    // Gui
    const actions = ['addAnchor', 'hitTest'];
    this.action = actions[0];
    this.hitTestType = ARHitTestResults[0];
    this.totalAnchors = 0;
    this.gui = new dat.GUI();
    this.gui.add(this, 'action', actions);
    this.gui.add(this, 'hitTestType', ARHitTestResults);
    this.gui.add(this, 'totalAnchors').listen();
    this.gui.add(this, 'removeAnchors');

    this.anchors = {};

    this.videoTexture = new ARKitVideoTexture();

    this._addObjects();
    this._bindListeners();
    this._onResize();
  }

  _addObjects() {
    // const mirror = new Mirror(scene, this.videoTexture); // eslint-disable-line no-unused-vars
  }

  _bindListeners() {
    window.addEventListener('resize', this._onResize, false);
    this.touchControls.on('end', this.onTouch);

    ARKit.on('frame', this.onARFrame);
    ARKit.on('hitTest', this.onHitTest);
    ARKit.on('anchorsAdded', this.onAnchorsAdded);
    ARKit.on('anchorsRemoved', this.onAnchorsRemoved);
  }

  onARFrame = data => {
    this._update(data);
    this._render();
  };

  onHitTest = data => {
    console.log('onHitTest', data); // eslint-disable-line no-console
  };

  removeAnchors = () => {
    console.log('remove all anchors'); // eslint-disable-line no-console

    const identifiers = Object.keys(this.anchors);

    ARKit.removeAnchors(identifiers);
  };

  recordStart = () => {
    ARKit.recordStart();
  };

  recordStop = () => {
    ARKit.recordStop();
  };

  onAnchorsAdded = data => {
    console.log('onAnchorsAdded', data); // eslint-disable-line no-console
  };

  onAnchorsRemoved = data => {
    data.anchors.forEach(anchor => {
      if (this.anchors[anchor.identifier]) {
        scene.remove(this.anchors[anchor.identifier]);
      }
    });
  };

  onTouch = event => {
    switch (this.action) {
      case 'addAnchor':
        ARKit.addAnchor();
        break;
      case 'hitTest':
        ARKit.hitTest(
          event[0].x,
          event[0].y,
          ARHitTestResultType.existingPlaneUsingExtent
        );
        break;
      default:
    }
  };

  _update(data) {
    lights.ambient.intensity = data.ambientIntensity;

    // this.videoTexture.update(data.image);

    if (data.camera) {
      ARKitUtils.copyMatrix4Elements(
        cameraAR.matrixWorldInverse,
        data.camera.matrixWorldInverse
      );
      ARKitUtils.copyMatrix4Elements(
        cameraAR.projectionMatrix,
        data.camera.projection
      );
    }

    this.totalAnchors = data.anchors.length;

    data.anchors.forEach(anchor => {
      if (anchor.type === 'ARPlaneAnchor') {
        if (this.anchors[anchor.identifier] === undefined) {
          this.addPlaneMesh(anchor);
        } else {
          this.updatePlaneMesh(anchor);
        }
      }
      if (anchor.type === 'ARAnchor') {
        if (this.anchors[anchor.identifier] === undefined) {
          this.addMesh(anchor);
        } else {
          this.updateMesh(anchor);
        }
      }
    });
  }

  addMesh(anchor) {
    console.log('adding', anchor.identifier); // eslint-disable-line

    // Returns a mesh instance
    this.anchors[anchor.identifier] = new ARAnchorCube();
    this.anchors[anchor.identifier].matrixAutoUpdate = false;
    ARKitUtils.copyMatrix4Elements(
      this.anchors[anchor.identifier].matrix,
      anchor.transform
    );

    scene.add(this.anchors[anchor.identifier]);
  }

  addPlaneMesh(anchor) {
    console.log('adding', anchor.identifier); // eslint-disable-line

    this.anchors[anchor.identifier] = new Object3D();

    // Returns a mesh instance
    const mesh = new ARAnchorPlane(anchor);

    this.anchors[anchor.identifier].add(mesh);
    this.anchors[anchor.identifier].matrixAutoUpdate = false;
    ARKitUtils.copyMatrix4Elements(
      this.anchors[anchor.identifier].matrix,
      anchor.transform
    );

    scene.add(this.anchors[anchor.identifier]);
  }

  updateMesh(anchor) {
    ARKitUtils.copyMatrix4Elements(
      this.anchors[anchor.identifier].matrix,
      anchor.transform
    );
  }

  updatePlaneMesh(anchor) {
    ARKitUtils.copyMatrix4Elements(
      this.anchors[anchor.identifier].matrix,
      anchor.transform
    );
    this.anchors[anchor.identifier].children[0].position.fromArray(
      anchor.center
    );
    this.anchors[anchor.identifier].children[0].scale.x = anchor.extent[0];
    this.anchors[anchor.identifier].children[0].scale.z = anchor.extent[2];
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
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
}

export default new App();
