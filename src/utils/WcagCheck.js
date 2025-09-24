/**
 * Utility class for the colors used in WCAG checks.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

/**
 * A Utility class for the colors used in WCAG checks.
 */
export default class WcagCheck {
  /**
   * Creates an instance of WcagCheck.
   *
   * @param {string} foreground - The foreground color in hex format.
   * @param {string} background - The background color in hex format.
   * @param {string} level - The WCAG level to check against ('AA' or 'AAA').
   * @param {boolean} level.isLargeText - Whether the text is considered large (18pt or 14pt bold).
   */
  constructor (foreground, background, { level = 'AA', isLargeText = false } = {}) {
    this.foreground = foreground
    this.background = background
    this.level = level
    this.isLargeText = isLargeText
  }
}
