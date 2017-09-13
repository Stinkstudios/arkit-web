import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Vector3,
  GridHelper,
  AxisHelper
} from 'three';
import '../gui';
import OrbitControls from '../../lib/OrbitControls';
import ARKit from '../../arkit/arkit';
import ARConfig from '../../arkit/config';
import ARCamera from '../../arkit/camera';
import { IS_NATIVE } from '../../arkit/constants';
import ARPointCloud from '../../objects/pointcloud';
import RenderStats from '../../lib/render-stats';
import stats from '../../lib/stats';

const SHOW_STATS = false;

class App {
  constructor() {
    // Set the config
    ARConfig.imageFrame = false;
    ARConfig.pointCloud = true;

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
    const near = 0.01;
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

    // Stats
    if (SHOW_STATS) {
      this.renderStats = new RenderStats();
      this.renderStats.domElement.style.position = 'absolute';
      this.renderStats.domElement.style.left = '0px';
      this.renderStats.domElement.style.top = '48px';
      document.body.appendChild(this.renderStats.domElement);
      document.body.appendChild(stats.domElement);
    }

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
    this.pointCloud = new ARPointCloud();
    this.scene.add(this.pointCloud.mesh);
  }

  bindListeners() {
    window.addEventListener('resize', this.onResize, false);

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

  update(data) {
    this.cameras.ar.matrixWorldInverse.fromArray(
      data.camera.matrixWorldInverse
    );
    this.cameras.ar.projectionMatrix.fromArray(data.camera.projection);

    if (data.pointCloud) {
      this.pointCloud.update(data.pointCloud.points);
    }
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
