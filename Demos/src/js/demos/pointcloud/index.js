import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Vector3,
  GridHelper,
  AxisHelper
} from 'three';
import dat from 'dat-gui';
import OrbitControls from '../../lib/OrbitControls';
import ARKit from '../../arkit/arkit';
import ARCamera from '../../arkit/camera';
import * as ARKitUtils from '../../arkit/utils';
import { IS_NATIVE } from '../../arkit/constants';
import ARPointCloud from '../../arkit/objects/pointcloud';
import RenderStats from '../../lib/render-stats';
import stats from '../../lib/stats';

const SHOW_STATS = true;

class App {
  constructor() {
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
      this._renderStats = new RenderStats();
      this._renderStats.domElement.style.position = 'absolute';
      this._renderStats.domElement.style.left = '0px';
      this._renderStats.domElement.style.top = '48px';
      document.body.appendChild(this._renderStats.domElement);
      document.body.appendChild(stats.domElement);
    }

    // Gui
    this.totalPoints = 0;
    this.gui = new dat.GUI();
    this.gui.add(this, 'totalPoints').listen();

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

  update(data) {
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

    if (data.pointCloud) {
      this.totalPoints = data.pointCloud.count;
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
