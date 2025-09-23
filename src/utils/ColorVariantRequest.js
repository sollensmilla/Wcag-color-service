/**
 * Utility class for the color variant requests.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

/**
 *
 */
export default class ColorVariantRequest {
  /**
   * Creates an instance of ColorVariantRequest.
   *
   * @param {string} basecolor - The base color in hex format (e.g., '#RRGGBB').
   */
  constructor (basecolor) {
    this.basecolor = basecolor
    this.background = '#FFFFFF'
    this.level = 'AA'
    this.isLargeText = false
    this.direction = 'lighten'
  }

  /**
   * Sets the background color for the color variant request.
   *
   * @param {string} background - The background color in hex format (e.g., '#RRGGBB').
   * @returns {ColorVariantRequest} The updated ColorVariantRequest instance.
   */
  withBackground (background) {
    this.background = background
    return this
  }

  /**
   * Sets the WCAG level for the color variant request.
   *
   * @param {string} level - The WCAG level to check against ('AA' or 'AAA').
   * @returns {ColorVariantRequest} The updated ColorVariantRequest instance.
   */
  withLevel (level) {
    this.level = level
    return this
  }

  /**
   * Sets whether the text is considered large for the color variant request.
   *
   * @param {boolean} isLargeText - True if the text is large, false otherwise.
   * @returns {ColorVariantRequest} The updated ColorVariantRequest instance.
   */
  withLargeText (isLargeText) {
    this.isLargeText = isLargeText
    return this
  }

  /**
   * Sets the direction for the color variant request.
   *
   * @param {string} direction - The direction for the color variant ('lighten' or 'darken').
   * @returns {ColorVariantRequest} The updated ColorVariantRequest instance.
   */
  withDirection (direction) {
    this.direction = direction
    return this
  }
}
