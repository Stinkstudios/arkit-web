# AR PointCloud

This demo shows the raw feature points from the scene analysis.

Refer to the [installation instructions](../../../../../README.md#installation) before running this demo.

1. Open your terminal and run `yarn start` and `yarn tunnel` from the `arkit-web/Demos` directory
2. Copy the ngrok https url from terminal
3. Open `arkit-web/ARKitWeb.xcodeproj` in Xcode
4. Click the `Build Settings` tab
5. Scroll down and locate the `DEV_URL` flag
6. Paste the ngrok https url into the `DEV_URL` field
7. Set `let DEBUG = true` in `ARKitWeb/ViewController.swift` for live reloading
8. Set `let DEFAULT_DEMO = "pointcloud"` in `ARKitWeb/ViewController.swift`
9. Click `Build and run`

## Notes

ARKit does not guarantee that the number and arrangement of raw feature points will remain stable between software releases, or even between subsequent frames in the same session.

[Reference](https://developer.apple.com/documentation/arkit/arframe/2887449-rawfeaturepoints)
