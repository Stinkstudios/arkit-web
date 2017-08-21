# Bubbles

This demo features bubbles with realtime reflections from the camera.

Refer to the [installation instructions](../../../../README.md#installation) before running this demo.

1. Open your terminal and run `yarn start` and `yarn tunnel` from the `arkit-web/Demos` directory
2. Copy the ngrok https url from terminal
3. Open `arkit-web/ARKitWeb.xcodeproj` in Xcode
4. Open `arkit-web/ARKitWeb/ViewController.swift`
5. Set the `IMAGE_DATA` flag to true
6. Click the `Build Settings` tab
7. Scroll down and locate the `DEV_URL` flag
8. Edit `DEV_URL` field with `<ngrok_https>/bubbles.html`
9. Click `Build and run`

## Notes

Converting the camera image to base64 string requires more processing hence why the feature is disabled by default
