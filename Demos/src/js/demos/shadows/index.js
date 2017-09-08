import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  Object3D,
  Vector2,
  Vector3,
  GridHelper,
  AxisHelper,
  PCFSoftShadowMap,
  Math as MathUtils
} from 'three';
import OrbitControls from '../../lib/OrbitControls';
import ARKit from '../../arkit/arkit';
import ARCamera from '../../arkit/camera';
import ARAnchorPlane from '../../objects/anchor-plane';
import { IS_NATIVE } from '../../arkit/constants';
import RenderStats from '../../lib/render-stats';
import stats from '../../lib/stats';
import TouchControls from '../../lib/touch-controls';
import lights from './lights';

// Objects
import Floor from './objects/floor/floor';
import Primitive from './objects/primitive/primitive';

// Constants
const SHOW_STATS = true;

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

    this.floorVector = new Vector3(0, Infinity, 0);
    this.floorPositionY = Infinity;
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
    const floor = new Floor(this.container); // eslint-disable-line no-unused-vars

    const data = [
      { type: 'box', position: new Vector2(0, 0), scale: 1.4 },
      { type: 'sphere', position: new Vector2(-0.4, -0.4), scale: 4 },
      { type: 'sphere', position: new Vector2(0.2, -0.4), scale: 1.5 },
      { type: 'box', position: new Vector2(-0.5, 0.4), scale: 2.5 },
      { type: 'cone', position: new Vector2(0.5, 0.4), scale: 2.5 }
    ];

    for (let i = 0; i < data.length; i += 1) {
      const primitive = new Primitive( // eslint-disable-line no-unused-vars
        this.container,
        data[i].type,
        data[i].position,
        data[i].scale,
        i / data.length - 1
      );
    }
  }

  bindListeners() {
    window.addEventListener('resize', this.onResize, false);
    this.touchControls.on('move', this.onTouchMove);

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
      this._renderStats.update(this.renderer);
      stats.end();
    }
  };

  removeAnchors = () => {
    console.log('remove all anchors'); // eslint-disable-line no-console

    const identifiers = Object.keys(this.anchors);

    ARKit.removeAnchors(identifiers);
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

  onTouchMove = event => {
    // Position
    lights.spot.position.x = MathUtils.lerp(-2, 2, event[0].x);
    lights.spot.position.z = MathUtils.lerp(-2, 2, event[0].y);
    // Direction
    lights.directional.position.x = MathUtils.lerp(-1, 1, event[0].x);
    lights.directional.position.z = MathUtils.lerp(-1, 1, event[0].y);
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
    });

    this.updateFloorPosition();
  }

  updateFloorPosition() {
    // Get lowest ARAnchorPosition for the floor
    Object.values(this.anchors).forEach(anchor => {
      if (anchor.anchorType === 'ARPlaneAnchor') {
        this.floorVector.setFromMatrixPosition(anchor.matrixWorld);

        if (this.floorVector.y < this.floorPositionY) {
          this.floorPositionY = this.floorVector.y;
        }
      }
    });

    this.container.position.y = this.floorPositionY;
  }

  addPlaneMesh(anchor) {
    console.log('adding', anchor.identifier); // eslint-disable-line

    this.anchors[anchor.identifier] = new Object3D();
    this.anchors[anchor.identifier].anchorType = 'ARPlaneAnchor';

    // Returns a mesh instance
    const mesh = new ARAnchorPlane(anchor);
    mesh.visible = false;

    this.anchors[anchor.identifier].add(mesh);
    this.anchors[anchor.identifier].matrixAutoUpdate = false;
    this.anchors[anchor.identifier].matrix.fromArray(anchor.transform);
    this.scene.add(this.anchors[anchor.identifier]);
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
      this._renderStats.update(this.renderer);
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
