/**
 * Utility class for color manipulation and conversion according to WCAG guidelines.
 *
 * @author Smilla Sollén
 * @version 1.0.0
 */

import { WcagCheck } from './WcagCheck.js'
/**
 * A Utility class for color manipulation and conversion.
 */
export class WcagColorService {
  /**
   * Returns the RGB representation of a hex color code.
   *
   * @param {string} hexColor - The hex color code (e.g., '#RRGGBB').
   * @returns {object} An object containing the red, green, and blue components.
   */
  #hexToRgb (hexColor) {
    const hashlessHex = hexColor.slice(1)
    const decimalColorValue = parseInt(hashlessHex, 16)

    const red = (decimalColorValue >> 16) & 255
    const green = (decimalColorValue >> 8) & 255
    const blue = decimalColorValue & 255

    return { red, green, blue } 
  }

  /**
   * Returns the hex representation of an RGB color.
   * @param {*} param0 
   * @returns {string} The hex color code.
   */
  #rgbToHex ({ red, green, blue }) {
    const toHex = (colorValue) => {
      return colorValue.toString(16).padStart(2, '0')
    }

    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`
  }

  /**
   * Calculates the relative luminance of an RGB color according to WCAG guidelines and linearizes the color values.
   *
   * @param {number[]} rgbColor - An array containing the red, green, and blue components.
   * @param {number} rgbColor.0 - The red component (0-255).
   * @param {number} rgbColor.1 - The green component (0-255).
   * @param {number} rgbColor.2 - The blue component (0-255).
   * @returns {number} The relative luminance value.
   */
  #relativeLuminance ({ red, green, blue }) {
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
   * Calculates the contrast ratio between a foreground color and a background color
   * according to WCAG guidelines.
   *
   * @param {string} foreground - The foreground (e.g., text) color in hex format.
   * @param {string} background - The background color in hex format.
   * @returns {number} The contrast ratio between the two colors.
   */
  contrastRatio (foreground, background) {
    const luminanceForeground = this.#relativeLuminance(this.#hexToRgb(foreground))
    const luminanceBackground = this.#relativeLuminance(this.#hexToRgb(background))

    const brightestLuminance = Math.max(luminanceForeground, luminanceBackground)
    const darkestLuminance = Math.min(luminanceForeground, luminanceBackground)

    return (brightestLuminance + 0.05) / (darkestLuminance + 0.05)
  }

  /**
   * Checks if the contrast ratio between two colors meets the WCAG guidelines for a given level and text size.
   *
   * @param {object} params - The parameters object. The object should contain the following properties:
   * @param {string} params.foreground - The foreground color in hex format.
   * @param {string} params.background - The background color in hex format.
   * @param {string} [params.level='AA'] - The WCAG level to check against ('AA' or 'AAA').
   * @param {boolean} [params.isLargeText=false] - Whether the text is considered large (18pt or 14pt bold).
   * @returns {boolean} True if the colors pass the WCAG guidelines, false otherwise.
   */
passesWcag (wcagCheck) {
  const { foreground, background, level = 'AA', isLargeText = false } = wcagCheck
  const ratio = this.contrastRatio(foreground, background)

  if (isLargeText) return ratio >= 3
  if (level === 'AAA') return ratio >= 7
  return ratio >= 4.5
}

/**
 * Adjusts the brightness of a color channel (R, G, or B).
 * @param {*} channelValue 
 * @param {*} adjustmentFactor 
 * @returns {number} The adjusted channel value, clamped between 0 and 255.
 */
#adjustColorChannel(channelValue, adjustmentFactor) {
  const adjustedValue = channelValue + (channelValue * adjustmentFactor)

  return Math.round(Math.min(Math.max(adjustedValue, 0), 255))
}

/**
 * Adjusts the brightness of an RGB color.
 * @param {*} rgbColor 
 * @param {*} adjustmentFactor 
 * @returns {object} The adjusted RGB
 */
#adjustColorBrightness(rgbColor, adjustmentFactor) {
  return {
    r: this.#adjustColorChannel(rgbColor.r, adjustmentFactor),
    g: this.#adjustColorChannel(rgbColor.g, adjustmentFactor),
    b: this.#adjustColorChannel(rgbColor.b, adjustmentFactor)
  }
}

/**
 * Lightens a hex color by a given factor. Default factor 0.2 is 20% lighter.
 * @param {*} hexColor 
 * @param {*} factor 
 * @returns {string} The lightened hex color.
 */
lightenColor(hexColor, factor = 0.2) {
  const rgb = this.#hexToRgb(hexColor)
  const lightenedColor = this.#adjustColorBrightness(rgb, factor)
  return this.#rgbToHex(lightenedColor)
}
}
