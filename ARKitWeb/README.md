# ARKitWeb

A simple wrapper for WKWebView that exposes the data from ARKit

## Workflow

By default the app will load the static files from `www`. To develop WebGL content with live reloading set the following variables in `ViewController.swift`

```
let DEBUG = true
let DEV_URL = "https://2d297f28.ngrok.io"
```

Note the `DEV_URL` should be updated once you run `yarn tunnel` in `Web` directory

To hide the cubes rendered in MKView comment out the following in `Renderer.swift`

```
// updateAnchors(frame: currentFrame)
```
