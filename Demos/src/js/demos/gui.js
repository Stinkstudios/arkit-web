import dat from 'dat-gui';
import ARKit from '../arkit/arkit';

const demos = ['index', 'bubbles', 'pointcloud', 'shadows'];

const path = window.location.pathname.split('/');
let demo = path[path.length - 1].replace('.html', '').replace('/', '');

console.log(window.location.pathname);

// For index
demo = demo === '' ? demos[0] : demo;

const controller = {
  demo
};

const gui = new dat.GUI();
gui.open();

gui.add(controller, 'demo', demos).onChange(demo => {
  ARKit.loadPage(demo);
});

export default gui;
