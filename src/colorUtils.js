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

    return { red, green, blue }
  }
}
