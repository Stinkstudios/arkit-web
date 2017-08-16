import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Object3D,
  Vector3,
  GridHelper,
  AxisHelper,
  PCFSoftShadowMap,
  Math as MathUtils
} from 'three';
import OrbitControls from '../../lib/OrbitControls';
import ARKit from '../../arkit/arkit';
import ARCamera from '../../arkit/camera';
import * as ARKitUtils from '../../arkit/utils';
import { IS_NATIVE } from '../../arkit/constants';
import ARVideoTexture from '../../arkit/video-texture';
import RenderStats from '../../lib/render-stats';
import stats from '../../lib/stats';
import TouchControls from '../../lib/touch-controls';
import lights from './lights';

// Objects
import Bubbles from './objects/bubbles/bubbles';

// Constants
const SHOW_STATS = false;

class App {
  constructor() {
    // Renderer
    this.renderer = new WebGLRenderer({
      alpha: true
    });
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new Scene();

    // Cameras
    const fov = 70;
    const ratio = window.innerWidth / window.innerHeight;
    const near = 0.1;
    const far = 1000;
    const zoom = 1;
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
      this._renderStats = new RenderStats();
      this._renderStats.domElement.style.position = 'absolute';
      this._renderStats.domElement.style.left = '0px';
      this._renderStats.domElement.style.top = '48px';
      document.body.appendChild(this._renderStats.domElement);
      document.body.appendChild(stats.domElement);
    }

    // Controls
    this.touchControls = new TouchControls(this.renderer.domElement);

    // Map of anchors
    // identifier is the key
    this.anchors = {};

    this.floorVector = new Vector3();
    this.floorPositionY = 0;
    this.container = new Object3D();
    this.scene.add(this.container);

    this.addObjects();
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

  addObjects() {
    this.videoTexture = new ARVideoTexture();
    this.bubbles = new Bubbles(this.container, this.videoTexture.get()); // eslint-disable-line no-unused-vars
  }

  bindListeners() {
    window.addEventListener('resize', this.onResize, false);
    this.touchControls.on('move', this.onTouchMove);

    ARKit.on('frame', this.onARFrame);
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
      this._renderStats.update(this.renderer);
      stats.end();
    }
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

  onTouchMove = event => {
    // Direction
    lights.directional.position.x = MathUtils.lerp(-1, 1, event[0].x);
    lights.directional.position.z = MathUtils.lerp(-1, 1, event[0].y);
  };

  update(data) {
    lights.ambient.intensity = data.ambientIntensity;

    if (data.image) {
      this.videoTexture.update(data.image);
    }

    this.bubbles.update(
      data.camera.transform[3][0], // 12
      data.camera.transform[3][1], // 13
      data.camera.transform[3][2] // 14
    );

    if (data.camera) {
      ARKitUtils.copyMatrix4(
        this.cameras.ar.matrixWorldInverse,
        data.camera.matrixWorldInverse
      );
      ARKitUtils.copyMatrix4(
        this.cameras.ar.projectionMatrix,
        data.camera.projection
      );
    }
  }

  renderDev = () => {
    requestAnimationFrame(this.renderDev);
    if (SHOW_STATS) {
      stats.begin();
    }

    this.bubbles.update(
      this.cameras.dev.position.x,
      this.cameras.dev.position.y,
      this.cameras.dev.position.z
    );

    this.renderer.render(this.scene, this.cameras.dev);

    if (SHOW_STATS) {
      this._renderStats.update(this.renderer);
      stats.end();
    }
  };

  onResize = () => {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.cameras.dev.ratio = window.innerWidth / window.innerHeight;
    this.cameras.dev.updateProjectionMatrix();
  };
}

export default new App();
