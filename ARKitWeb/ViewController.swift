//
//  ViewController.swift
//  ARKitWeb
//
//  Created by Amelie Rosser on 21/07/2017.
//  Copyright © 2017 Amelie Rosser. All rights reserved.
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
    let DEV_URL = "https://511450eb.ngrok.io"

    var session: ARSession!
    var renderer: Renderer!
    var webView: WKWebView!

    // The current viewport size
    var viewportSize: CGSize = CGSize()

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
                name: "touchCallbackHandler"
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
            renderer = Renderer(session: session, metalDevice: view.device!, renderDestination: view)

            renderer.drawRectResized(size: view.bounds.size)
        }
    }

    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)

        // Create a session configuration
        // Reference: https://developer.apple.com/documentation/arkit/arworldtrackingsessionconfiguration
        let configuration = ARWorldTrackingSessionConfiguration()
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
        if (!ARWorldTrackingSessionConfiguration.isSupported) { return }
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
    
    /**
     Perform a hitTest
     
     Reference: https://developer.apple.com/documentation/arkit/arframe/2875718-hittest
     */
    func hitTest(point: CGPoint, hitType: NSNumber) {
        if let currentFrame = session.currentFrame {
            let hitTestResults = currentFrame.hitTest(point, types: ARHitTestResult.ResultType(rawValue: ARHitTestResult.ResultType.RawValue(hitType))) as! [ARHitTestResult]
            
            var data = Dictionary<String, Any>()
            var results = [Any]()
            
            for (_, result) in hitTestResults.enumerated() {
                var hitTest = Dictionary<String, Any>()
                hitTest["distance"] = result.distance
                hitTest["localTransform"] = "\(result.localTransform)"
                hitTest["worldTransform"] = "\(result.worldTransform)"
                //hitTest["anchor"] = "\(result.anchor)" // TODO
                results.append(hitTest)
            }
            data["results"] = results
            
            // Convert dic to json and send to the web view
            do {
                let allInfoJSON = try JSONSerialization.data(withJSONObject: data, options: JSONSerialization.WritingOptions(rawValue: 0))
                
                let jsonData = NSString(data: allInfoJSON, encoding: String.Encoding.utf8.rawValue)!
                
                let fn = "onHitTest('\(jsonData)\')";
                self.webView.evaluateJavaScript(fn, completionHandler: { (html: AnyObject?, error: NSError?) in
                    print(html!)
                    } as? (Any?, Error?) -> Void)
            } catch {
                print("error serialising json")
            }
        }
        
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Handle message callbacks from javascript
        if(message.name == "touchCallbackHandler") {
            
            // We send an object from the client, we receive it as a NSDictionary
            let data = message.body as! NSDictionary
            let action = data["action"] as! String
            
            switch(action) {
                case "addAnchor":
                    self.addAnchor()
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
        var anchors = [Any]()
        for (_, anchor) in frame.anchors.enumerated() {

            var anchorData = Dictionary<String, Any>()

            switch anchor {
                case let planeAnchor as ARPlaneAnchor:
                    anchorData["type"] = "ARPlaneAnchor"
                    anchorData["uuid"] = String(describing: planeAnchor.identifier)
                    anchorData["transform"] = "\(planeAnchor.transform)"
                    anchorData["center"] = "\(planeAnchor.center)"
                    anchorData["extent"] = "\(planeAnchor.extent)"
                    anchors.append(anchorData)
                 default:
                   anchorData["type"] = "ARAnchor"
                   anchorData["uuid"] = String(describing: anchor.identifier)
                   anchorData["transform"] = "\(anchor.transform)"
                   anchors.append(anchorData)
            }
        }

        var ambientIntensity: Float = 1.0

        if let lightEstimate = frame.lightEstimate {
            ambientIntensity = Float(lightEstimate.ambientIntensity) / 1000.0
        }

        // Store all data in dict, parse as json to send to the web view
        // floats and matrix strings need to be parsed client side
        var data = Dictionary<String, Any>()
        data["matrixWorldInverse"] = "\(simd_inverse(frame.camera.transform))"
        data["cameraTransform"] = "\(frame.camera.transform)"

        // The projection matrix here matches the one in Renderer.swift
        data["cameraProjection" ] = "\(frame.camera.projectionMatrix(withViewportSize: viewportSize, orientation: .landscapeRight, zNear: 0.001, zFar: 1000))"
        data["anchors"] = anchors
        data["ambientIntensity"] = ambientIntensity
        //data["pointCloud"] = frame.rawFeaturePoints?.points

        // Convert dic to json and send to the web view
        do {
            let allInfoJSON = try JSONSerialization.data(withJSONObject: data, options: JSONSerialization.WritingOptions(rawValue: 0))

            let jsonData = NSString(data: allInfoJSON, encoding: String.Encoding.utf8.rawValue)!

            let fn = "onARFrame('\(jsonData)\')";
            self.webView.evaluateJavaScript(fn, completionHandler: { (html: AnyObject?, error: NSError?) in
                print(html!)
            } as? (Any?, Error?) -> Void)
        } catch {
         print("error serialising json")
        }

        renderer.update()
    }

    /**
     This is called when new anchors are added to the session.

     @param session The session being run.
     @param anchors An array of added anchors.
     */
    func session(_ session: ARSession, didAdd anchors: [ARAnchor]) {
        print("Anchors added")
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
    }

    func sessionWasInterrupted(_ session: ARSession) {
        // Inform the user that the session has been interrupted, for example, by presenting an overlay
        // (If the user leaves the app)
        print("sessionWasInterrupted")
    }

    func sessionInterruptionEnded(_ session: ARSession) {
        // Reset tracking and/or remove existing anchors if consistent tracking is required
        // When the user returns to the app
        print("sessionInterruptionEnded")
    }
}
