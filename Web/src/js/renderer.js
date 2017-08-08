import { WebGLRenderer } from 'three';

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true
});

// window.devicePixelRatio 2 causes significant framerate drop
// renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

export default renderer;
