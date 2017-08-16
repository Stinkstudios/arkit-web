export default {
  vertexShader: {
    uniforms: `
      attribute vec3 mcol0;
      attribute vec3 mcol1;
      attribute vec3 mcol2;
      attribute vec3 mcol3;
      varying vec3 vEye;
      varying vec3 vNormal;
    `,
    preTransform: `
      mat4 matrix = mat4(
        vec4(mcol0, 0),
        vec4(mcol1, 0),
        vec4(mcol2, 0),
        vec4(mcol3, 1)
      );
    `,
    postTransform: `
      // world position
      vec4 worldPos = modelMatrix * matrix * vec4(transformed, 1.0);

      // world normal
      vNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);

      // eye direction
      vEye = cameraPosition - worldPos.xyz;

      // screen position
      gl_Position = projectionMatrix * modelViewMatrix * worldPos;
    `
  },
  fragmentShader: {
    uniforms: `
      varying vec3 vEye;
      varying vec3 vNormal;
    `,
    postFragColor: `
      // smooth rim for the alpha
      float cosTheta = abs(dot(normalize(vEye), vNormal));
      float fresnel = pow(1.0 - cosTheta, 4.0);
      float alpha = smoothstep(0.0, 0.5, fresnel);
      gl_FragColor.a = alpha;
    `
  }
};
