export const ARHitTestResultType = {
  /** Result type from intersecting the nearest feature point. */
  FeaturePoint: 1,
  /** Result type from detecting and intersecting a new horizontal plane. */
  HorizontalPlane: 2,
  /** Result type from detecting and intersecting a new vertical plane. */
  VerticalPlane: 4,
  /** Result type from intersecting with an existing plane anchor. */
  ExistingPlane: 8,
  /** Result type from intersecting with an existing plane anchor, taking into account the plane's extent. */
  ExistingPlaneUsingExtent: 16
};
