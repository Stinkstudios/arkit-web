//
//  ViewController.swift
//  ARKitWeb
//
//  Created by Amelie Rosser on 21/07/2017.
//  Copyright © 2017 Stink Studios. All rights reserved.
//

import UIKit
import Metal
import MetalKit
import ARKit
import WebKit

extension MTKView : RenderDestinationProvider {
}

class ViewController: UIViewController, MTKViewDelegate, ARSessionDelegate, WKScriptMessageHandler {

    let DEBUG = true
    let IMAGE_DATA = false
    let POINTCLOUD_DATA = false

    var session: ARSession!
    var renderer: RendererDebug!
    var webView: WKWebView!

    // The current viewport size
    var viewportSize: CGSize = CGSize()

    var imageUtil: ImageUtil!

    override func viewDidLoad() {
        super.viewDidLoad()

        // Set the view's delegate
        session = ARSession()
        session.delegate = self

        // Set the view to use the default device
        if let view = self.view as? MTKView {
            view.device = MTLCreateSystemDefaultDevice()
            view.backgroundColor = UIColor.clear
            view.delegate = self

            // Create web view
            let contentController = WKUserContentController();

            contentController.add(
                self,
                name: "callbackHandler"
            )

            let config = WKWebViewConfiguration()
            config.userContentController = contentController

            viewportSize = view.bounds.size

            webView = WKWebView(frame: CGRect(origin: CGPoint.init(x: 0, y: 0), size: view.bounds.size), configuration: config)
            webView.isOpaque = false
            webView.backgroundColor = UIColor.clear
            webView.scrollView.backgroundColor = UIColor.clear
            webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]

            // Add the webview as a subview of MTKView
            view.addSubview(webView)

            // Use ngrok for live reload developing
            if (DEBUG) {

                let DEV_URL = Bundle.main.infoDictionary!["DEV_URL"] as! String

                let url = URL(string: DEV_URL)!
                webView.load(URLRequest(url: url))
            } else {
                if let path = Bundle.main.path(forResource: "www/index", ofType: "html") {
                    webView.load(URLRequest(url: URL(fileURLWithPath: path)))
                }
            }

            guard view.device != nil else {
                print("Metal is not supported on this device")
                return
            }

            // Configure the renderer to draw to the view
            renderer = RendererDebug(session: session, metalDevice: view.device!, renderDestination: view)

            renderer.drawRectResized(size: view.bounds.size)
        }

        imageUtil = ImageUtil()
    }

    // Hide the status bar
    override var prefersStatusBarHidden: Bool {
        return true
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)

        // Create a session configuration
        // Reference: https://developer.apple.com/documentation/arkit/arworldtrackingsessionconfiguration
        let configuration = ARWorldTrackingConfiguration()
        configuration.worldAlignment = .gravity
        configuration.planeDetection = .horizontal

        // Run the view's session
        session.run(configuration)
    }

    override func viewWillDisappear(_ animated: Bool) {
        super.viewWillDisappear(animated)

        // Pause the view's session
        session.pause()
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Release any cached data, images, etc that aren't in use.
    }

    /**
     Add an anchor to the session
     The tap is currently initiated from the web view since it captures all guestures

     Reference: https://developer.apple.com/documentation/arkit/aranchor
     */
    func addAnchor() {
        if (!ARWorldTrackingConfiguration.isSupported) { return }
        if let currentFrame = session.currentFrame {
            // Create a transform with a translation of 0.2 meters in front of the camera
            var translation = matrix_identity_float4x4
            translation.columns.3.z = -1
            let transform = simd_mul(currentFrame.camera.transform, translation)

            // Add a new anchor to the session
            let anchor = ARAnchor(transform: transform)

            print("addAnchor \(anchor.identifier)")

            session.add(anchor: anchor)
        }
    }

    func removeAnchors(identifiers: [NSString]) {
        print("removeAnchors")
        print(identifiers)

        if let currentFrame = session.currentFrame {
            for (_, anchor) in currentFrame.anchors.enumerated() {
                for (_, identifier) in identifiers.enumerated() {
                    let uuid = UUID.init(uuidString: identifier as String)
                    if (uuid == anchor.identifier) {
                        session.remove(anchor: anchor)
                    }
                }
            }
        }
    }

    func getCameraData(camera: ARCamera) -> Dictionary<String, Any> {
        var data = Dictionary<String, Any>()
        // Uncomment if needed (make sure to parse the data in arkit/utils.js)
        data["transform"] = "\(camera.transform)"
        // The projection matrix here matches the one in Renderer.swift
        data["projection" ] = "\(camera.projectionMatrix(for: .landscapeRight, viewportSize: viewportSize, zNear: 0.001, zFar: 1000))"
        data["matrixWorldInverse"] = "\(simd_inverse(camera.transform))"
        return data
    }

    func getAnchorData(anchor: ARAnchor) -> Dictionary<String, Any> {
        var data = Dictionary<String, Any>()
        data["type"] = "ARAnchor"
        data["identifier"] = String(describing: anchor.identifier)
        data["transform"] = "\(anchor.transform)"
        return data
    }

    func getAnchorPlaneData(anchor: ARPlaneAnchor) -> Dictionary<String, Any> {
        var data = Dictionary<String, Any>()
        data["type"] = "ARPlaneAnchor"
        data["identifier"] = String(describing: anchor.identifier)
        data["transform"] = "\(anchor.transform)"
        data["center"] = "\(anchor.center)"
        data["extent"] = "\(anchor.extent)"
        return data
    }

    func getAnchorsData(anchors: [ARAnchor]) -> [Any] {
        var data = [Any]()
        for (_, anchor) in anchors.enumerated() {
            switch anchor {
            case let planeAnchor as ARPlaneAnchor:
                data.append(self.getAnchorPlaneData(anchor: planeAnchor))
            default:
                data.append(self.getAnchorData(anchor: anchor))
            }
        }
        return data
    }

    func getPointCloudData(frame: ARFrame) -> Dictionary<String, Any> {
        var pointCloudSize = 0

        if ((frame.rawFeaturePoints?.__count) != nil) {
            pointCloudSize = (frame.rawFeaturePoints?.__count)!
        }

        // https://stackoverflow.com/questions/45222259/arkit-how-do-you-iterate-all-detected-feature-points
        var points = [Any]()
        for index in 0..<pointCloudSize {
            let point = frame.rawFeaturePoints?.__points[index]
            points.append("\(point!)")
        }

        var data = Dictionary<String, Any>()
        data["points"] = points
        data["count"] = pointCloudSize

        return data
    }

    /**
     Perform a hitTest

     Reference: https://developer.apple.com/documentation/arkit/arframe/2875718-hittest
     */
    func hitTest(point: CGPoint, hitType: NSNumber) {
        if let currentFrame = session.currentFrame {
            let hitTestResults = currentFrame.hitTest(point, types: ARHitTestResult.ResultType(rawValue: ARHitTestResult.ResultType.RawValue(truncating: hitType)))

            var data = Dictionary<String, Any>()
            var results = [Any]()

            for (_, result) in hitTestResults.enumerated() {
                var hitTest = Dictionary<String, Any>()
                hitTest["type"] = result.type.rawValue

                switch(result.type) {
                    case ARHitTestResult.ResultType.featurePoint:
                        hitTest["localTransform"] = "\(result.localTransform)"
                        hitTest["worldTransform"] = "\(result.worldTransform)"
                    case ARHitTestResult.ResultType.estimatedHorizontalPlane:
                        hitTest["distance"] = result.distance
                        hitTest["localTransform"] = "\(result.localTransform)"
                        hitTest["worldTransform"] = "\(result.worldTransform)"
                    case ARHitTestResult.ResultType.existingPlane:
                        hitTest["distance"] = result.distance
                        hitTest["localTransform"] = "\(result.localTransform)"
                        hitTest["worldTransform"] = "\(result.worldTransform)"
                        hitTest["anchor"] = self.getAnchorPlaneData(anchor: result.anchor! as! ARPlaneAnchor)
                    case ARHitTestResult.ResultType.existingPlaneUsingExtent:
                        hitTest["distance"] = result.distance
                        hitTest["localTransform"] = "\(result.localTransform)"
                        hitTest["worldTransform"] = "\(result.worldTransform)"
                        hitTest["anchor"] = self.getAnchorPlaneData(anchor: result.anchor! as! ARPlaneAnchor)
                    default:
                        break
                }

                results.append(hitTest)
            }

            data["results"] = results

            do {
                let json = try JSONSerialization.data(withJSONObject: data, options: JSONSerialization.WritingOptions(rawValue: 0))
                let jsonData = NSString(data: json, encoding: String.Encoding.utf8.rawValue)!

                let api = "ARKit.onHitTest('\(jsonData)\')";
                self.callClient(api: api)
            } catch {
                print("error serialising json")
            }
        }

    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Handle message callbacks from javascript
        if(message.name == "callbackHandler") {

            // We send an object from the client, we receive it as a NSDictionary
            let data = message.body as! NSDictionary
            let action = data["action"] as! String

            switch(action) {
                case "addAnchor":
                    self.addAnchor()
                case "removeAnchors":
                    let identifiers = data["value"] as! [NSString]
                    self.removeAnchors(identifiers: identifiers)
                case "hitTest":
                    let point = data["value"] as! NSDictionary
                    let x = point["x"] as! Double
                    let y = point["y"] as! Double
                    let hitType = data["hitType"] as! NSNumber
                    self.hitTest(point: CGPoint.init(x: x, y: y), hitType: hitType)
                default: break
            }
        }
    }

    // MARK: - MTKViewDelegate

    // Called whenever view changes orientation or layout is changed
    func mtkView(_ view: MTKView, drawableSizeWillChange size: CGSize) {
        viewportSize = size
        renderer.drawRectResized(size: size)
    }

    // Called whenever the view needs to render
    func draw(in view: MTKView) {
        renderer.update()
    }

    // MARK: - ARSessionDelegate

    func session(_ session: ARSession, didFailWithError error: Error) {
        // Present an error message to the user
    }

    /**
     https://developer.apple.com/documentation/arkit/arsessiondelegate/2865611-session

     Implement this method if you provide your own display for rendering an AR experience. The provided ARFrame
     object contains the latest image captured from the device camera, which you can render as a scene background,
     as well as information about camera parameters and anchor transforms you can use for rendering virtual content on top of the camera image.
     */
     func session(_ session: ARSession, didUpdate frame: ARFrame) {
        var ambientIntensity: Float = 1.0

        if let lightEstimate = frame.lightEstimate {
            ambientIntensity = Float(lightEstimate.ambientIntensity) / 1000.0
        }

        // Store all data in dict, parse as json to send to the web view
        // floats and matrix strings need to be parsed client side
        var data = Dictionary<String, Any>()
        data["camera"] = self.getCameraData(camera: frame.camera)
        data["anchors"] = self.getAnchorsData(anchors: frame.anchors)
        data["ambientIntensity"] = ambientIntensity

        if (IMAGE_DATA) {
            data["image"] = imageUtil.getImageData(pixelBuffer: frame.capturedImage)
        }

        if (POINTCLOUD_DATA) {
            data["pointCloud"] = self.getPointCloudData(frame: frame)
        }

        do {
            let json = try JSONSerialization.data(withJSONObject: data, options: JSONSerialization.WritingOptions(rawValue: 0))
            let jsonData = NSString(data: json, encoding: String.Encoding.utf8.rawValue)!

            let api = "ARKit.onARFrame('\(jsonData)\')";
            self.callClient(api: api);
        } catch {
         print("error serialising json")
        }
    }

    /**
     Call the WKWebView

     @param api The function containing any arguments. To keep things clean all methods are envoked through the 'ARKit' object on the window
     */
    func callClient(api: String) {
        self.webView.evaluateJavaScript(api, completionHandler: nil)
    }

    /**
     This is called when new anchors are added to the session.

     @param session The session being run.
     @param anchors An array of added anchors.
     */
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        print("Anchors added")
        var data = Dictionary<String, Any>()
        data["anchors"] = self.getAnchorsData(anchors: anchors)

        do {
            let json = try JSONSerialization.data(withJSONObject: data, options: JSONSerialization.WritingOptions(rawValue: 0))
            let jsonData = NSString(data: json, encoding: String.Encoding.utf8.rawValue)!

            let api = "ARKit.onAnchorsAdded('\(jsonData)')";
            self.callClient(api: api)
        } catch {
            print("error serialising json")
        }
    }

    /**
     This is called when anchors are updated.

     @param session The session being run.
     @param anchors An array of updated anchors.
     */
    func session(_ session: ARSession, didUpdate anchors: [ARAnchor]) {
        // print("Anchors updated")
        //print(anchors)
    }

    /**
     This is called when anchors are removed from the session.

     @param session The session being run.
     @param anchors An array of removed anchors.
     */
    func session(_ session: ARSession, didRemove anchors: [ARAnchor]) {
        print("Anchors removed")
        var data = Dictionary<String, Any>()
        data["anchors"] = self.getAnchorsData(anchors: anchors)

        do {
            let json = try JSONSerialization.data(withJSONObject: data, options: JSONSerialization.WritingOptions(rawValue: 0))
            let jsonData = NSString(data: json, encoding: String.Encoding.utf8.rawValue)!

            let api = "ARKit.onAnchorsRemoved('\(jsonData)')";
            self.callClient(api: api)
        } catch {
            print("error serialising json")
        }
    }

    func sessionWasInterrupted(_ session: ARSession) {
        // Inform the user that the session has been interrupted, for example, by presenting an overlay
        // (If the user leaves the app)
        print("sessionWasInterrupted")
        let api = "ARKit.onSessionInterupted()";
        self.callClient(api: api)
    }

    func sessionInterruptionEnded(_ session: ARSession) {
        // Reset tracking and/or remove existing anchors if consistent tracking is required
        // When the user returns to the app
        print("sessionInterruptionEnded")
        let api = "ARKit.onSessionInteruptedEnded()";
        self.callClient(api: api)
    }
}
