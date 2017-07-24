# Component ARKit Web

A starter kit for using ARKit with WebGL

## Features

* Metal rendering for Camera feed
* threejs for WebGL content
* Use ngrok for live development, local resouces for release

## Requirements

* iOS11 (currently in beta and can be installed from [here](https://beta.apple.com/sp/betaprogram/))
* A device which as A9 and A10 processors

## Implemented

* [ARPlaneAnchor](https://developer.apple.com/documentation/arkit/arplaneanchor)
* [ARAnchor](https://developer.apple.com/documentation/arkit/aranchor)
* [ARLightEstimate](https://developer.apple.com/documentation/arkit/arlightestimate)

## Todo

* [hitTest(_:types:)](https://developer.apple.com/documentation/arkit/arframe/2875718-hittest) **WIP**
* More seamless tracking? There's a slight delay between Metal and WebGL frames. [Related article](https://stackoverflow.com/questions/38382473/synchronize-rendering-between-native-opengl-and-webgl-in-wkwebview-ios).
* Camera texture to WebGL
* Object occlusion using a depth texture


## Resources

* https://developer.apple.com/documentation/arkit
* [https://www.captechconsulting.com/blogs/arkit-fundamentals-in-ios-11](https://www.captechconsulting.com/blogs/arkit-fundamentals-in-ios-11)
