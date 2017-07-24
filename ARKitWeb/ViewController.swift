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
            
            view.addSubview(webView)
            
            let url = URL(string: "https://a5036fa4.ngrok.io")!
            webView.load(URLRequest(url: url))
            
            guard view.device != nil else {
                print("Metal is not supported on this device")
                return
            }
            
            // Configure the renderer to draw to the view
            renderer = Renderer(session: session, metalDevice: view.device!, renderDestination: view)
            
            renderer.drawRectResized(size: view.bounds.size)
        }
        
//        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(ViewController.handleTap(gestureRecognize:)))
//        view.addGestureRecognizer(tapGesture)
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(animated)
        
        // Create a session configuration
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
     The tap is currently initiated from the web view
     */
    func addAnchor() {
        if (!ARWorldTrackingSessionConfiguration.isSupported) { return }
        if let currentFrame = session.currentFrame {
            
            print("addAnchor")
            
            // Create a transform with a translation of 0.2 meters in front of the camera
            var translation = matrix_identity_float4x4
            translation.columns.3.z = -1
            let transform = simd_mul(currentFrame.camera.transform, translation)
            
            // Add a new anchor to the session
            let anchor = ARAnchor(transform: transform)
            session.add(anchor: anchor)
        }
    }
    
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Handle message callbacks from javascript
        if(message.name == "touchCallbackHandler") {
            // print("touch \(message.body)")
            self.addAnchor()
        }
    }
    
    @objc
//    func handleTap(gestureRecognize: UITapGestureRecognizer) {
//        // Create anchor using the camera's current position
//        if let currentFrame = session.currentFrame {
//            
//            // Create a transform with a translation of 0.2 meters in front of the camera
//            var translation = matrix_identity_float4x4
//            translation.columns.3.z = -0.2
//            let transform = simd_mul(currentFrame.camera.transform, translation)
//            
//            // Add a new anchor to the session
//            let anchor = ARAnchor(transform: transform)
//            session.add(anchor: anchor)
//        }
//    }
    
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
        
        // Store all data in dict to send to the web view
        var data = Dictionary<String, Any>()
        data["matrixWorldInverse"] = "\(simd_inverse(frame.camera.transform))"
        data["cameraTransform"] = "\(frame.camera.transform)"
        data["cameraProjection" ] = "\(frame.camera.projectionMatrix(withViewportSize: viewportSize, orientation: .landscapeRight, zNear: 0.001, zFar: 1000))"
        data["anchors"] = anchors
        data["ambientIntensity"] = ambientIntensity
        //data["pointCloud"] = frame.rawFeaturePoints?.points
        
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
    
    func sessionWasInterrupted(_ session: ARSession) {
        // Inform the user that the session has been interrupted, for example, by presenting an overlay
        
    }
    
    func sessionInterruptionEnded(_ session: ARSession) {
        // Reset tracking and/or remove existing anchors if consistent tracking is required
        
    }
}
