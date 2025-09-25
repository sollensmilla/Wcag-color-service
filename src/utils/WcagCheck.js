/**
 * Utility class for the colors used in WCAG checks.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

/**
 * Sets the foreground and background colors along with WCAG preferences for a color contrast check.
 */
export default class WcagCheck {
  constructor (foreground, background, { level = 'AA', isLargeText = false } = {}) {
    this.foreground = foreground
    this.background = background
    this.level = level
    this.isLargeText = isLargeText
  }
}
