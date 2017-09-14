# AR anchors

This demo allows you to place ARAnchors within your world by tapping on the screen.

Refer to the [installation instructions](../../../../../README.md#installation) before running this demo.

1. Open your terminal and run `yarn start` and `yarn tunnel` from the `arkit-web/Demos` directory
2. Copy the ngrok https url from terminal
3. Open `arkit-web/ARKitWeb.xcodeproj` in Xcode
4. Click the `Build Settings` tab
5. Scroll down and locate the `DEV_URL` flag
6. Paste the ngrok https url into the `DEV_URL` field
7. Set `let DEBUG = true` in `ARKitWeb/ViewController.swift` for live reloading
8. Set `let DEFAULT_DEMO = "index"` in `ARKitWeb/ViewController.swift`
9. Click `Build and run`
