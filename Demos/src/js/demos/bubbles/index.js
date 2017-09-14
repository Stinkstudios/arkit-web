import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Object3D,
  Vector3,
  GridHelper,
  AxisHelper,
  PCFSoftShadowMap,
  Math as MathUtils,
  AmbientLight,
  DirectionalLight
} from 'three';
import '../gui';
import OrbitControls from '../../lib/OrbitControls';
import ARKit from '../../arkit/arkit';
import ARConfig from '../../arkit/config';
import ARCamera from '../../arkit/camera';
import { IS_NATIVE } from '../../arkit/constants';
import ARVideoTexture from '../../objects/video-texture';
import RenderStats from '../../lib/render-stats';
import stats from '../../lib/stats';
import TouchControls from '../../lib/touch-controls';

// Objects
import Bubbles from './objects/bubbles/bubbles';

// Constants
const SHOW_STATS = false;

class App {
  constructor() {
    // Set the config
    ARConfig.imageFrame = true;
    ARConfig.pointCloud = false;

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
    this.lights = {
      ambient: new AmbientLight(0xd4d4d4),
      directional: new DirectionalLight(0xffffff, 1)
    };

    this.lights.directional.position.set(1, 1, 1);
    this.scene.add(this.lights.ambient);
    this.scene.add(this.lights.directional);

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
    this.bubbles = new Bubbles(this.container, this.videoTexture.texture);
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
      this.renderStats.update(this.renderer);
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
    this.lights.directional.position.x = MathUtils.lerp(-1, 1, event[0].x);
    this.lights.directional.position.z = MathUtils.lerp(-1, 1, event[0].y);
  };

  update(data) {
    this.lights.ambient.intensity = data.ambientIntensity;

    if (data.image) {
      this.videoTexture.update(data.image);
    }

    this.bubbles.update(
      data.camera.transform[12],
      data.camera.transform[13],
      data.camera.transform[14]
    );

    this.cameras.ar.matrixWorldInverse.fromArray(
      data.camera.matrixWorldInverse
    );
    this.cameras.ar.projectionMatrix.fromArray(data.camera.projection);
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
