import { ARPlaneAnchor, ARHitTestResultType } from './constants';

/**
 * clamp a value between 0 and 1
 * @param  {Number} value
 * @return {Number}
 */
export function clamp(value) {
  return Math.min(Math.max(value, 0.0), 1.0);
}

/**
 * parseSimdFloat4x4
 * @param  {String} str The simd string
 * @return {Array} A matrix4 array
 */
export function parseSimdFloat4x4(str) {
  return JSON.parse(
    str.replace(/simd_float4x4\((.+)\)/g, '$1').replace(/\)/g, '')
  );
}

/**
 * parseFloat3
 * @param  {String} str The float3 string
 * @return {Array} A vector3 array
 */
export function parseFloat3(str) {
  return JSON.parse(str.replace(/float3\((.+)\)/g, '[$1]'));
}

/**
 * copyMatrix4Elements
 * @param  {String} Copy the parsed parseSimdFloat4x4 into threejs' matrix 4
 */
export function copyMatrix4Elements(matrix1, matrix2) {
  matrix1.elements[0] = matrix2[0][0];
  matrix1.elements[1] = matrix2[0][1];
  matrix1.elements[2] = matrix2[0][2];
  matrix1.elements[3] = matrix2[0][3];
  matrix1.elements[4] = matrix2[1][0];
  matrix1.elements[5] = matrix2[1][1];
  matrix1.elements[6] = matrix2[1][2];
  matrix1.elements[7] = matrix2[1][3];
  matrix1.elements[8] = matrix2[2][0];
  matrix1.elements[9] = matrix2[2][1];
  matrix1.elements[10] = matrix2[2][2];
  matrix1.elements[11] = matrix2[2][3];
  matrix1.elements[12] = matrix2[3][0];
  matrix1.elements[13] = matrix2[3][1];
  matrix1.elements[14] = matrix2[3][2];
  matrix1.elements[15] = matrix2[3][3];
}

/**
 * Parse ARAnchor string values
 * @param {Object} camera
 * @return {Object}
 */
export function ARCamera(camera) {
  camera.transform = parseSimdFloat4x4(camera.transform);
  camera.projection = parseSimdFloat4x4(camera.projection);
  camera.matrixWorldInverse = parseSimdFloat4x4(camera.matrixWorldInverse);
  return camera;
}

/**
 * Parse ARAnchor string values
 * @param {Object} anchor
 * @return {Object}
 */
export function ARAnchor(anchor) {
  if (anchor.type === ARPlaneAnchor) {
    anchor.center = parseFloat3(anchor.center);
    anchor.extent = parseFloat3(anchor.extent);
  }
  anchor.transform = parseSimdFloat4x4(anchor.transform);
  return anchor;
}

/**
 * Parse ARHitTestResult string values
 * @param {Object} result
 * @return {Object}
 */
export function ARHitTestResult(result) {
  result.localTransform = parseSimdFloat4x4(result.localTransform);
  result.worldTransform = parseSimdFloat4x4(result.worldTransform);
  switch (result.type) {
    case ARHitTestResultType.FeaturePoint:
      break;
    case ARHitTestResultType.HorizontalPlane:
      break;
    case ARHitTestResultType.VerticalPlane:
      break;
    case ARHitTestResultType.ExistingPlane:
      result.anchor = ARAnchor(result.anchor);
      break;
    case ARHitTestResultType.ExistingPlaneUsingExtent:
      result.anchor = ARAnchor(result.anchor);
      break;
    default:
  }
  return result;
}
