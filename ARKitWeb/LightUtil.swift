//
//  LightUtil.swift
//  ARKitWeb
//
//  Created by Amelie Rosser on 05/10/2017.
//  Copyright © 2017 Stink Studios. All rights reserved.
//
//  Adapted from https://github.com/mattdesl/kelvin-to-rgb
//  Original implementation by Tanner Helland
//  http://www.tannerhelland.com/4435/convert-temperature-rgb-algorithm-code/

import Foundation
import UIKit

// approximate an RGB color from a Kelvin temperature
func kelvinToRGB(temperatureKelvin: CGFloat) -> [Double] {
    let temp = Double(temperatureKelvin / 100.0)
    var red = 0.0
    var blue = 0.0
    var green = 0.0
    
    if (temp <= 66) {
        red = 255
    } else {
        red = temp - 60
        red = 329.698727466 * pow(red, -0.1332047592)
        if (red < 0) {
            red = 0
        }
        if (red > 255) {
            red = 255
        }
    }
    
    if (temp <= 66) {
        green = temp
        green = 99.4708025861 * log(green) - 161.1195681661
        if (green < 0) {
            green = 0
        }
        if (green > 255) {
            green = 255
        }
    } else {
        green = temp - 60
        green = 288.1221695283 * pow(green, -0.0755148492)
        if (green < 0) {
            green = 0
        }
        if (green > 255) {
            green = 255
        }
    }
    
    if (temp >= 66) {
        blue = 255
    } else {
        if (temp <= 19) {
            blue = 0
        } else {
            blue = temp - 10
            blue = 138.5177312231 * log(blue) - 305.0447927307
            if (blue < 0) {
                blue = 0
            }
            if (blue > 255) {
                blue = 255
            }
        }
    }
    
    return [floor(red), floor(green), floor(blue)]
}
