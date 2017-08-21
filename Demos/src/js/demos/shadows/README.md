# Shadows

This demo features realtime shadows. Touch and drag on the screen to change the light position.

Refer to the [installation instructions](../../../../README.md#installation) before running this demo.

1. Open your terminal and run `yarn start` and `yarn tunnel` from the `arkit-web/Demos` directory
2. Copy the ngrok https url from terminal
3. Open `arkit-web/ARKitWeb.xcodeproj` in Xcode
4. Click the `Build Settings` tab
5. Scroll down and locate the `DEV_URL` flag
6. Edit `DEV_URL` field with `<ngrok_https>/shadows.html`
7. Click `Build and run`

## Notes

ARKit takes a few seconds to locate the floor plane, so objects might appear in mid air when the demo starts.
