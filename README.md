# Component ARKit Web

A starter kit for using ARKit with WebGL

## Features

* Metal rendering for Camera feed
* threejs for WebGL content
* Use ngrok for live development, local resouces for release
* ARKit interface model for event subscription

## Example

```
import ARKit from './arkit/arkit';

/* Get latest frame data */
ARKit.on('ARFrame', data => {});

/* Subsribe to hit test result */
ARKit.on('hitTest', data => {});

/* Call hit test from touch coordinates */
ARKit.hitTest(0.5, 0.5, ARHitTestResultType.featurePoint);
```

## Requirements

* iOS11 (currently in beta and can be installed from [here](https://beta.apple.com/sp/betaprogram/))
* A device which as A9 and A10 processors

## Implemented

* [ARPlaneAnchor](https://developer.apple.com/documentation/arkit/arplaneanchor)
* [ARAnchor](https://developer.apple.com/documentation/arkit/aranchor)
* [ARLightEstimate](https://developer.apple.com/documentation/arkit/arlightestimate)
* [ARHitTestResult](https://developer.apple.com/documentation/arkit/arhittestresult)
* [ARSession remove(anchor:)](https://developer.apple.com/documentation/arkit/arsession/2865607-remove)

## Todo

* More seamless tracking? There's a slight delay between Metal and WebGL frames. [Related article](https://stackoverflow.com/questions/38382473/synchronize-rendering-between-native-opengl-and-webgl-in-wkwebview-ios).
* Camera texture to WebGL
* Object occlusion using a depth texture


## Resources

* https://developer.apple.com/documentation/arkit
* [https://www.captechconsulting.com/blogs/arkit-fundamentals-in-ios-11](https://www.captechconsulting.com/blogs/arkit-fundamentals-in-ios-11)
