/**
 * Utility class for the colors used in WCAG checks.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

/**
 * A Utility class for the colors used in WCAG checks.
 */
export class WcagCheck {
  constructor(foreground, background, { level = 'AA', isLargeText = false } = {}) {
    this.foreground = foreground
    this.background = background
    this.level = level
    this.isLargeText = isLargeText
  }
}
