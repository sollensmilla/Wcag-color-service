/**
 * Utility functions for color manipulation and conversion according to WCAG guidelines.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

/**
 * A Utility class for color manipulation and conversion.
 */
export class ColorUtils {
/**
 * Returns the RGB representation of a hex color code.
 *
 * @param {*} hexColor - The hex color code (e.g., "#FFFFFF" or "FFFFFF").
 * @returns {object} An object containing the red, green, and blue components.
 */
  hexToRgb (hexColor) {
    const hashlessHex = hexColor.slice(1)
    const decimalColorValue = parseInt(hashlessHex, 16)

    const red = (decimalColorValue >> 16) & 255
    const green = (decimalColorValue >> 8) & 255
    const blue = decimalColorValue & 255

    return [red, green, blue]
  }

  /**
   * Calculates the relative luminance of an RGB color according to WCAG guidelines and linearizes the color values.
   * @param {array} rgbColor - An array containing the red, green, and blue components.
   * @return {number} The relative luminance value.
   */
  relativeLuminance([red, green, blue]) {
    const standardRgb = [red, green, blue].map(value => value / 255) // Normalize

    const linearRgb = standardRgb.map(value => {
      return value <= 0.03928
        ? value / 12.92
        : Math.pow((value + 0.055) / 1.055, 2.4) // Linearize
    })

    return (
      0.2126 * linearRgb[0] +
      0.7152 * linearRgb[1] +
      0.0722 * linearRgb[2]
    )
  }

  /**
   * Calculates the contrast ratio between two colors according to WCAG guidelines.
   * @param {*} color1 
   * @param {*} color2 
   * @returns {number} The contrast ratio between the two colors.
   */
  contrastRatio(color1, color2) {
    const luminance1 = this.relativeLuminance(this.hexToRgb(color1))
    const luminance2 = this.relativeLuminance(this.hexToRgb(color2))

    const brightestLuminance = Math.max(luminance1, luminance2)
    const darkestLuminance = Math.min(luminance1, luminance2)

    return (brightestLuminance + 0.05) / (darkestLuminance + 0.05)
  }

  /**
   * Checks if the contrast ratio between two colors meets the WCAG guidelines for a given level and text size.
   * @param {*} color1 
   * @param {*} color2 
   * @param {*} level 
   * @param {*} isLargeText 
   * @returns {boolean} True if the colors pass the WCAG guidelines, false otherwise.
   */
  passesWcag(color1, color2, level = 'AA', isLargeText = false) {
    const ratio = this.contrastRatio(color1, color2)

    if (isLargeText) {
      return ratio >= 3
    }

    if (level === 'AAA') {
      return ratio >= 7
    }

    return ratio >= 4.5
  }
}
