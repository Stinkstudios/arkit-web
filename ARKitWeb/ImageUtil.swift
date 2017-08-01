//
//  ImageUtil.swift
//  ARKitWeb
//
//  Created by Amelie Rosser on 27/07/2017.
//  Copyright © 2017 Amelie Rosser. All rights reserved.
//

import UIKit
import Metal
import MetalKit
import ARKit
import WebKit

class ImageUtil {
    
    var context: CIContext = CIContext()
    var colorSpace: CGColorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
//    var options: Dictionary<CFString, Any> = [ kCGImageDestinationLossyCompressionQuality: 0.5 ]
    let jpegCompressionQuality: CGFloat = 0.5
    let scale: CGFloat = 0.25;

    // First attempt
    
    func getImageFromSampleBuffer (pixelBuffer: CVPixelBuffer) -> UIImage? {
        let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
        let resizedCIImage = ciImage.transformed(by: CGAffineTransform(scaleX: scale, y: scale))

        if let image = context.createCGImage(resizedCIImage, from: resizedCIImage.extent) {
            return UIImage(cgImage: image)
        }
        return nil;
    }

    func getImageData(pixelBuffer: CVPixelBuffer) -> String {
        let image = getImageFromSampleBuffer(pixelBuffer: pixelBuffer)

        if let base64String = UIImageJPEGRepresentation(image!, jpegCompressionQuality)?.base64EncodedString() {
            // Upload base64String to your database
            return base64String;
        }
        return ""
    }
    
    //    Second attempt - works but throws an error :/
    
//    func getImageData(pixelBuffer: CVPixelBuffer) -> String {
//        let ciImage = CIImage(cvPixelBuffer: pixelBuffer)
//
//        // Scale image down by x percent
//        let resizedCIImage = ciImage.transformed(by: CGAffineTransform(scaleX: 0.25, y: 0.25))
//
//        let jpegData = context.jpegRepresentation(of: resizedCIImage, colorSpace: colorSpace, options: options)
//
//        return (jpegData?.base64EncodedString())!
//    }
}