import Foundation
import AppKit

if #available(macOS 10.11, *) {
    let performer = NSHapticFeedbackManager.defaultPerformer
    performer.perform(.alignment, performanceTime: .now)
}
