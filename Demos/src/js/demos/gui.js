import dat from 'dat-gui';
import ARKit from '../arkit/arkit';
import { IS_NATIVE } from '../arkit/constants';

const demos = ['anchors', 'bubbles', 'pointcloud', 'shadows'];

const path = window.location.pathname.split('/');
let demo = path[path.length - 1].replace('.html', '').replace('/', '');

// For index
demo = demo === '' || demo === 'index' ? demos[0] : demo;

const controller = {
  demo
};

const gui = new dat.GUI();
gui.open();

gui.add(controller, 'demo', demos).onChange(demo => {
  if (IS_NATIVE) {
    ARKit.loadPage(demo);
  } else {
    demo = demo === demos[0] ? 'index' : demo;
    window.location.href = `${demo}.html`;
  }
});

export default gui;
