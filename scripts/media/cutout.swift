// Lifts the subject out of a photo with Apple's Vision framework (macOS 14 or later)
// and writes a PNG with a transparent background, cropped to the subject.
//
//   swift scripts/media/cutout.swift <photo> <out.png> [--choke 1] [--pad 0.02] [--largest]
//
//   --choke    pulls the matte edge in by this many pixels, dropping the halo the
//              old background leaves around the subject (default 1)
//   --pad      transparent margin around the subject, as a share of its size
//   --largest  keeps only the biggest subject when Vision finds several

import CoreImage
import Foundation
import Vision

let args = CommandLine.arguments
guard args.count >= 3 else {
  print("Usage: swift cutout.swift <photo> <out.png> [--choke 1] [--pad 0.02] [--largest]")
  exit(1)
}

func option(_ name: String, _ fallback: Double) -> Double {
  guard let i = args.firstIndex(of: "--\(name)"), i + 1 < args.count, let value = Double(args[i + 1]) else {
    return fallback
  }
  return value
}

let input = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])
let choke = option("choke", 1)
let pad = option("pad", 0.02)

guard let photo = CIImage(contentsOf: input, options: [.applyOrientationProperty: true]) else {
  fatalError("Could not read \(input.path)")
}

let handler = VNImageRequestHandler(ciImage: photo)
let request = VNGenerateForegroundInstanceMaskRequest()
try handler.perform([request])
guard let observation = request.results?.first else {
  fatalError("No subject found in \(input.lastPathComponent)")
}

/// Pixel coverage and bounding box (top-left origin) of a mask above half opacity.
func measure(_ buffer: CVPixelBuffer) -> (count: Int, minX: Int, minY: Int, maxX: Int, maxY: Int) {
  CVPixelBufferLockBaseAddress(buffer, .readOnly)
  defer { CVPixelBufferUnlockBaseAddress(buffer, .readOnly) }
  let width = CVPixelBufferGetWidth(buffer)
  let height = CVPixelBufferGetHeight(buffer)
  let stride = CVPixelBufferGetBytesPerRow(buffer)
  let base = CVPixelBufferGetBaseAddress(buffer)!
  let float = CVPixelBufferGetPixelFormatType(buffer) == kCVPixelFormatType_OneComponent32Float
  var count = 0
  var minX = width, minY = height, maxX = -1, maxY = -1
  for y in 0..<height {
    for x in 0..<width {
      let value: Float = float
        ? base.load(fromByteOffset: y * stride + x * 4, as: Float.self)
        : Float(base.load(fromByteOffset: y * stride + x, as: UInt8.self)) / 255
      if value > 0.5 {
        count += 1
        minX = min(minX, x); maxX = max(maxX, x)
        minY = min(minY, y); maxY = max(maxY, y)
      }
    }
  }
  return (count, minX, minY, maxX, maxY)
}

var instances = observation.allInstances
if args.contains("--largest") {
  let sizes = try instances.map { index in
    (index, measure(try observation.generateScaledMaskForImage(forInstances: [index], from: handler)).count)
  }
  instances = IndexSet([sizes.max { $0.1 < $1.1 }!.0])
}

let maskBuffer = try observation.generateScaledMaskForImage(forInstances: instances, from: handler)
let bounds = measure(maskBuffer)
guard bounds.count > 0 else { fatalError("Empty mask for \(input.lastPathComponent)") }

var mask = CIImage(cvPixelBuffer: maskBuffer)
if choke > 0 {
  mask = mask
    .applyingFilter("CIMorphologyMinimum", parameters: [kCIInputRadiusKey: choke])
    .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 0.6])
    .cropped(to: photo.extent)
}

let cut = photo.applyingFilter(
  "CIBlendWithMask",
  parameters: [
    kCIInputBackgroundImageKey: CIImage(color: .clear).cropped(to: photo.extent),
    kCIInputMaskImageKey: mask,
  ])

// Crop to the subject plus padding. CIImage coordinates start at the bottom left.
let subjectWidth = Double(bounds.maxX - bounds.minX + 1)
let subjectHeight = Double(bounds.maxY - bounds.minY + 1)
let margin = max(subjectWidth, subjectHeight) * pad
let photoHeight = Double(photo.extent.height)
let crop = CGRect(
  x: Double(bounds.minX) - margin,
  y: photoHeight - Double(bounds.maxY + 1) - margin,
  width: subjectWidth + margin * 2,
  height: subjectHeight + margin * 2
).integral.intersection(photo.extent)

let result = cut.cropped(to: crop).transformed(by: CGAffineTransform(translationX: -crop.minX, y: -crop.minY))
let sRGB = CGColorSpace(name: CGColorSpace.sRGB)!
try CIContext(options: [.workingColorSpace: sRGB]).writePNGRepresentation(
  of: result, to: output, format: .RGBA8, colorSpace: sRGB)
print("\(output.lastPathComponent)  \(Int(crop.width))×\(Int(crop.height))")
