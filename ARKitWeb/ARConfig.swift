//
//  ARConfig.swift
//  ARKitWeb
//
//  Created by Amelie Rosser on 06/09/2017.
//  Copyright © 2017 Amelie Rosser. All rights reserved.
//

import Foundation

struct ARConfig {
    
    // Camera settings
    struct camera {
        static var near = 0.001
        static var far = 1000.0
    }
    
    // Expose pointCloud data
    static var pointCloud = false
    
    // Expose frame data
    static var imageFrame = false
}
