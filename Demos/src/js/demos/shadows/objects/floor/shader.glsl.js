export default {
  fragmentShader: {
    postFragColor: `
	    gl_FragColor.a = (1.0 - getShadowMask()) * 0.45;
    `
  }
};
