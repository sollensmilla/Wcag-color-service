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
  /**
   *
   * @param foreground - The foreground color in hex format.
   * @param background - The background color in hex format.
   * @param level.level
   * @param level - The WCAG level to check against ('AA' or 'AAA').
   * @param isLargeText - Whether the text is considered large (18pt or 14pt bold).
   * @param level.isLargeText
   */
  constructor (foreground, background, { level = 'AA', isLargeText = false } = {}) {
    this.foreground = foreground
    this.background = background
    this.level = level
    this.isLargeText = isLargeText
  }
}
