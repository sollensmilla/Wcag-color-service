/**
 * Utility class for the color variant requests.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

/**
 *
 */
class ColorVariantRequest {
  /**
   * Creates an instance of ColorVariantRequest.
   *
   * @param basecolor - The base color in hex format (e.g., '#RRGGBB').
   */
  constructor (basecolor) {
    this.basecolor = basecolor
    this.background = '#FFFFFF'
    this.level = 'AA'
    this.isLargeText = false
    this.direction = 'lighten'
  }
}
