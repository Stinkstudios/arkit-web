import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Object3D,
  Vector3,
  GridHelper,
  AxisHelper
} from 'three';
import '../gui';
import OrbitControls from '../../lib/OrbitControls';
import ARKit from '../../arkit/arkit';
import ARConfig from '../../arkit/config';
import ARCamera from '../../arkit/camera';
import ARAnchorCube from '../../objects/anchor-cube';
import ARAnchorPlane from '../../objects/anchor-plane';
import { IS_NATIVE } from '../../arkit/constants';
import RenderStats from '../../lib/render-stats';
import stats from '../../lib/stats';
import TouchControls from '../../lib/touch-controls';
import lights from './lights';

const SHOW_STATS = false;

class App {
  constructor() {
    // Set the config
    ARConfig.imageFrame = false;
    ARConfig.pointCloud = false;

    // Renderer
    this.renderer = new WebGLRenderer({
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new Scene();

    // Cameras
    const fov = 70;
    const ratio = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    const zoom = 10;
    this.cameras = {
      dev: new PerspectiveCamera(fov, ratio, near, far),
      ar: new ARCamera()
    };
    this.cameras.dev.position.set(1 * zoom, 0.75 * zoom, 1 * zoom);
    this.cameras.dev.lookAt(new Vector3());

    // UI
    this.ui = {
      interruptedOverlay: document.querySelector('.overlay-session-interupted')
    };

    // Lights
    Object.keys(lights).forEach(light => {
      this.scene.add(lights[light]);
    });

    // Stats
    if (SHOW_STATS) {
      this.renderStats = new RenderStats();
      this.renderStats.domElement.style.position = 'absolute';
      this.renderStats.domElement.style.left = '0px';
      this.renderStats.domElement.style.top = '48px';
      document.body.appendChild(this.renderStats.domElement);
      document.body.appendChild(stats.domElement);
    }

    // Controls
    this.touchControls = new TouchControls(this.renderer.domElement);

    // Map of anchors
    // identifier is the key
    this.anchors = {};

    this.bindListeners();
    this.onResize();

    if (!IS_NATIVE) {
      this.orbitControls = new OrbitControls(
        this.cameras.dev,
        this.renderer.domElement
      );
      this.scene.add(new GridHelper());
      this.scene.add(new AxisHelper());
      this.renderDev();
    }
  }

  bindListeners() {
    window.addEventListener('resize', this.onResize, false);
    this.touchControls.on('end', this.onTouch);

    ARKit.on('frame', this.onARFrame);
    ARKit.on('anchorsAdded', this.onARAnchorsAdded);
    ARKit.on('anchorsRemoved', this.onARAnchorsRemoved);
    ARKit.on('sessionInterupted', this.onARSessionInterupted);
    ARKit.on('sessionInteruptedEnded', this.onARSessionInteruptedEnded);
  }

  onARFrame = data => {
    if (SHOW_STATS) {
      stats.begin();
    }

    this.update(data);

    this.renderer.render(this.scene, this.cameras.ar);

    if (SHOW_STATS) {
      this.renderStats.update(this.renderer);
      stats.end();
    }
  };

  onARAnchorsAdded = data => {
    console.log('onAnchorsAdded', data); // eslint-disable-line no-console
  };

  onARAnchorsRemoved = data => {
    data.anchors.forEach(anchor => {
      if (this.anchors[anchor.identifier]) {
        this.scene.remove(this.anchors[anchor.identifier]);
      }
    });
  };

  onARSessionInterupted = () => {
    this.ui.interruptedOverlay.classList.add(
      'overlay-session-interrupted--active'
    );
  };

  onARSessionInteruptedEnded = () => {
    this.ui.interruptedOverlay.classList.remove(
      'overlay-session-interrupted--active'
    );
  };

  onTouch = () => {
    ARKit.addAnchor();
  };

  update(data) {
    lights.ambient.intensity = data.ambientIntensity;

    this.cameras.ar.matrixWorldInverse.fromArray(
      data.camera.matrixWorldInverse
    );
    this.cameras.ar.projectionMatrix.fromArray(data.camera.projection);

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
    this.anchors[anchor.identifier].matrix.fromArray(anchor.transform);
    this.scene.add(this.anchors[anchor.identifier]);
  }

  addPlaneMesh(anchor) {
    console.log('adding', anchor.identifier); // eslint-disable-line

    this.anchors[anchor.identifier] = new Object3D();

    // Returns a mesh instance
    const mesh = new ARAnchorPlane(anchor);

    this.anchors[anchor.identifier].add(mesh);
    this.anchors[anchor.identifier].matrixAutoUpdate = false;
    this.anchors[anchor.identifier].matrix.fromArray(anchor.transform);
    this.scene.add(this.anchors[anchor.identifier]);
  }

  updateMesh(anchor) {
    this.anchors[anchor.identifier].matrix.fromArray(anchor.transform);
  }

  updatePlaneMesh(anchor) {
    this.anchors[anchor.identifier].matrix.fromArray(anchor.transform);
    this.anchors[anchor.identifier].children[0].position.fromArray(
      anchor.center
    );
    this.anchors[anchor.identifier].children[0].scale.x = anchor.extent[0];
    this.anchors[anchor.identifier].children[0].scale.z = anchor.extent[2];
  }

  renderDev = () => {
    requestAnimationFrame(this.renderDev);
    if (SHOW_STATS) {
      stats.begin();
    }

    this.renderer.render(this.scene, this.cameras.dev);

    if (SHOW_STATS) {
      this.renderStats.update(this.renderer);
      stats.end();
    }
  };

  onResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.cameras.dev.aspect = window.innerWidth / window.innerHeight;
    this.cameras.dev.updateProjectionMatrix();
  };
}

export default new App();
