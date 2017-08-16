# AR anchors

This demo allows you to place ARAnchors within your world by tapping on the screen. Once an anchor is added a wireframe cube is rendered above a solid cube to tracking between native and webgl rendering.

Refer to the [installation instructions](../../../../README.md#installation) before running this demo.

1. Open your terminal and run `yarn start` and `yarn tunnel` from the `component-arkit-web/Demos` directory
2. Copy the ngrok https url from terminal. It should look something like `https://e6b516c8.ngrok.io`
3. Open `component-arkit-web/ARKitWeb.xcodeproj` in Xcode
4. Click the `Build Settings` tab
5. Scroll down and locate the `DEV_URL` flag
8. Edit `DEV_URL` field with `<ngrok_https>/index.html`
7. Click `Build and run`
