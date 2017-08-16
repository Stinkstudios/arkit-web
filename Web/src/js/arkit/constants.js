export const ARPlaneAnchor = 'ARPlaneAnchor';
export const ARAnchor = 'ARAnchor';
export const IS_NATIVE = window.webkit !== undefined;

// https://developer.apple.com/documentation/arkit/arhittestresult.resulttype
const featurePoint = 'featurePoint';
const horizontalPlane = 'horizontalPlane';
const verticalPlane = 'verticalPlane';
const existingPlane = 'existingPlane';
const existingPlaneUsingExtent = 'existingPlaneUsingExtent';

// List of all result types
export const ARHitTestResults = [
  featurePoint,
  horizontalPlane,
  verticalPlane,
  existingPlane,
  existingPlaneUsingExtent
];

// Vertical plane isn't mentioned in docs, but it was in Unity3D's implemention
export const ARHitTestResultType = {
  /** Result type from intersecting the nearest feature point. */
  [featurePoint]: 1,
  /** Result type from detecting and intersecting a new horizontal plane. */
  [horizontalPlane]: 2,
  /** Result type from detecting and intersecting a new vertical plane. */
  [verticalPlane]: 4,
  /** Result type from intersecting with an existing plane anchor. */
  [existingPlane]: 8,
  /** Result type from intersecting with an existing plane anchor, taking into account the plane's extent. */
  [existingPlaneUsingExtent]: 16
};
